import type { JsonEnvelope, ProjectIssue } from "./types.js";

export type ChdgOutputStatus =
	| "not-generated"
	| "generated"
	| "needs-regenerate"
	| "failed";

export type ChdgProjectFile = {
	schemaVersion: number;
	appVersion?: string;
	project: {
		name: string;
		createdAt: string;
		updatedAt: string;
	};
	paths: {
		sourcePath?: string;
		audioPath?: string;
		outputDir?: string;
	};
	source?: {
		sourceKind?: "midi" | "gpif";
		inspectionSummary?: unknown;
	};
	selection: {
		selectedTracks: number[];
	};
	metadata: {
		name?: string;
		artist?: string;
		album?: string;
		year?: string;
		genre?: string;
		charter?: string;
	};
	generation: {
		offsetMs?: number;
		status: ChdgOutputStatus;
		lastGeneratedAt?: string;
		outputFiles?: {
			chart?: string;
			songIni?: string;
			songOgg?: string;
		};
		lastResultSummary?: unknown;
	};
	settings?: Record<string, unknown>;
};

export type ChdgProjectFileValidationResult = {
	ok: true;
	project: ChdgProjectFile;
} | {
	ok: false;
	code: string;
	message: string;
};

export function validateProjectFile(data: unknown): ChdgProjectFileValidationResult {
	if (typeof data !== "object" || data === null || Array.isArray(data)) {
		return { ok: false, code: "INVALID_PROJECT_FILE", message: "Project file is not a valid object." };
	}

	const obj = data as Record<string, unknown>;

	const schemaVersion = obj["schemaVersion"];
	if (typeof schemaVersion !== "number") {
		return { ok: false, code: "MISSING_SCHEMA_VERSION", message: "Project file is missing schemaVersion." };
	}
	if (schemaVersion !== 1) {
		return { ok: false, code: "UNSUPPORTED_PROJECT_VERSION", message: `Unsupported project schema version: ${schemaVersion}.` };
	}

	const project = obj["project"];
	if (typeof project !== "object" || project === null || Array.isArray(project)) {
		return { ok: false, code: "INVALID_PROJECT_SECTION", message: "Project file is missing a valid 'project' section." };
	}

	const projectObj = project as Record<string, unknown>;
	const name = projectObj["name"];
	if (typeof name !== "string" || name.trim().length === 0) {
		return { ok: false, code: "INVALID_PROJECT_NAME", message: "Project name is required." };
	}

	const createdAt = projectObj["createdAt"];
	if (typeof createdAt !== "string") {
		return { ok: false, code: "INVALID_PROJECT_CREATED_AT", message: "Project createdAt is required." };
	}

	const updatedAt = projectObj["updatedAt"];
	if (typeof updatedAt !== "string") {
		return { ok: false, code: "INVALID_PROJECT_UPDATED_AT", message: "Project updatedAt is required." };
	}

	const paths = obj["paths"];
	if (typeof paths !== "object" || paths === null || Array.isArray(paths)) {
		return { ok: false, code: "INVALID_PATHS_SECTION", message: "Project file is missing a valid 'paths' section." };
	}

	const selection = obj["selection"];
	if (typeof selection !== "object" || selection === null || Array.isArray(selection)) {
		return { ok: false, code: "INVALID_SELECTION_SECTION", message: "Project file is missing a valid 'selection' section." };
	}

	const selectedTracks = (selection as Record<string, unknown>)["selectedTracks"];
	if (!Array.isArray(selectedTracks) || selectedTracks.some((t) => typeof t !== "number" || !Number.isFinite(t))) {
		return { ok: false, code: "INVALID_SELECTED_TRACKS", message: "selectedTracks must be an array of numbers." };
	}

	const metadata = obj["metadata"];
	if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
		return { ok: false, code: "INVALID_METADATA_SECTION", message: "Project file is missing a valid 'metadata' section." };
	}

	const generation = obj["generation"];
	if (typeof generation !== "object" || generation === null || Array.isArray(generation)) {
		return { ok: false, code: "INVALID_GENERATION_SECTION", message: "Project file is missing a valid 'generation' section." };
	}

	const generationObj = generation as Record<string, unknown>;
	const status = generationObj["status"];
	const validStatuses: ChdgOutputStatus[] = ["not-generated", "generated", "needs-regenerate", "failed"];
	if (!validStatuses.includes(status as ChdgOutputStatus)) {
		return { ok: false, code: "INVALID_GENERATION_STATUS", message: `Invalid generation status: ${status}.` };
	}

	return {
		ok: true,
		project: obj as unknown as ChdgProjectFile,
	};
}

export function createProjectFile(
	name: string,
	appVersion: string | undefined,
	overrides: Partial<ChdgProjectFile> = {},
): ChdgProjectFile {
	const now = new Date().toISOString();
	return {
		schemaVersion: 1,
		appVersion,
		project: {
			name,
			createdAt: now,
			updatedAt: now,
		},
		paths: {},
		selection: {
			selectedTracks: [],
		},
		metadata: {},
		generation: {
			status: "not-generated",
		},
		...overrides,
	};
}
