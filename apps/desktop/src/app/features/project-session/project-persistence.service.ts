import { Injectable, inject } from "@angular/core";
import {
	DesktopBridgeService,
	type ProjectStatePayload,
} from "../../services/desktop-bridge.service";
import { ProjectSessionStore } from "./project-session.store";
import { toMissingPathWarnings } from "./project-session.mapper";
import type {
	CreateProjectOutcome,
	OpenFromPickerOutcome,
	OpenProjectOutcome,
	ProjectPersistenceError,
	SaveAsOutcome,
	SaveProjectOutcome,
} from "./project-session.model";

const error = (code: string, message: string): ProjectPersistenceError => ({
	code,
	message,
});

export const PROJECT_PERSISTENCE_UNAVAILABLE_MESSAGE =
	"Canonical project creation and saving are not available in this legacy workflow.";

/**
 * Centralizes project persistence flows (create, open, save, save-as) and
 * hydrates the active {@link ProjectSessionStore}.
 *
 * The service returns typed outcomes and does NOT inject the Angular Router.
 * Pages and the application shell decide navigation after receiving an outcome.
 *
 * Recent-project refresh is intentionally left to callers (the legacy facade
 * and the shell) so this service stays free of cross-feature dependencies.
 */
@Injectable({ providedIn: "root" })
export class ProjectPersistenceService {
	private readonly bridge: DesktopBridgeService;
	private readonly session: ProjectSessionStore;

	constructor(
		bridge: DesktopBridgeService = inject(DesktopBridgeService),
		session: ProjectSessionStore = inject(ProjectSessionStore),
	) {
		this.bridge = bridge;
		this.session = session;
	}

	async createProject(name: string): Promise<CreateProjectOutcome> {
		void name;
		return {
			ok: false,
			error: error(
				"create_unavailable",
				PROJECT_PERSISTENCE_UNAVAILABLE_MESSAGE,
			),
		};
	}

	async openProject(filePath: string): Promise<OpenProjectOutcome> {
		try {
			const envelope = await this.bridge.openProject(filePath);
			if (!envelope.ok) {
				return { ok: false, error: error("open_failed", envelope.error.message) };
			}
			const { missingPaths, ...payload } = envelope.data;
			this.session.applyHydration(payload);
			this.session.setMissingPaths(toMissingPathWarnings(missingPaths, payload));
			return {
				ok: true,
				payload,
				missingPaths: toMissingPathWarnings(missingPaths, payload),
			};
		} catch (e) {
			return {
				ok: false,
				error: error("open_error", e instanceof Error ? e.message : "Open project failed."),
			};
		}
	}

	async openProjectFromPicker(): Promise<OpenFromPickerOutcome> {
		try {
			const picked = await this.bridge.openProjectFile();
			if (!picked) return { ok: false, cancelled: true };
			return await this.openProject(picked.path);
		} catch (e) {
			return {
				ok: false,
				error: error("open_picker_error", e instanceof Error ? e.message : "Open project failed."),
			};
		}
	}

	async saveProject(payload: ProjectStatePayload): Promise<SaveProjectOutcome> {
		void payload;
		return {
			ok: false,
			error: error(
				"save_unavailable",
				PROJECT_PERSISTENCE_UNAVAILABLE_MESSAGE,
			),
		};
	}

	async saveProjectAs(payload: ProjectStatePayload): Promise<SaveAsOutcome> {
		void payload;
		return {
			ok: false,
			error: error(
				"save_as_unavailable",
				PROJECT_PERSISTENCE_UNAVAILABLE_MESSAGE,
			),
		};
	}
}
