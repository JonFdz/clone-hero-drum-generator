import type {
	ChdgProjectFile,
	ProjectMappingOverrides,
} from "@chdg/project/browser";
import type { ProjectStatePayload } from "../../services/desktop-bridge.service";
import type { MissingPathWarning } from "./project-session.model";

/**
 * Maps a persisted {@link ChdgProjectFile} back into the bridge payload shape
 * used to hydrate the active project session.
 */
export function projectFileToPayload(
	projectFilePath: string,
	project: ChdgProjectFile,
): ProjectStatePayload {
	return {
		projectName: project.project.name,
		projectFilePath,
		sourcePath: project.paths.sourcePath,
		audioPath: project.paths.audioPath,
		outputDir: project.paths.outputDir,
		cover: project.cover,
		sourceKind: project.source?.sourceKind,
		selectedTracks: project.selection.selectedTracks,
		metadata: project.metadata,
		offsetMs: project.generation.offsetMs,
		generationStatus: project.generation.status,
		lastGeneratedAt: project.generation.lastGeneratedAt,
		outputFiles: project.generation.outputFiles,
		mappingOverrides:
			project.mappingOverrides as ProjectMappingOverrides | undefined,
		analysis: project.analysis,
	};
}

/** Builds a missing-path warning for a single missing path kind. */
export function missingPathWarning(
	kind: MissingPathWarning["kind"],
	payload: ProjectStatePayload,
): MissingPathWarning {
	if (kind === "coverImagePath") {
		return {
			kind,
			path: payload.cover?.imagePath,
			message: `Missing cover image: ${payload.cover?.imagePath ?? "unknown"}`,
		};
	}
	return {
		kind,
		path: payload[kind],
		message: `Missing ${kind}: ${payload[kind] ?? "unknown"}`,
	};
}

/** Builds missing-path warnings for each missing path kind reported on open. */
export function toMissingPathWarnings(
	kinds: string[],
	payload: ProjectStatePayload,
): MissingPathWarning[] {
	return kinds.map((kind) =>
		missingPathWarning(kind as MissingPathWarning["kind"], payload),
	);
}
