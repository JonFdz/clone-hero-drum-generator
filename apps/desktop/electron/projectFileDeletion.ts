export const CANONICAL_PROJECT_DELETE_NOT_AVAILABLE =
	"CANONICAL_PROJECT_DELETE_NOT_AVAILABLE";

export const CANONICAL_PROJECT_DELETE_NOT_AVAILABLE_MESSAGE =
	"Whole-project deletion requires a dedicated canonical filesystem contract and is not available in this legacy workflow.";

export class ProjectFileDeletionError extends Error {
	constructor(
		readonly code: typeof CANONICAL_PROJECT_DELETE_NOT_AVAILABLE,
		message: string,
	) {
		super(message);
		this.name = "ProjectFileDeletionError";
	}
}

/**
 * Retained only for the legacy IPC compatibility surface.
 *
 * A canonical project is the complete self-contained folder, so deleting only
 * project.chdg is unsafe. Physical deletion remains unavailable until a
 * dedicated whole-project filesystem contract owns it.
 */
export async function deleteProjectFilePath(_filePath: string): Promise<never> {
	throw new ProjectFileDeletionError(
		CANONICAL_PROJECT_DELETE_NOT_AVAILABLE,
		CANONICAL_PROJECT_DELETE_NOT_AVAILABLE_MESSAGE,
	);
}
