import { Injectable, computed, inject } from "@angular/core";
import type {
	ChdgOutputStatus,
	DesktopSettings,
	RecentProject,
} from "@chdg/project/browser";
import type {
	FfmpegDiagnostic,
	ProjectStatePayload,
} from "./desktop-bridge.service";
import { ProjectSessionStore } from "../features/project-session/project-session.store";
import { ProjectPersistenceService } from "../features/project-session/project-persistence.service";
import { ProjectLibraryService } from "../features/projects/project-library.service";
import { SettingsService } from "../features/settings/settings.service";
import type { MissingPathWarning } from "../features/project-session/project-session.model";

export type { MissingPathWarning } from "../features/project-session/project-session.model";

/**
 * Legacy merged view of renderer state, preserved for unmigrated pages and
 * services. It composes the active project session with recent projects,
 * settings, and FFmpeg diagnostics. New code should depend on the focused
 * boundaries ({@link ProjectSessionStore}, {@link ProjectLibraryService},
 * {@link SettingsService}) instead.
 */
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

/**
 * Transitional facade that preserves the pre-refactor public API of the old
 * monolithic project-state service while delegating to the new focused
 * boundaries introduced by the #74 foundation.
 *
 * Unmigrated pages and services keep importing this type. It is removed as
 * pages migrate to the canonical services in #75/#76 (see the follow-up
 * register). It does not own state itself: project identity/status lives in
 * {@link ProjectSessionStore}, recents in {@link ProjectLibraryService}, and
 * settings/FFmpeg in {@link SettingsService}.
 */
@Injectable({ providedIn: "root" })
export class DesktopProjectStateService {
	private readonly session: ProjectSessionStore;
	private readonly library: ProjectLibraryService;
	private readonly settings: SettingsService;
	private readonly persistence: ProjectPersistenceService;

	readonly state = computed<DesktopProjectState>(() => ({
		...this.session.state(),
		recentProjects: this.library.recentProjects(),
		settings: this.settings.settings(),
		ffmpegDiagnostic: this.settings.ffmpegDiagnostic(),
	}));

	readonly hasProject = computed(() => this.session.hasProject());
	readonly isDirty = computed(() => this.session.isDirty());
	readonly outputStatus = computed(() => this.session.outputStatus());
	readonly missingPathWarnings = computed(() => this.session.missingPathWarnings());

	constructor(
		session: ProjectSessionStore = inject(ProjectSessionStore),
		library: ProjectLibraryService = inject(ProjectLibraryService),
		settings: SettingsService = inject(SettingsService),
		persistence: ProjectPersistenceService = inject(ProjectPersistenceService),
	) {
		this.session = session;
		this.library = library;
		this.settings = settings;
		this.persistence = persistence;
	}

	async loadSettings(): Promise<void> {
		await this.settings.refresh();
	}

	async loadRecentProjects(): Promise<void> {
		await this.library.refresh();
	}

	async createProject(name: string): Promise<ProjectStatePayload | null> {
		const result = await this.persistence.createProject(name);
		if (!result.ok) {
			console.error("Create project failed:", result.error.message);
			return null;
		}
		await this.library.refresh();
		return result.payload;
	}

	async saveProject(
		payload: ProjectStatePayload,
	): Promise<{ filePath: string; payload: ProjectStatePayload } | null> {
		const result = await this.persistence.saveProject(payload);
		if (!result.ok) {
			console.error("Save project failed:", result.error.message);
			return null;
		}
		await this.library.refresh();
		return { filePath: result.filePath, payload: result.payload };
	}

	async saveProjectAs(payload: ProjectStatePayload): Promise<string | null> {
		const result = await this.persistence.saveProjectAs(payload);
		if (!result.ok) {
			if ("cancelled" in result) return null;
			console.error("Save project as failed:", result.error.message);
			return null;
		}
		await this.library.refresh();
		return result.filePath;
	}

	async openProject(filePath: string): Promise<ProjectStatePayload | null> {
		const result = await this.persistence.openProject(filePath);
		if (!result.ok) {
			console.error("Open project failed:", result.error.message);
			return null;
		}
		await this.library.refresh();
		return result.payload;
	}

	async removeRecentProject(projectPath: string): Promise<void> {
		await this.library.remove(projectPath);
	}

	async deleteProjectFile(projectPath: string): Promise<boolean> {
		const ok = await this.library.deleteFile(projectPath);
		if (ok && this.session.projectFilePath() === projectPath) {
			this.session.resetActiveProject();
		}
		return ok;
	}

	async saveSettings(settings: DesktopSettings): Promise<void> {
		await this.settings.save(settings);
	}

	async testFfmpeg(input: string): Promise<FfmpegDiagnostic | null> {
		return this.settings.testFfmpeg(input);
	}

	markDirty(): void {
		this.session.markDirty();
	}

	markNeedsRegenerate(): void {
		this.session.markNeedsRegenerate();
	}

	markGenerated(): void {
		this.session.markGenerated();
	}

	markFailed(): void {
		this.session.markFailed();
	}

	setMissingPaths(warnings: MissingPathWarning[]): void {
		this.session.setMissingPaths(warnings);
	}

	clearMissingPaths(): void {
		this.session.clearMissingPaths();
	}

	setProjectName(name: string): void {
		this.session.setProjectName(name);
	}

	setProjectFilePath(filePath: string): void {
		this.session.setProjectFilePath(filePath);
	}

	resetActiveProject(): void {
		this.session.resetActiveProject();
	}
}
