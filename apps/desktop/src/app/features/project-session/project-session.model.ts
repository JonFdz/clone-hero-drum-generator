import type { ChdgOutputStatus } from "@chdg/project/browser";
import type { ProjectStatePayload } from "../../services/desktop-bridge.service";

/**
 * A missing project path warning produced when opening a project whose on-disk
 * referenced files (source, audio, output, cover) are absent.
 */
export type MissingPathWarning = {
	kind: "sourcePath" | "audioPath" | "outputDir" | "coverImagePath";
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
	projectFilePath?: string;
	projectName: string;
	dirty: boolean;
	outputStatus: ChdgOutputStatus;
	missingPaths: MissingPathWarning[];
};

export type ProjectPersistenceError = {
	code: string;
	message: string;
};

/** A picker operation was cancelled by the user (not an error). */
export type PersistenceCancelled = { ok: false; cancelled: true };

export type CreateProjectOutcome =
	| { ok: true; payload: ProjectStatePayload }
	| { ok: false; error: ProjectPersistenceError };

export type OpenProjectOutcome =
	| { ok: true; payload: ProjectStatePayload; missingPaths: MissingPathWarning[] }
	| { ok: false; error: ProjectPersistenceError };

export type OpenFromPickerOutcome =
	| { ok: true; payload: ProjectStatePayload; missingPaths: MissingPathWarning[] }
	| PersistenceCancelled
	| { ok: false; error: ProjectPersistenceError };

export type SaveProjectOutcome =
	| { ok: true; filePath: string; payload: ProjectStatePayload }
	| { ok: false; error: ProjectPersistenceError };

export type SaveAsOutcome =
	| { ok: true; filePath: string; payload: ProjectStatePayload }
	| PersistenceCancelled
	| { ok: false; error: ProjectPersistenceError };

export const initialProjectSessionState: ProjectSessionState = {
	projectName: "Untitled",
	dirty: false,
	outputStatus: "not-generated",
	missingPaths: [],
};
