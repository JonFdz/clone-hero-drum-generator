import { Injectable, inject } from "@angular/core";
import { DesktopBridgeService } from "../services/desktop-bridge.service";
import { SettingsService } from "../features/settings/settings.service";
import { ProjectLibraryService } from "../features/projects/project-library.service";

/**
 * Coordinates application-wide startup concerns for the Angular renderer.
 *
 * This is the core service introduced by the #74 foundation. It owns the
 * bootstrap sequence (desktop health, persisted settings, recent projects) and
 * re-exposes desktop health/app info signals so the application shell does not
 * need to import {@link DesktopBridgeService} directly.
 *
 * The desktop bridge remains the sole Electron/preload boundary. It currently
 * lives at `services/desktop-bridge.service.ts`; relocating it into `core/` is
 * recorded in the architecture follow-up register.
 */
@Injectable({ providedIn: "root" })
export class ApplicationStartupService {
	private readonly bridge: DesktopBridgeService;
	private readonly settings: SettingsService;
	private readonly library: ProjectLibraryService;

	private started = false;
	private initPromise: Promise<void> | null = null;

	constructor(
		bridge: DesktopBridgeService = inject(DesktopBridgeService),
		settings: SettingsService = inject(SettingsService),
		library: ProjectLibraryService = inject(ProjectLibraryService),
	) {
		this.bridge = bridge;
		this.settings = settings;
		this.library = library;
	}

	/** Desktop health signal, sourced from the bridge boundary. */
	get health() {
		return this.bridge.health;
	}

	/** Desktop app info signal, sourced from the bridge boundary. */
	get appInfo() {
		return this.bridge.appInfo;
	}

	/**
	 * Runs the bootstrap sequence.
	 *
	 * Concurrent calls share one in-flight initialization. A failed bootstrap
	 * can be retried (the in-flight promise is cleared on failure). A
	 * successful bootstrap is idempotent: later calls resolve immediately.
	 * Unexpected bootstrap errors propagate to the caller; this method does
	 * not swallow them.
	 */
	initialize(): Promise<void> {
		if (this.started) return Promise.resolve();
		if (this.initPromise) return this.initPromise;
		this.initPromise = this.runBootstrap()
			.then(() => {
				this.started = true;
				this.initPromise = null;
			})
			.catch((error) => {
				// Clear the in-flight promise so a failed bootstrap can be retried.
				this.initPromise = null;
				throw error;
			});
		return this.initPromise;
	}

	private async runBootstrap(): Promise<void> {
		void this.bridge.loadStatus();
		await this.settings.refresh();
		await this.library.refresh();
	}

	/** Reloads recent projects. Exposed for shell/project actions that refresh recents. */
	async refreshRecentProjects(): Promise<void> {
		await this.library.refresh();
	}
}
