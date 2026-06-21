import { Injectable, inject } from "@angular/core";
import {
	DesktopBridgeService,
	type ProjectStatePayload,
} from "../../services/desktop-bridge.service";
import { ProjectSessionStore } from "./project-session.store";
import {
	projectFileToPayload,
	toMissingPathWarnings,
} from "./project-session.mapper";
import type {
	CreateProjectOutcome,
	OpenFromPickerOutcome,
	OpenProjectOutcome,
	PersistenceCancelled,
	ProjectPersistenceError,
	SaveAsOutcome,
	SaveProjectOutcome,
} from "./project-session.model";

const cancelled = (): PersistenceCancelled => ({ ok: false, cancelled: true });
const error = (code: string, message: string): ProjectPersistenceError => ({
	code,
	message,
});

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
		try {
			const envelope = await this.bridge.createProject({
				projectName: name,
			});
			if (!envelope.ok) {
				return { ok: false, error: error("create_failed", envelope.error.message) };
			}
			this.session.applyHydration(envelope.data);
			return { ok: true, payload: envelope.data };
		} catch (e) {
			return {
				ok: false,
				error: error("create_error", e instanceof Error ? e.message : "Create project failed."),
			};
		}
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
			if (!picked) return cancelled();
			return await this.openProject(picked.path);
		} catch (e) {
			return {
				ok: false,
				error: error("open_picker_error", e instanceof Error ? e.message : "Open project failed."),
			};
		}
	}

	async saveProject(payload: ProjectStatePayload): Promise<SaveProjectOutcome> {
		try {
			const envelope = await this.bridge.saveProject(payload);
			if (!envelope.ok) {
				return { ok: false, error: error("save_failed", envelope.error.message) };
			}
			const savedPayload = projectFileToPayload(
				envelope.data.filePath,
				envelope.data.project,
			);
			this.session.applyHydration(savedPayload);
			return { ok: true, filePath: envelope.data.filePath, payload: savedPayload };
		} catch (e) {
			return {
				ok: false,
				error: error("save_error", e instanceof Error ? e.message : "Save project failed."),
			};
		}
	}

	async saveProjectAs(payload: ProjectStatePayload): Promise<SaveAsOutcome> {
		try {
			const picked = await this.bridge.saveProjectFile(
				payload.projectName,
				payload.projectFilePath,
			);
			if (!picked) return cancelled();
			const envelope = await this.bridge.saveProjectAs({
				...payload,
				filePath: picked.path,
			});
			if (!envelope.ok) {
				return { ok: false, error: error("save_as_failed", envelope.error.message) };
			}
			const savedPayload = projectFileToPayload(
				envelope.data.filePath,
				envelope.data.project,
			);
			this.session.applyHydration(savedPayload);
			return { ok: true, filePath: envelope.data.filePath, payload: savedPayload };
		} catch (e) {
			return {
				ok: false,
				error: error("save_as_error", e instanceof Error ? e.message : "Save project failed."),
			};
		}
	}
}
