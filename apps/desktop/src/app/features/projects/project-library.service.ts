import { Injectable, inject, signal } from "@angular/core";
import type { RecentProject } from "@chdg/project/browser";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";

/**
 * Seed service for the Projects feature: owns the recent-projects library.
 *
 * Introduced by the #74 foundation to move recent-project data out of the
 * active project session. The Projects page/feature is fully migrated in #75;
 * until then the legacy {@link DesktopProjectStateService} facade delegates
 * recents operations here.
 */
@Injectable({ providedIn: "root" })
export class ProjectLibraryService {
	private readonly bridge: DesktopBridgeService;

	readonly recentProjects = signal<RecentProject[]>([]);
	readonly loading = signal(false);
	readonly error = signal<string | null>(null);
	static readonly deleteUnavailableMessage =
		"Whole-project deletion requires a dedicated canonical filesystem contract and is not available in this legacy workflow.";

	constructor(bridge: DesktopBridgeService = inject(DesktopBridgeService)) {
		this.bridge = bridge;
	}

	/** Reloads recent projects from the desktop bridge. */
	async refresh(): Promise<void> {
		this.loading.set(true);
		this.error.set(null);
		try {
			const envelope = await this.bridge.readRecentProjects();
			if (envelope.ok) {
				this.recentProjects.set(envelope.data);
			} else {
				this.error.set(envelope.error.message);
			}
		} catch (error) {
			// Keep current list on failure.
			this.error.set(error instanceof Error ? error.message : "Unable to load recent projects.");
		} finally {
			this.loading.set(false);
		}
	}

	/** Removes a project from the recents list and refreshes. */
	async remove(projectPath: string): Promise<void> {
		try {
			await this.bridge.removeRecentProject(projectPath);
			await this.refresh();
		} catch {
			// Ignore.
		}
	}

	/** Retained compatibility facade; physical canonical project deletion is unavailable. */
	async deleteFile(projectPath: string): Promise<boolean> {
		void projectPath;
		this.error.set(ProjectLibraryService.deleteUnavailableMessage);
		return false;
	}
}
