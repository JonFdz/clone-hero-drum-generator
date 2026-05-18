import { extname } from "node:path";
import type { SourceKind } from "./types.js";
import { ProjectServiceError } from "./issues.js";

export function detectSourceKind(sourcePath: string): SourceKind {
	const extension = extname(sourcePath).toLowerCase();
	if (extension === ".mid" || extension === ".midi") {
		return "midi";
	}
	if (extension === ".gp") {
		return "gpif";
	}

	throw new ProjectServiceError(
		"UNSUPPORTED_SOURCE_TYPE",
		`Unsupported source type: ${extension || "(none)"}. Supported source types: .mid, .midi, .gp.`,
	);
}
