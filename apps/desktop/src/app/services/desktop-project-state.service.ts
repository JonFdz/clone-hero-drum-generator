import { Injectable, computed, signal } from "@angular/core";
import type {
	ChdgOutputStatus,
	DesktopSettings,
	RecentProject,
} from "@chdg/project/browser";
import { DesktopBridgeService } from "./desktop-bridge.service";
import type {
	FfmpegDiagnostic,
	ProjectStatePayload,
} from "./desktop-bridge.service";

export type MissingPathWarning = {
	kind: "sourcePath" | "audioPath" | "outputDir";
	path?: string;
	message: string;
};

export type DesktopProjectState = {
	projectFilePath?: string;
	projectName: string;
	dirty: boolean;
	outputStatus: ChdgOutputStatus;
	missingPaths: MissingPathWarning[];
	recentProjects: RecentProject[];
	settings: DesktopSettings;
	ffmpegDiagnostic?: FfmpegDiagnostic;
};

const initialState: DesktopProjectState = {
	projectName: "Untitled",
	dirty: false,
	outputStatus: "not-generated",
	missingPaths: [],
	recentProjects: [],
	settings: {
		schemaVersion: 1,
		theme: "dark",
		projectLocation: "",
	},
};

@Injectable({ providedIn: "root" })
export class DesktopProjectStateService {
	readonly state = signal<DesktopProjectState>(initialState);

	readonly hasProject = computed(
		() =>
			this.state().projectName !== "Untitled" || !!this.state().projectFilePath,
	);
	readonly isDirty = computed(() => this.state().dirty);
	readonly outputStatus = computed(() => this.state().outputStatus);
	readonly missingPathWarnings = computed(() => this.state().missingPaths);

	async loadSettings(): Promise<void> {
		try {
			const envelope = await this.bridge.readSettings();
			if (envelope.ok) {
				this.patch({ settings: envelope.data });
			}
		} catch {
			// Keep defaults
		}
	}

	async loadRecentProjects(): Promise<void> {
		try {
			const envelope = await this.bridge.readRecentProjects();
			if (envelope.ok) {
				this.patch({ recentProjects: envelope.data });
			}
		} catch {
			// Keep defaults
		}
	}

	async createProject(name: string): Promise<boolean> {
		try {
			const envelope = await this.bridge.createProject({ projectName: name });
			if (!envelope.ok) {
				console.error("Create project failed:", envelope.error.message);
				return false;
			}
			this.applyProjectState(envelope.data);
			this.patch({ dirty: false });
			return true;
		} catch (error) {
			console.error("Create project error:", error);
			return false;
		}
	}

	async saveProject(payload: ProjectStatePayload): Promise<string | null> {
		try {
			const envelope = await this.bridge.saveProject(payload);
			if (!envelope.ok) {
				console.error("Save project failed:", envelope.error.message);
				return null;
			}
			this.patch({
				projectFilePath: envelope.data.filePath,
				projectName: payload.projectName,
				dirty: false,
			});
			await this.loadRecentProjects();
			return envelope.data.filePath;
		} catch (error) {
			console.error("Save project error:", error);
			return null;
		}
	}

	async saveProjectAs(
		payload: ProjectStatePayload & { filePath: string },
	): Promise<string | null> {
		try {
			const envelope = await this.bridge.saveProjectAs(payload);
			if (!envelope.ok) {
				console.error("Save project as failed:", envelope.error.message);
				return null;
			}
			this.patch({
				projectFilePath: envelope.data.filePath,
				projectName: payload.projectName,
				dirty: false,
			});
			await this.loadRecentProjects();
			return envelope.data.filePath;
		} catch (error) {
			console.error("Save project as error:", error);
			return null;
		}
	}

	async openProject(filePath: string): Promise<ProjectStatePayload | null> {
		try {
			const envelope = await this.bridge.openProject(filePath);
			if (!envelope.ok) {
				console.error("Open project failed:", envelope.error.message);
				return null;
			}
			const { missingPaths, ...payload } = envelope.data;
			this.applyProjectState(payload);
			this.patch({
				dirty: false,
				missingPaths: missingPaths.map((kind) => ({
					kind: kind as MissingPathWarning["kind"],
					path: payload[kind as keyof typeof payload] as string | undefined,
					message: `Missing ${kind}: ${payload[kind as keyof typeof payload] as string | undefined}`,
				})),
			});
			await this.loadRecentProjects();
			return payload;
		} catch (error) {
			console.error("Open project error:", error);
			return null;
		}
	}

	async removeRecentProject(projectPath: string): Promise<void> {
		try {
			await this.bridge.removeRecentProject(projectPath);
			await this.loadRecentProjects();
		} catch {
			// Ignore
		}
	}

	async saveSettings(settings: DesktopSettings): Promise<void> {
		try {
			const envelope = await this.bridge.writeSettings(settings);
			if (envelope.ok) {
				this.patch({ settings: envelope.data });
			}
		} catch {
			// Ignore
		}
	}

	async testFfmpeg(input: string): Promise<FfmpegDiagnostic | null> {
		try {
			const envelope = await this.bridge.testFfmpeg(input);
			if (envelope.ok) {
				this.patch({ ffmpegDiagnostic: envelope.data });
				return envelope.data;
			}
			const diagnostic: FfmpegDiagnostic = {
				available: false,
				message: envelope.error.message,
			};
			this.patch({ ffmpegDiagnostic: diagnostic });
			return diagnostic;
		} catch (error) {
			const diagnostic: FfmpegDiagnostic = {
				available: false,
				message:
					error instanceof Error ? error.message : "FFmpeg check failed.",
			};
			this.patch({ ffmpegDiagnostic: diagnostic });
			return diagnostic;
		}
	}

	markDirty(): void {
		this.patch({ dirty: true });
	}

	markNeedsRegenerate(): void {
		if (this.state().outputStatus === "generated") {
			this.patch({ outputStatus: "needs-regenerate", dirty: true });
		} else {
			this.patch({ dirty: true });
		}
	}

	markGenerated(): void {
		this.patch({ outputStatus: "generated", dirty: true });
	}

	markFailed(): void {
		this.patch({ outputStatus: "failed", dirty: true });
	}

	setMissingPaths(warnings: MissingPathWarning[]): void {
		this.patch({ missingPaths: warnings });
	}

	clearMissingPaths(): void {
		this.patch({ missingPaths: [] });
	}

	setProjectName(name: string): void {
		this.patch({ projectName: name, dirty: true });
	}

	setProjectFilePath(filePath: string): void {
		this.patch({ projectFilePath: filePath });
	}

	private applyProjectState(payload: ProjectStatePayload): void {
		this.patch({
			projectName: payload.projectName,
			projectFilePath: payload.projectFilePath,
			outputStatus: payload.generationStatus,
		});
	}

	private patch(patch: Partial<DesktopProjectState>): void {
		this.state.update((state) => ({ ...state, ...patch }));
	}

	constructor(private readonly bridge: DesktopBridgeService) {}
}
