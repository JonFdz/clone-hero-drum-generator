import type {
	ProjectMissingPathKind,
	ProjectStatePayload,
} from "../../services/desktop-bridge.service";
import type { DesktopOutputStatus } from "../../services/desktop-project-runtime";
import type { DesktopProjectIdentity } from "../../services/desktop-project-runtime";

/**
 * A missing project path warning produced when opening a project whose on-disk
 * referenced files (source, audio, output, cover) are absent.
 */
export type MissingPathWarning = {
	kind: ProjectMissingPathKind;
	path?: string;
	message: string;
};

/**
 * Active project session state.
 *
 * The session store holds ONLY the identity and status of the project being
 * edited. It deliberately does not own recent projects, application settings,
 * FFmpeg diagnostics, app health, or router state; those live in their own
 * feature/core services.
 */
export type ProjectSessionState = {
	project?: DesktopProjectIdentity;
	projectFilePath?: string;
	projectName: string;
	dirty: boolean;
	outputStatus: DesktopOutputStatus;
	missingPaths: MissingPathWarning[];
};

export type ProjectPersistenceError = {
	code: string;
	message: string;
};

export type CreateProjectOutcome =
	| { ok: true; payload: ProjectStatePayload }
	| { ok: false; error: ProjectPersistenceError };

export type OpenProjectOutcome =
	| { ok: true; payload: ProjectStatePayload; missingPaths: MissingPathWarning[] }
	| { ok: false; error: ProjectPersistenceError };

export type OpenFromPickerOutcome =
	| { ok: true; payload: ProjectStatePayload; missingPaths: MissingPathWarning[] }
	| { ok: false; cancelled: true }
	| { ok: false; error: ProjectPersistenceError };

export type SaveProjectOutcome =
	| { ok: true; filePath: string; payload: ProjectStatePayload }
	| { ok: false; error: ProjectPersistenceError };

export type SaveAsOutcome =
	| { ok: true; filePath: string; payload: ProjectStatePayload }
	| { ok: false; error: ProjectPersistenceError };

export const initialProjectSessionState: ProjectSessionState = {
	projectName: "Untitled",
	dirty: false,
	outputStatus: "not-generated",
	missingPaths: [],
};
