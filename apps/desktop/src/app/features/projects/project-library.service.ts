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

	constructor(bridge: DesktopBridgeService = inject(DesktopBridgeService)) {
		this.bridge = bridge;
	}

	/** Reloads recent projects from the desktop bridge. */
	async refresh(): Promise<void> {
		try {
			const envelope = await this.bridge.readRecentProjects();
			if (envelope.ok) {
				this.recentProjects.set(envelope.data);
			}
		} catch {
			// Keep current list on failure.
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

	/** Deletes a project file from disk and refreshes recents. Returns success. */
	async deleteFile(projectPath: string): Promise<boolean> {
		try {
			const envelope = await this.bridge.deleteProjectFile(projectPath);
			if (!envelope.ok) {
				console.error("Delete project failed:", envelope.error.message);
				return false;
			}
			await this.refresh();
			return true;
		} catch (e) {
			console.error("Delete project error:", e);
			return false;
		}
	}
}
