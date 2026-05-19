import { Injectable, signal } from "@angular/core";
import type {
	GeneratePackageInput,
	GeneratePackageResult,
	InspectSourceInput,
	JsonEnvelope,
	NormalizationPreview,
	NormalizeSelectionInput,
	SourceInspectionResult,
	ChdgProjectFile,
	ChdgOutputStatus,
	DesktopSettings,
	RecentProject,
} from "@chdg/project";
import { unavailableDesktopHealth } from "./desktop-bridge-model";

export type DesktopAppInfo = {
	name: string;
	version: string;
	mode: "desktop";
};

export type DesktopHealthStatus = {
	ok: boolean;
	appVersion: string;
	mode: "desktop";
	checks: {
		bridge: boolean;
	};
	message?: string;
};

export type PickedPath = {
	path: string;
	name: string;
};

export type OpenOutputFolderResult = {
	opened: true;
};

export type FfmpegDiagnostic = {
	available: boolean;
	version?: string;
	path?: string;
	message: string;
};

export type ProjectStatePayload = {
	projectName: string;
	projectFilePath?: string;
	sourcePath?: string;
	audioPath?: string;
	outputDir?: string;
	sourceKind?: "midi" | "gpif";
	selectedTracks: number[];
	metadata: {
		name?: string;
		artist?: string;
		album?: string;
		year?: string;
		genre?: string;
		charter?: string;
	};
	offsetMs?: number;
	generationStatus: ChdgOutputStatus;
	lastGeneratedAt?: string;
	outputFiles?: {
		chart?: string;
		songIni?: string;
		songOgg?: string;
	};
};

export type SaveProjectResult = {
	filePath: string;
	project: ChdgProjectFile;
};

const unavailableHealth = unavailableDesktopHealth();

@Injectable({ providedIn: "root" })
export class DesktopBridgeService {
	readonly appInfo = signal<DesktopAppInfo | null>(null);
	readonly health = signal<DesktopHealthStatus>(unavailableHealth);

	async loadStatus(): Promise<void> {
		const bridge = window.chdg;

		if (!bridge) {
			this.health.set(unavailableHealth);
			return;
		}

		try {
			const [appInfo, health] = await Promise.all([
				bridge.getAppInfo(),
				bridge.getHealth(),
			]);

			this.appInfo.set(appInfo);
			this.health.set(health);
		} catch (error) {
			this.health.set({
				...unavailableHealth,
				message:
					error instanceof Error ? error.message : unavailableHealth.message,
			});
		}
	}

	async pickSourceFile(): Promise<PickedPath | null> {
		return this.requireBridge().pickSourceFile();
	}

	async pickAudioFile(): Promise<PickedPath | null> {
		return this.requireBridge().pickAudioFile();
	}

	async pickOutputFolder(): Promise<PickedPath | null> {
		return this.requireBridge().pickOutputFolder();
	}

	async inspectSource(
		input: InspectSourceInput,
	): Promise<JsonEnvelope<SourceInspectionResult>> {
		return this.requireBridge().inspectSource(input);
	}

	async normalizeSelection(
		input: NormalizeSelectionInput,
	): Promise<JsonEnvelope<NormalizationPreview>> {
		return this.requireBridge().normalizeSelection(input);
	}

	async generatePackage(
		input: GeneratePackageInput & { overwriteKnownFiles?: boolean },
	): Promise<JsonEnvelope<GeneratePackageResult>> {
		return this.requireBridge().generatePackage(input);
	}

	async openOutputFolder(
		folderPath: string,
	): Promise<JsonEnvelope<OpenOutputFolderResult>> {
		return this.requireBridge().openOutputFolder(folderPath);
	}

	// Project persistence
	async saveProjectFile(
		projectName: string,
		currentPath?: string,
	): Promise<PickedPath | null> {
		return this.requireBridge().saveProjectFile(projectName, currentPath);
	}

	async openProjectFile(): Promise<PickedPath | null> {
		return this.requireBridge().openProjectFile();
	}

	async createProject(
		input: { projectName: string },
	): Promise<JsonEnvelope<ProjectStatePayload>> {
		return this.requireBridge().createProject(input);
	}

	async saveProject(
		input: ProjectStatePayload,
	): Promise<JsonEnvelope<SaveProjectResult>> {
		return this.requireBridge().saveProject(input);
	}

	async saveProjectAs(
		input: ProjectStatePayload & { filePath: string },
	): Promise<JsonEnvelope<SaveProjectResult>> {
		return this.requireBridge().saveProjectAs(input);
	}

	async openProject(
		filePath: string,
	): Promise<JsonEnvelope<ProjectStatePayload & { missingPaths: string[] }>> {
		return this.requireBridge().openProject(filePath);
	}

	async readRecentProjects(): Promise<JsonEnvelope<RecentProject[]>> {
		return this.requireBridge().readRecentProjects();
	}

	async removeRecentProject(
		projectPath: string,
	): Promise<JsonEnvelope<void>> {
		return this.requireBridge().removeRecentProject(projectPath);
	}

	async readSettings(): Promise<JsonEnvelope<DesktopSettings>> {
		return this.requireBridge().readSettings();
	}

	async writeSettings(
		settings: DesktopSettings,
	): Promise<JsonEnvelope<DesktopSettings>> {
		return this.requireBridge().writeSettings(settings);
	}

	async testFfmpeg(input: string): Promise<JsonEnvelope<FfmpegDiagnostic>> {
		return this.requireBridge().testFfmpeg(input);
	}

	private requireBridge(): NonNullable<Window["chdg"]> {
		if (!window.chdg) {
			throw new Error(unavailableHealth.message);
		}
		return window.chdg;
	}
}
