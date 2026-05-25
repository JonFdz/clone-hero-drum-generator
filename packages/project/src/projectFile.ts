import { validateMappingOverrides } from "./mappingOverrides.js";
import type {
	ChdgOutputStatus,
	ChdgProjectAnalysisCache,
	ChdgProjectFile,
	ChdgSourceFingerprint,
} from "./projectFileTypes.js";
export type {
	ChdgOutputStatus,
	ChdgProjectAnalysisCache,
	ChdgProjectFile,
	ChdgSourceFingerprint,
} from "./projectFileTypes.js";

export type ChdgProjectFileValidationResult =
	| {
			ok: true;
			project: ChdgProjectFile;
	  }
	| {
			ok: false;
			code: string;
			message: string;
	  };

class ProjectFileValidationError extends Error {
	constructor(
		readonly code: string,
		message: string,
	) {
		super(message);
		this.name = "ProjectFileValidationError";
	}
}

export function validateProjectFile(
	data: unknown,
): ChdgProjectFileValidationResult {
	try {
		const obj = assertRecord(
			data,
			"INVALID_PROJECT_FILE",
			"Project file is not a valid object.",
		);

		const schemaVersion = obj["schemaVersion"];
		if (typeof schemaVersion !== "number") {
			throw new ProjectFileValidationError(
				"MISSING_SCHEMA_VERSION",
				"Project file is missing schemaVersion.",
			);
		}
		if (schemaVersion !== 1) {
			throw new ProjectFileValidationError(
				"UNSUPPORTED_PROJECT_VERSION",
				`Unsupported project schema version: ${schemaVersion}.`,
			);
		}

		const appVersion = optionalStringField(
			obj,
			"appVersion",
			"INVALID_APP_VERSION",
			"appVersion must be a string.",
		);
		const project = validateProjectSection(obj["project"]);
		const paths = validatePaths(obj["paths"]);
		const cover = validateCover(obj["cover"]);
		const source = validateSource(obj["source"]);
		const selection = validateSelection(obj["selection"]);
		const metadata = validateMetadata(obj["metadata"]);
		const generation = validateGeneration(obj["generation"]);
		const settings = validateSettings(obj["settings"]);
		const mappingOverrides = validateMappingOverridesField(
			obj["mappingOverrides"],
		);
		const analysis = validateAnalysisCache(obj["analysis"]);

		const safeProject: ChdgProjectFile = {
			schemaVersion: 1,
			project,
			paths,
			selection,
			metadata,
			generation,
		};

		if (appVersion !== undefined) {
			safeProject.appVersion = appVersion;
		}
		if (cover !== undefined) {
			safeProject.cover = cover;
		}
		if (source !== undefined) {
			safeProject.source = source;
		}
		if (settings !== undefined) {
			safeProject.settings = settings;
		}
		if (Object.keys(mappingOverrides).length > 0) {
			safeProject.mappingOverrides = mappingOverrides;
		}
		if (analysis !== undefined) {
			safeProject.analysis = analysis;
		}

		return {
			ok: true,
			project: safeProject,
		};
	} catch (error) {
		if (error instanceof ProjectFileValidationError) {
			return {
				ok: false,
				code: error.code,
				message: error.message,
			};
		}
		return {
			ok: false,
			code: "INVALID_PROJECT_FILE",
			message: "Project file is not valid.",
		};
	}
}

function validateMappingOverridesField(
	input: unknown,
): Record<string, unknown> {
	if (input === undefined) return {};
	return validateMappingOverrides(input) as Record<string, unknown>;
}

export function validateAnalysisCache(
	input: unknown,
): ChdgProjectAnalysisCache | undefined {
	if (input === undefined) return undefined;
	if (!isRecord(input)) return undefined;
	if (input["schemaVersion"] !== 1) return undefined;
	const sourceFingerprint = validateSourceFingerprint(
		input["sourceFingerprint"],
	);
	if (!sourceFingerprint) return undefined;
	const mappingFingerprint = input["mappingFingerprint"];
	if (typeof mappingFingerprint !== "string") return undefined;
	const selectedTracks = validateOptionalTrackArray(input["selectedTracks"]);
	if (!selectedTracks) return undefined;
	const inspectedAt = input["inspectedAt"];
	if (typeof inspectedAt !== "string") return undefined;
	const inspection = input["inspection"];
	if (!isRecord(inspection)) return undefined;
	const normalizedAt = input["normalizedAt"];
	if (normalizedAt !== undefined && typeof normalizedAt !== "string") {
		return undefined;
	}
	const normalizationPreview = input["normalizationPreview"];
	if (normalizationPreview !== undefined && !isRecord(normalizationPreview)) {
		return undefined;
	}

	return {
		schemaVersion: 1,
		sourceFingerprint,
		mappingFingerprint,
		selectedTracks,
		inspectedAt,
		...(normalizedAt !== undefined ? { normalizedAt } : {}),
		inspection: inspection as ChdgProjectAnalysisCache["inspection"],
		...(normalizationPreview !== undefined
			? {
					normalizationPreview:
						normalizationPreview as ChdgProjectAnalysisCache["normalizationPreview"],
				}
			: {}),
	};
}

function validateSourceFingerprint(
	input: unknown,
): ChdgSourceFingerprint | undefined {
	if (!isRecord(input)) return undefined;
	const sourcePath = input["path"];
	if (typeof sourcePath !== "string" || sourcePath.trim().length === 0) {
		return undefined;
	}
	const sizeBytes = input["sizeBytes"];
	if (
		sizeBytes !== undefined &&
		(typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes))
	) {
		return undefined;
	}
	const mtimeMs = input["mtimeMs"];
	if (
		mtimeMs !== undefined &&
		(typeof mtimeMs !== "number" || !Number.isFinite(mtimeMs))
	) {
		return undefined;
	}
	return {
		path: sourcePath,
		...(sizeBytes !== undefined ? { sizeBytes } : {}),
		...(mtimeMs !== undefined ? { mtimeMs } : {}),
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

function validateProjectSection(input: unknown): ChdgProjectFile["project"] {
	const project = assertRecord(
		input,
		"INVALID_PROJECT_SECTION",
		"Project file is missing a valid 'project' section.",
	);
	const name = requiredNonEmptyStringField(
		project,
		"name",
		"INVALID_PROJECT_NAME",
		"Project name is required.",
	);
	const createdAt = requiredStringField(
		project,
		"createdAt",
		"INVALID_PROJECT_CREATED_AT",
		"Project createdAt is required.",
	);
	const updatedAt = requiredStringField(
		project,
		"updatedAt",
		"INVALID_PROJECT_UPDATED_AT",
		"Project updatedAt is required.",
	);

	return {
		name,
		createdAt,
		updatedAt,
	};
}

function validatePaths(input: unknown): ChdgProjectFile["paths"] {
	const paths = assertRecord(
		input,
		"INVALID_PATHS_SECTION",
		"Project file is missing a valid 'paths' section.",
	);

	return {
		sourcePath: optionalStringField(
			paths,
			"sourcePath",
			"INVALID_PROJECT_PATH",
			"paths.sourcePath must be a string.",
		),
		audioPath: optionalStringField(
			paths,
			"audioPath",
			"INVALID_PROJECT_PATH",
			"paths.audioPath must be a string.",
		),
		outputDir: optionalStringField(
			paths,
			"outputDir",
			"INVALID_PROJECT_PATH",
			"paths.outputDir must be a string.",
		),
	};
}

function validateCover(input: unknown): ChdgProjectFile["cover"] | undefined {
	if (input === undefined) return undefined;
	const cover = assertRecord(
		input,
		"INVALID_COVER_SECTION",
		"cover must be an object when provided.",
	);
	return {
		imagePath: optionalStringField(
			cover,
			"imagePath",
			"INVALID_COVER_IMAGE_PATH",
			"cover.imagePath must be a string.",
		),
	};
}

function validateSource(input: unknown): ChdgProjectFile["source"] | undefined {
	if (input === undefined) return undefined;
	const source = assertRecord(
		input,
		"INVALID_SOURCE_SECTION",
		"source must be an object when provided.",
	);

	const sourceKind = source["sourceKind"];
	if (
		sourceKind !== undefined &&
		sourceKind !== "midi" &&
		sourceKind !== "gpif"
	) {
		throw new ProjectFileValidationError(
			"INVALID_SOURCE_KIND",
			"source.sourceKind must be 'midi' or 'gpif'.",
		);
	}

	const result: NonNullable<ChdgProjectFile["source"]> = {};
	if (sourceKind !== undefined) {
		result.sourceKind = sourceKind;
	}
	if ("inspectionSummary" in source) {
		result.inspectionSummary = source["inspectionSummary"];
	}
	return result;
}

function validateSelection(input: unknown): ChdgProjectFile["selection"] {
	const selection = assertRecord(
		input,
		"INVALID_SELECTION_SECTION",
		"Project file is missing a valid 'selection' section.",
	);
	const selectedTracks = selection["selectedTracks"];
	if (
		!Array.isArray(selectedTracks) ||
		selectedTracks.some(
			(track) =>
				typeof track !== "number" ||
				!Number.isFinite(track) ||
				!Number.isInteger(track) ||
				track < 0,
		)
	) {
		throw new ProjectFileValidationError(
			"INVALID_SELECTED_TRACKS",
			"selectedTracks must be an array of non-negative integers.",
		);
	}
	return {
		selectedTracks: [...selectedTracks],
	};
}

function validateMetadata(input: unknown): ChdgProjectFile["metadata"] {
	const metadata = assertRecord(
		input,
		"INVALID_METADATA_SECTION",
		"Project file is missing a valid 'metadata' section.",
	);

	return {
		name: optionalStringField(
			metadata,
			"name",
			"INVALID_METADATA_FIELD",
			"metadata.name must be a string.",
		),
		artist: optionalStringField(
			metadata,
			"artist",
			"INVALID_METADATA_FIELD",
			"metadata.artist must be a string.",
		),
		album: optionalStringField(
			metadata,
			"album",
			"INVALID_METADATA_FIELD",
			"metadata.album must be a string.",
		),
		year: optionalStringField(
			metadata,
			"year",
			"INVALID_METADATA_FIELD",
			"metadata.year must be a string.",
		),
		genre: optionalStringField(
			metadata,
			"genre",
			"INVALID_METADATA_FIELD",
			"metadata.genre must be a string.",
		),
		charter: optionalStringField(
			metadata,
			"charter",
			"INVALID_METADATA_FIELD",
			"metadata.charter must be a string.",
		),
	};
}

function validateGeneration(input: unknown): ChdgProjectFile["generation"] {
	const generation = assertRecord(
		input,
		"INVALID_GENERATION_SECTION",
		"Project file is missing a valid 'generation' section.",
	);
	const status = generation["status"];
	const validStatuses: ChdgOutputStatus[] = [
		"not-generated",
		"generated",
		"needs-regenerate",
		"failed",
	];
	if (!validStatuses.includes(status as ChdgOutputStatus)) {
		throw new ProjectFileValidationError(
			"INVALID_GENERATION_STATUS",
			`Invalid generation status: ${status}.`,
		);
	}

	const result: ChdgProjectFile["generation"] = {
		status: status as ChdgOutputStatus,
	};

	const offsetMs = optionalFiniteNumberField(
		generation,
		"offsetMs",
		"INVALID_GENERATION_OFFSET",
		"generation.offsetMs must be a finite number.",
	);
	if (offsetMs !== undefined) {
		result.offsetMs = offsetMs;
	}

	const lastGeneratedAt = optionalStringField(
		generation,
		"lastGeneratedAt",
		"INVALID_GENERATION_TIMESTAMP",
		"generation.lastGeneratedAt must be a string.",
	);
	if (lastGeneratedAt !== undefined) {
		result.lastGeneratedAt = lastGeneratedAt;
	}

	const outputFiles = validateOutputFiles(generation["outputFiles"]);
	if (outputFiles !== undefined) {
		result.outputFiles = outputFiles;
	}

	if ("lastResultSummary" in generation) {
		result.lastResultSummary = generation["lastResultSummary"];
	}

	return result;
}

function validateOutputFiles(
	input: unknown,
): ChdgProjectFile["generation"]["outputFiles"] | undefined {
	if (input === undefined) return undefined;
	const outputFiles = assertRecord(
		input,
		"INVALID_OUTPUT_FILES",
		"generation.outputFiles must be an object when provided.",
	);
	return {
		chart: optionalStringField(
			outputFiles,
			"chart",
			"INVALID_OUTPUT_FILE",
			"generation.outputFiles.chart must be a string.",
		),
		songIni: optionalStringField(
			outputFiles,
			"songIni",
			"INVALID_OUTPUT_FILE",
			"generation.outputFiles.songIni must be a string.",
		),
		songOgg: optionalStringField(
			outputFiles,
			"songOgg",
			"INVALID_OUTPUT_FILE",
			"generation.outputFiles.songOgg must be a string.",
		),
	};
}

function validateSettings(input: unknown): Record<string, unknown> | undefined {
	if (input === undefined) return undefined;
	return assertRecord(
		input,
		"INVALID_SETTINGS_SECTION",
		"settings must be an object when provided.",
	);
}

function assertRecord(
	input: unknown,
	code: string,
	message: string,
): Record<string, unknown> {
	if (typeof input !== "object" || input === null || Array.isArray(input)) {
		throw new ProjectFileValidationError(code, message);
	}
	return input as Record<string, unknown>;
}

function isRecord(input: unknown): input is Record<string, unknown> {
	return typeof input === "object" && input !== null && !Array.isArray(input);
}

function validateOptionalTrackArray(input: unknown): number[] | undefined {
	if (
		!Array.isArray(input) ||
		input.some(
			(track) =>
				typeof track !== "number" ||
				!Number.isFinite(track) ||
				!Number.isInteger(track) ||
				track < 0,
		)
	) {
		return undefined;
	}
	return [...input];
}

function requiredStringField(
	record: Record<string, unknown>,
	field: string,
	code: string,
	message: string,
): string {
	const value = record[field];
	if (typeof value !== "string") {
		throw new ProjectFileValidationError(code, message);
	}
	return value;
}

function requiredNonEmptyStringField(
	record: Record<string, unknown>,
	field: string,
	code: string,
	message: string,
): string {
	const value = requiredStringField(record, field, code, message);
	if (value.trim().length === 0) {
		throw new ProjectFileValidationError(code, message);
	}
	return value;
}

function optionalStringField(
	record: Record<string, unknown>,
	field: string,
	code: string,
	message: string,
): string | undefined {
	const value = record[field];
	if (value === undefined) return undefined;
	if (typeof value !== "string") {
		throw new ProjectFileValidationError(code, message);
	}
	return value;
}

function optionalFiniteNumberField(
	record: Record<string, unknown>,
	field: string,
	code: string,
	message: string,
): number | undefined {
	const value = record[field];
	if (value === undefined) return undefined;
	if (typeof value !== "number" || !Number.isFinite(value)) {
		throw new ProjectFileValidationError(code, message);
	}
	return value;
}
