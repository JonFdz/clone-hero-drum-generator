import {
	DRUM_PIECE,
	type DrumPiece,
	type GpifHitSourceIdentity,
	type GpifDrumHitSource,
	type HitSourceIdentity,
	type ImportedDrumHit,
	type MidiDrumHitSource,
	type MidiHitSourceIdentity,
} from "@chdg/core";
import {
	CLONE_HERO_LANE,
	EXPORT_STATUS,
	MANAGED_EXPORT_FILE,
	MAPPING_CONFIDENCE,
	SOURCE_MAPPING_STATUS,
	type ChdgAssetsSection,
	type ChdgExportState,
	type ChdgExportStatus,
	type ChdgImportSection,
	type ChdgProjectFile,
	type ChdgProjectIdentity,
	type ChdgSourceDocument,
	type CloneHeroTarget,
	type CloneHeroLane,
	type InterpretationOverride,
	type ManagedExportFileName,
	type MappingConfidence,
	type NoteCorrection,
	type ProjectMappings,
	type SourceMappingDefinition,
	type SourceMappingStatus,
} from "./projectFileTypes.js";

export type * from "./projectFileTypes.js";

export type ChdgProjectFileValidationResult =
	| {
			readonly ok: true;
			readonly project: ChdgProjectFile;
	  }
	| {
			readonly ok: false;
			readonly code: string;
			readonly message: string;
	  };

const TOP_LEVEL_KEYS = [
	"schemaVersion",
	"appVersion",
	"project",
	"import",
	"assets",
	"sourceDocument",
	"mappings",
	"corrections",
	"editor",
	"export",
] as const;

const SHA256_PATTERN = /^[a-f0-9]{64}$/i;
const ISO_TIMESTAMP_PATTERN =
	/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const WINDOWS_ABSOLUTE_PATH_PATTERN = /^[a-zA-Z]:[\\/]/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const ARCHIVED_SOURCE_PATH_PATTERN =
	/^assets\/source\.[A-Za-z0-9][A-Za-z0-9._-]*$/;
const ALL_DRUM_PIECES = new Set<string>(Object.values(DRUM_PIECE));
const MUSICAL_DRUM_PIECES = new Set<string>(
	Object.values(DRUM_PIECE).filter((piece) => piece !== DRUM_PIECE.UNKNOWN),
);
const CYMBAL_PIECES = new Set<DrumPiece>([
	DRUM_PIECE.HIHAT_CLOSED,
	DRUM_PIECE.HIHAT_OPEN,
	DRUM_PIECE.CRASH,
	DRUM_PIECE.RIDE,
]);
const VALID_LANES = new Set<string>(Object.values(CLONE_HERO_LANE));
const VALID_MAPPING_STATUSES = new Set<string>(
	Object.values(SOURCE_MAPPING_STATUS),
);
const VALID_CONFIDENCE = new Set<string>(Object.values(MAPPING_CONFIDENCE));
const VALID_EXPORT_STATUSES = new Set<string>(Object.values(EXPORT_STATUS));
const VALID_MANAGED_FILES = new Set<string>(Object.values(MANAGED_EXPORT_FILE));

class ProjectFileValidationError extends Error {
	constructor(
		readonly code: string,
		message: string,
	) {
		super(message);
		this.name = "ProjectFileValidationError";
	}
}

export function deriveProjectDisplayName(
	identity: Pick<
		ChdgProjectIdentity,
		"artist" | "songName" | "projectName"
	>,
): string {
	return `${identity.artist} - ${identity.songName} - ${identity.projectName}`;
}

/**
 * Creates the persisted source-event identity for an immutable imported hit.
 *
 * MIDI IDs include the source track, channel, tick, note, and occurrence at
 * that exact source position. GPIF IDs use the source track and document event
 * coordinates plus a normalized articulation key. Neither strategy includes a
 * project path, array index, musical interpretation, or Clone Hero target.
 */
export function createStableHitId(identity: HitSourceIdentity): string {
	if (identity.kind === "midi") {
		return [
			"midi",
			identity.trackIndex,
			identity.channel,
			identity.tick,
			identity.midiNote,
			identity.occurrenceIndex,
		].join(":");
	}
	return [
		"gpif",
		identity.trackIndex,
		identity.measureIndex,
		identity.voiceIndex,
		identity.beatIndex,
		identity.noteIndex,
		encodeURIComponent(normalizeArticulationKey(identity.articulationKey)),
	].join(":");
}

export function parseProjectFile(
	serialized: string,
): ChdgProjectFileValidationResult {
	let value: unknown;
	try {
		value = JSON.parse(serialized) as unknown;
	} catch {
		return {
			ok: false,
			code: "INVALID_PROJECT_JSON",
			message: "Project file is not valid JSON.",
		};
	}
	return validateProjectFile(value);
}

export function canonicalizeProjectFile(project: ChdgProjectFile): string {
	const result = validateProjectFile(project);
	if (!result.ok) {
		throw new ProjectFileValidationError(result.code, result.message);
	}
	return `${JSON.stringify(toCanonicalProject(result.project), null, 2)}\n`;
}

export function serializeProjectFile(project: ChdgProjectFile): string {
	return canonicalizeProjectFile(project);
}

export function validateProjectFile(
	data: unknown,
): ChdgProjectFileValidationResult {
	try {
		const root = record(data, "INVALID_PROJECT_FILE", "Project file must be an object.");
		rejectProvisionalShape(root);
		exactKeys(root, TOP_LEVEL_KEYS, "INVALID_PROJECT_FILE");

		if (root["schemaVersion"] !== 1) {
			throw new ProjectFileValidationError(
				"UNSUPPORTED_PROJECT_VERSION",
				`Unsupported project schema version: ${String(root["schemaVersion"])}.`,
			);
		}

		const appVersion = optionalNonEmptyString(root, "appVersion", "INVALID_APP_VERSION");
		const project = validateIdentity(root["project"]);
		const imported = validateImport(root["import"]);
		const assets = validateAssets(root["assets"]);
		const sourceDocument = validateSourceDocument(root["sourceDocument"]);
		const mappings = validateMappings(root["mappings"], imported.sourceMappings);
		const corrections = validateCorrections(
			root["corrections"],
			sourceDocument.hits,
			imported.sourceMappings,
			mappings,
		);
		const editor = validateEditor(root["editor"]);
		const exportState = validateExport(root["export"]);

		validateCrossSectionConsistency(
			assets,
			imported,
			sourceDocument,
			mappings,
		);

		const safeProject: ChdgProjectFile = {
			schemaVersion: 1,
			...(appVersion === undefined ? {} : { appVersion }),
			project,
			import: imported,
			assets,
			sourceDocument,
			mappings,
			corrections,
			editor,
			export: exportState,
		};
		return { ok: true, project: safeProject };
	} catch (error) {
		if (error instanceof ProjectFileValidationError) {
			return { ok: false, code: error.code, message: error.message };
		}
		return {
			ok: false,
			code: "INVALID_PROJECT_FILE",
			message: "Project file is not valid.",
		};
	}
}

function rejectProvisionalShape(root: Record<string, unknown>): void {
	const project = isRecord(root["project"]) ? root["project"] : undefined;
	if (
		Object.hasOwn(project ?? {}, "id") ||
		Object.hasOwn(project ?? {}, "name") ||
		Object.hasOwn(root, "projectId") ||
		Object.hasOwn(root, "chart") ||
		Object.hasOwn(root, "paths") ||
		Object.hasOwn(root, "selection") ||
		Object.hasOwn(root, "generation") ||
		Object.hasOwn(root, "metadata")
	) {
		throw new ProjectFileValidationError(
			"UNSUPPORTED_PROVISIONAL_FORMAT",
			"Provisional pre-release project formats are not supported.",
		);
	}
}

function validateIdentity(input: unknown): ChdgProjectIdentity {
	const value = record(input, "INVALID_PROJECT_IDENTITY", "project must be an object.");
	exactKeys(
		value,
		[
			"projectId",
			"artist",
			"songName",
			"projectName",
			"createdAt",
			"updatedAt",
			"album",
			"year",
			"genre",
			"charter",
		],
		"INVALID_PROJECT_IDENTITY",
	);
	const identity: ChdgProjectIdentity = {
		projectId: nonEmptyString(value, "projectId", "INVALID_PROJECT_IDENTITY"),
		artist: nonEmptyString(value, "artist", "INVALID_PROJECT_IDENTITY"),
		songName: nonEmptyString(value, "songName", "INVALID_PROJECT_IDENTITY"),
		projectName: nonEmptyString(value, "projectName", "INVALID_PROJECT_IDENTITY"),
		createdAt: timestamp(value, "createdAt", "INVALID_PROJECT_TIMESTAMP"),
		updatedAt: timestamp(value, "updatedAt", "INVALID_PROJECT_TIMESTAMP"),
		...optionalMetadata(value),
	};
	return identity;
}

function optionalMetadata(
	value: Record<string, unknown>,
): Pick<ChdgProjectIdentity, "album" | "year" | "genre" | "charter"> {
	return Object.fromEntries(
		(["album", "year", "genre", "charter"] as const)
			.map((key) => [key, optionalNonEmptyString(value, key, "INVALID_PROJECT_METADATA")])
			.filter((entry): entry is [string, string] => entry[1] !== undefined),
	);
}

function validateImport(input: unknown): ChdgImportSection {
	const value = record(input, "INVALID_IMPORT_SECTION", "import must be an object.");
	exactKeys(
		value,
		["selectedTrackIds", "sourceMappings", "importedAt", "importerVersion"],
		"INVALID_IMPORT_SECTION",
	);
	const selectedTrackIds = [
		...new Set(
			integerArray(value["selectedTrackIds"], "INVALID_SELECTED_TRACKS"),
		),
	].sort((left, right) => left - right);
	if (selectedTrackIds.length === 0) {
		throw new ProjectFileValidationError(
			"INVALID_SELECTED_TRACKS",
			"import.selectedTrackIds must contain at least one source track.",
		);
	}
	const sourceMappingValues = record(
		value["sourceMappings"],
		"INVALID_SOURCE_MAPPINGS",
		"import.sourceMappings must be an object.",
	);
	const sourceMappings = safeRecord<SourceMappingDefinition>();
	for (const key of Object.keys(sourceMappingValues)) {
		sourceMappings[key] = validateSourceMapping(key, sourceMappingValues[key]);
	}
	return {
		selectedTrackIds,
		sourceMappings,
		importedAt: timestamp(value, "importedAt", "INVALID_IMPORT_TIMESTAMP"),
		importerVersion: nonEmptyString(value, "importerVersion", "INVALID_IMPORTER_VERSION"),
	};
}

function validateSourceMapping(
	recordKey: string,
	input: unknown,
): SourceMappingDefinition {
	const value = record(input, "INVALID_SOURCE_MAPPING", "Source mapping must be an object.");
	exactKeys(
		value,
		[
			"key",
			"sourceKind",
			"sourceLabel",
			"detectedPiece",
			"defaultTarget",
			"count",
			"confidence",
			"status",
		],
		"INVALID_SOURCE_MAPPING",
	);
	const key = nonEmptyString(value, "key", "INVALID_SOURCE_MAPPING");
	if (key !== recordKey) {
		throw new ProjectFileValidationError(
			"INCONSISTENT_SOURCE_MAPPING",
			`Source mapping key '${recordKey}' does not match its definition.`,
		);
	}
	const sourceKind = sourceKindField(value, "sourceKind", "INVALID_SOURCE_MAPPING");
	const detectedPiece = drumPiece(value["detectedPiece"], true);
	const status = stringMember<SourceMappingStatus>(
		value["status"],
		VALID_MAPPING_STATUSES,
		"INVALID_SOURCE_MAPPING",
	);
	const count = nonNegativeInteger(value["count"], "INVALID_SOURCE_MAPPING");
	if (count < 1) {
		throw new ProjectFileValidationError(
			"INVALID_SOURCE_MAPPING",
			"Source mapping count must be positive.",
		);
	}
	const defaultTarget =
		value["defaultTarget"] === undefined
			? undefined
			: validateTarget(value["defaultTarget"]);
	if (status === SOURCE_MAPPING_STATUS.MAPPED && defaultTarget === undefined) {
		throw new ProjectFileValidationError(
			"INVALID_SOURCE_MAPPING",
			"A mapped source requires a default target.",
		);
	}
	if (
		status === SOURCE_MAPPING_STATUS.MAPPED &&
		detectedPiece === DRUM_PIECE.UNKNOWN
	) {
		throw new ProjectFileValidationError(
			"INVALID_SOURCE_MAPPING",
			"A mapped source must have a known detected musical piece.",
		);
	}
	if (
		status === SOURCE_MAPPING_STATUS.UNKNOWN &&
		(detectedPiece !== DRUM_PIECE.UNKNOWN || defaultTarget !== undefined)
	) {
		throw new ProjectFileValidationError(
			"INVALID_SOURCE_MAPPING",
			"An unknown source must retain an unknown piece and no target.",
		);
	}
	if (status === SOURCE_MAPPING_STATUS.IGNORED && defaultTarget !== undefined) {
		throw new ProjectFileValidationError(
			"INVALID_SOURCE_MAPPING",
			"An ignored source cannot define a target.",
		);
	}
	if (defaultTarget !== undefined && detectedPiece !== DRUM_PIECE.UNKNOWN) {
		validatePieceTarget(detectedPiece, defaultTarget);
	}
	const confidence =
		value["confidence"] === undefined
			? undefined
			: stringMember<MappingConfidence>(
					value["confidence"],
					VALID_CONFIDENCE,
					"INVALID_SOURCE_MAPPING",
				);
	return {
		key,
		sourceKind,
		sourceLabel: nonEmptyString(value, "sourceLabel", "INVALID_SOURCE_MAPPING"),
		detectedPiece,
		...(defaultTarget === undefined ? {} : { defaultTarget }),
		count,
		...(confidence === undefined ? {} : { confidence }),
		status,
	};
}

function validateAssets(input: unknown): ChdgAssetsSection {
	const value = record(input, "INVALID_ASSETS_SECTION", "assets must be an object.");
	exactKeys(value, ["source", "audio", "cover"], "INVALID_ASSETS_SECTION");
	const source = record(value["source"], "INVALID_SOURCE_ASSET", "assets.source is required.");
	exactKeys(
		source,
		["relativePath", "originalFileName", "sourceKind", "sha256", "importedAt"],
		"INVALID_SOURCE_ASSET",
	);
	const relativePath = internalPath(source["relativePath"], "source");
	if (!ARCHIVED_SOURCE_PATH_PATTERN.test(relativePath)) {
		throw new ProjectFileValidationError(
			"INVALID_ASSET_PATH",
			"Archived source must use a concrete assets/source.<extension> path.",
		);
	}
	const originalFileName = nonEmptyString(
		source,
		"originalFileName",
		"INVALID_ORIGINAL_FILE_NAME",
	);
	if (
		originalFileName.includes("/") ||
		originalFileName.includes("\\") ||
		CONTROL_CHARACTER_PATTERN.test(originalFileName) ||
		!originalFileName.includes(".") ||
		originalFileName.endsWith(".") ||
		originalFileName === "." ||
		originalFileName === ".."
	) {
		throw new ProjectFileValidationError(
			"INVALID_ORIGINAL_FILE_NAME",
			"assets.source.originalFileName must be a file name, not a path.",
		);
	}
	const archivedExtension = relativePath.slice(
		relativePath.lastIndexOf(".") + 1,
	);
	const originalExtension = originalFileName.slice(
		originalFileName.lastIndexOf(".") + 1,
	);
	if (archivedExtension.toLowerCase() !== originalExtension.toLowerCase()) {
		throw new ProjectFileValidationError(
			"INVALID_SOURCE_ASSET",
			"Archived source extension must match the original source filename.",
		);
	}

	const audio = record(value["audio"], "INVALID_AUDIO_ASSET", "assets.audio is required.");
	exactKeys(audio, ["relativePath", "sha256", "durationMs"], "INVALID_AUDIO_ASSET");
	if (internalPath(audio["relativePath"], "audio") !== "assets/song.ogg") {
		throw new ProjectFileValidationError(
			"INVALID_ASSET_PATH",
			"Internal audio must use assets/song.ogg.",
		);
	}
	const durationMs =
		audio["durationMs"] === undefined
			? undefined
			: nonNegativeFiniteNumber(audio["durationMs"], "INVALID_AUDIO_ASSET");

	const cover =
		value["cover"] === undefined ? undefined : validateCoverAsset(value["cover"]);
	return {
		source: {
			relativePath,
			originalFileName,
			sourceKind: sourceKindField(source, "sourceKind", "INVALID_SOURCE_ASSET"),
			sha256: sha256(source["sha256"], "INVALID_SOURCE_ASSET"),
			importedAt: timestamp(source, "importedAt", "INVALID_SOURCE_ASSET"),
		},
		audio: {
			relativePath: "assets/song.ogg",
			sha256: sha256(audio["sha256"], "INVALID_AUDIO_ASSET"),
			...(durationMs === undefined ? {} : { durationMs }),
		},
		...(cover === undefined ? {} : { cover }),
	};
}

function validateCoverAsset(input: unknown): NonNullable<ChdgAssetsSection["cover"]> {
	const cover = record(input, "INVALID_COVER_ASSET", "assets.cover must be an object.");
	exactKeys(cover, ["relativePath", "sha256"], "INVALID_COVER_ASSET");
	if (internalPath(cover["relativePath"], "cover") !== "assets/album.jpg") {
		throw new ProjectFileValidationError(
			"INVALID_ASSET_PATH",
			"Internal cover must use assets/album.jpg.",
		);
	}
	return {
		relativePath: "assets/album.jpg",
		sha256: sha256(cover["sha256"], "INVALID_COVER_ASSET"),
	};
}

function validateSourceDocument(input: unknown): ChdgSourceDocument {
	const value = record(
		input,
		"INVALID_SOURCE_DOCUMENT",
		"sourceDocument must be an object.",
	);
	exactKeys(
		value,
		["resolution", "tempos", "timeSignatures", "sections", "hits"],
		"INVALID_SOURCE_DOCUMENT",
	);
	const resolution = positiveInteger(value["resolution"], "INVALID_SOURCE_RESOLUTION");
	const tempos = array(value["tempos"], "INVALID_TEMPO_MAP").map((item) =>
		validateTempo(item),
	);
	validateStrictTickOrder(tempos, "INVALID_TIMING_ORDER");
	if (tempos[0]?.tick !== 0) {
		throw new ProjectFileValidationError(
			"MISSING_INITIAL_TEMPO",
			"The source tempo map must begin at tick 0.",
		);
	}
	const timeSignatures = array(
		value["timeSignatures"],
		"INVALID_TIME_SIGNATURES",
	).map((item) => validateTimeSignature(item));
	validateStrictTickOrder(timeSignatures, "INVALID_TIMING_ORDER");
	const sections = array(value["sections"], "INVALID_SECTIONS").map((item) =>
		validateSection(item),
	);
	validateStrictTickOrder(sections, "INVALID_SECTION_ORDER");
	const hits = array(value["hits"], "INVALID_IMPORTED_HITS").map((item) =>
		validateImportedHit(item),
	);
	validateHitIdentity(hits);
	const canonicalHits = [...hits].sort(compareImportedHits);
	return {
		resolution,
		tempos,
		timeSignatures,
		sections,
		hits: canonicalHits,
	};
}

function compareImportedHits(
	left: ImportedDrumHit,
	right: ImportedDrumHit,
): number {
	if (left.tick !== right.tick) return left.tick - right.tick;
	return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
}

function validateTempo(input: unknown): { tick: number; bpm: number } {
	const value = record(input, "INVALID_TEMPO", "Tempo event must be an object.");
	exactKeys(value, ["tick", "bpm"], "INVALID_TEMPO");
	return {
		tick: nonNegativeFiniteNumber(value["tick"], "INVALID_TEMPO"),
		bpm: positiveFiniteNumber(value["bpm"], "INVALID_TEMPO"),
	};
}

function validateTimeSignature(
	input: unknown,
): { tick: number; numerator: number; denominator: number } {
	const value = record(
		input,
		"INVALID_TIME_SIGNATURE",
		"Time signature must be an object.",
	);
	exactKeys(value, ["tick", "numerator", "denominator"], "INVALID_TIME_SIGNATURE");
	const denominator = positiveInteger(
		value["denominator"],
		"INVALID_TIME_SIGNATURE",
	);
	if ((denominator & (denominator - 1)) !== 0) {
		throw new ProjectFileValidationError(
			"INVALID_TIME_SIGNATURE",
			"Time-signature denominator must be a power of two.",
		);
	}
	return {
		tick: nonNegativeFiniteNumber(value["tick"], "INVALID_TIME_SIGNATURE"),
		numerator: positiveInteger(value["numerator"], "INVALID_TIME_SIGNATURE"),
		denominator,
	};
}

function validateSection(input: unknown): { tick: number; name: string } {
	const value = record(input, "INVALID_SECTION", "Section must be an object.");
	exactKeys(value, ["tick", "name"], "INVALID_SECTION");
	return {
		tick: nonNegativeFiniteNumber(value["tick"], "INVALID_SECTION"),
		name: nonEmptyString(value, "name", "INVALID_SECTION"),
	};
}

function validateImportedHit(input: unknown): ImportedDrumHit {
	const value = record(input, "INVALID_IMPORTED_HIT", "Imported hit must be an object.");
	exactKeys(
		value,
		[
			"id",
			"tick",
			"detectedPiece",
			"velocity",
			"durationTicks",
			"sourceMappingKey",
			"sourceIdentity",
			"source",
		],
		"INVALID_IMPORTED_HIT",
	);
	const sourceIdentity = validateSourceIdentity(value["sourceIdentity"]);
	const hit: ImportedDrumHit = {
		id: nonEmptyString(value, "id", "INVALID_IMPORTED_HIT"),
		tick: nonNegativeFiniteNumber(value["tick"], "INVALID_IMPORTED_HIT"),
		detectedPiece: drumPiece(value["detectedPiece"], true),
		velocity: integerInRange(value["velocity"], 0, 127, "INVALID_IMPORTED_HIT"),
		durationTicks: nonNegativeFiniteNumber(
			value["durationTicks"],
			"INVALID_IMPORTED_HIT",
		),
		sourceMappingKey: nonEmptyString(
			value,
			"sourceMappingKey",
			"INVALID_IMPORTED_HIT",
		),
		sourceIdentity,
		source: validateHitSource(value["source"], sourceIdentity),
	};
	if (
		hit.sourceIdentity.kind === "midi" &&
		hit.sourceIdentity.tick !== hit.tick
	) {
		throw new ProjectFileValidationError(
			"INCONSISTENT_SOURCE_IDENTITY",
			"MIDI source identity tick must match the imported hit tick.",
		);
	}
	return hit;
}

function validateHitSource(
	input: unknown,
	identity: HitSourceIdentity,
): MidiDrumHitSource | GpifDrumHitSource {
	const value = record(
		input,
		"INVALID_SOURCE_PROVENANCE",
		"Imported hit source provenance must be an object.",
	);
	if (identity.kind === "midi") {
		exactKeys(
			value,
			["midiNote", "trackIndex", "trackName", "channel"],
			"INVALID_SOURCE_PROVENANCE",
		);
		const source: MidiDrumHitSource = {
			midiNote: integerInRange(
				value["midiNote"],
				0,
				127,
				"INVALID_SOURCE_PROVENANCE",
			),
			trackIndex: nonNegativeInteger(
				value["trackIndex"],
				"INVALID_SOURCE_PROVENANCE",
			),
			trackName: stringField(
				value,
				"trackName",
				"INVALID_SOURCE_PROVENANCE",
			),
			channel: integerInRange(
				value["channel"],
				0,
				15,
				"INVALID_SOURCE_PROVENANCE",
			),
		};
		if (
			source.midiNote !== identity.midiNote ||
			source.trackIndex !== identity.trackIndex ||
			source.channel !== identity.channel
		) {
			throw new ProjectFileValidationError(
				"INCONSISTENT_SOURCE_IDENTITY",
				"MIDI provenance does not match the deterministic source identity.",
			);
		}
		return source;
	}

	exactKeys(
		value,
		[
			"kind",
			"trackIndex",
			"trackName",
			"articulationKey",
			"rawArticulation",
			"noteName",
			"inputMidiNumbers",
			"outputMidiNumber",
			"resolvedVia",
			"measureIndex",
			"beatIndex",
			"noteIndex",
		],
		"INVALID_SOURCE_PROVENANCE",
	);
	if (value["kind"] !== "gpif") {
		throw new ProjectFileValidationError(
			"INVALID_SOURCE_PROVENANCE",
			"GPIF provenance must use kind 'gpif'.",
		);
	}
	const source: GpifDrumHitSource = {
		kind: "gpif",
		trackIndex: nonNegativeInteger(
			value["trackIndex"],
			"INVALID_SOURCE_PROVENANCE",
		),
		...optionalStringProperty(value, "trackName", "INVALID_SOURCE_PROVENANCE"),
		...optionalStringProperty(
			value,
			"articulationKey",
			"INVALID_SOURCE_PROVENANCE",
		),
		...optionalStringProperty(
			value,
			"rawArticulation",
			"INVALID_SOURCE_PROVENANCE",
		),
		...optionalStringProperty(value, "noteName", "INVALID_SOURCE_PROVENANCE"),
		...(value["inputMidiNumbers"] === undefined
			? {}
			: {
					inputMidiNumbers: array(
						value["inputMidiNumbers"],
						"INVALID_SOURCE_PROVENANCE",
					).map((item) =>
						integerInRange(item, 0, 127, "INVALID_SOURCE_PROVENANCE"),
					),
				}),
		...(value["outputMidiNumber"] === undefined
			? {}
			: {
					outputMidiNumber: integerInRange(
						value["outputMidiNumber"],
						0,
						127,
						"INVALID_SOURCE_PROVENANCE",
					),
				}),
		...optionalStringProperty(value, "resolvedVia", "INVALID_SOURCE_PROVENANCE"),
		...optionalNonNegativeIntegerProperty(
			value,
			"measureIndex",
			"INVALID_SOURCE_PROVENANCE",
		),
		...optionalNonNegativeIntegerProperty(
			value,
			"beatIndex",
			"INVALID_SOURCE_PROVENANCE",
		),
		...optionalNonNegativeIntegerProperty(
			value,
			"noteIndex",
			"INVALID_SOURCE_PROVENANCE",
		),
	};
	if (
		source.trackIndex !== identity.trackIndex ||
		source.measureIndex !== identity.measureIndex ||
		source.beatIndex !== identity.beatIndex ||
		source.noteIndex !== identity.noteIndex ||
		source.articulationKey !== identity.articulationKey
	) {
		throw new ProjectFileValidationError(
			"INCONSISTENT_SOURCE_IDENTITY",
			"GPIF provenance does not match the deterministic source identity.",
		);
	}
	return source;
}

function validateSourceIdentity(input: unknown): HitSourceIdentity {
	const value = record(
		input,
		"INVALID_SOURCE_IDENTITY",
		"sourceIdentity must be an object.",
	);
	if (value["kind"] === "midi") {
		exactKeys(
			value,
			["kind", "trackIndex", "channel", "tick", "midiNote", "occurrenceIndex"],
			"INVALID_SOURCE_IDENTITY",
		);
		const identity: MidiHitSourceIdentity = {
			kind: "midi",
			trackIndex: nonNegativeInteger(value["trackIndex"], "INVALID_SOURCE_IDENTITY"),
			channel: integerInRange(value["channel"], 0, 15, "INVALID_SOURCE_IDENTITY"),
			tick: nonNegativeFiniteNumber(value["tick"], "INVALID_SOURCE_IDENTITY"),
			midiNote: integerInRange(value["midiNote"], 0, 127, "INVALID_SOURCE_IDENTITY"),
			occurrenceIndex: nonNegativeInteger(
				value["occurrenceIndex"],
				"INVALID_SOURCE_IDENTITY",
			),
		};
		return identity;
	}
	if (value["kind"] === "gpif") {
		exactKeys(
			value,
			[
				"kind",
				"trackIndex",
				"measureIndex",
				"voiceIndex",
				"beatIndex",
				"noteIndex",
				"articulationKey",
			],
			"INVALID_SOURCE_IDENTITY",
		);
		const articulationKey = nonEmptyString(
			value,
			"articulationKey",
			"INVALID_SOURCE_IDENTITY",
		);
		if (articulationKey !== normalizeArticulationKey(articulationKey)) {
			throw new ProjectFileValidationError(
				"INVALID_SOURCE_IDENTITY",
				"GPIF articulation keys must already be normalized.",
			);
		}
		const identity: GpifHitSourceIdentity = {
			kind: "gpif",
			trackIndex: nonNegativeInteger(value["trackIndex"], "INVALID_SOURCE_IDENTITY"),
			measureIndex: nonNegativeInteger(value["measureIndex"], "INVALID_SOURCE_IDENTITY"),
			voiceIndex: nonNegativeInteger(value["voiceIndex"], "INVALID_SOURCE_IDENTITY"),
			beatIndex: nonNegativeInteger(value["beatIndex"], "INVALID_SOURCE_IDENTITY"),
			noteIndex: nonNegativeInteger(value["noteIndex"], "INVALID_SOURCE_IDENTITY"),
			articulationKey,
		};
		return identity;
	}
	throw new ProjectFileValidationError(
		"INVALID_SOURCE_IDENTITY",
		"Source identity kind must be 'midi' or 'gpif'.",
	);
}

function validateHitIdentity(hits: readonly ImportedDrumHit[]): void {
	const ids = new Set<string>();
	for (const hit of hits) {
		// Stable IDs are a one-to-one encoding of source identity. Therefore two
		// identical source identities necessarily collide as duplicate hit IDs;
		// there is no separate valid wire state with duplicate identity/unique ID.
		if (ids.has(hit.id)) {
			throw new ProjectFileValidationError(
				"DUPLICATE_HIT_ID",
				`Duplicate imported hit ID: ${hit.id}.`,
			);
		}
		ids.add(hit.id);
		const expectedId = createStableHitId(hit.sourceIdentity);
		if (hit.id !== expectedId) {
			throw new ProjectFileValidationError(
				"INCONSISTENT_HIT_ID",
				`Imported hit ID '${hit.id}' does not match its source identity.`,
			);
		}
	}
}

function validateMappings(
	input: unknown,
	sourceMappings: Readonly<Record<string, SourceMappingDefinition>>,
): ProjectMappings {
	const value = record(input, "INVALID_MAPPINGS", "mappings must be an object.");
	exactKeys(
		value,
		["interpretationOverrides", "targetOverrides"],
		"INVALID_MAPPINGS",
	);
	const interpretationValues = record(
		value["interpretationOverrides"],
		"INVALID_INTERPRETATION_OVERRIDES",
		"interpretationOverrides must be an object.",
	);
	const interpretationOverrides = safeRecord<InterpretationOverride>();
	for (const key of Object.keys(interpretationValues)) {
		if (!Object.hasOwn(sourceMappings, key)) {
			throw new ProjectFileValidationError(
				"DANGLING_MAPPING_OVERRIDE",
				`Interpretation override references unknown source mapping '${key}'.`,
			);
		}
		interpretationOverrides[key] = validateInterpretationOverride(
			interpretationValues[key],
		);
	}
	const targetValues = record(
		value["targetOverrides"],
		"INVALID_TARGET_OVERRIDES",
		"targetOverrides must be an object.",
	);
	const targetOverrides = safeRecord<CloneHeroTarget>();
	for (const key of Object.keys(targetValues)) {
		if (!Object.hasOwn(sourceMappings, key)) {
			throw new ProjectFileValidationError(
				"DANGLING_MAPPING_OVERRIDE",
				`Target override references unknown source mapping '${key}'.`,
			);
		}
		targetOverrides[key] = validateTarget(targetValues[key]);
	}
	return { interpretationOverrides, targetOverrides };
}

function validateInterpretationOverride(input: unknown): InterpretationOverride {
	const value = record(
		input,
		"INVALID_INTERPRETATION_OVERRIDE",
		"Interpretation override must be an object.",
	);
	if (value["kind"] === "ignore") {
		exactKeys(value, ["kind"], "INVALID_INTERPRETATION_OVERRIDE");
		return { kind: "ignore" };
	}
	if (value["kind"] === "piece") {
		exactKeys(value, ["kind", "piece"], "INVALID_INTERPRETATION_OVERRIDE");
		return { kind: "piece", piece: drumPiece(value["piece"], false) };
	}
	throw new ProjectFileValidationError(
		"INVALID_INTERPRETATION_OVERRIDE",
		"Interpretation override kind must be 'piece' or 'ignore'.",
	);
}

function validateCorrections(
	input: unknown,
	hits: readonly ImportedDrumHit[],
	sourceMappings: Readonly<Record<string, SourceMappingDefinition>>,
	mappings: ProjectMappings,
): Readonly<Record<string, NoteCorrection>> {
	const values = record(input, "INVALID_CORRECTIONS", "corrections must be an object.");
	const hitById = new Map(hits.map((hit) => [hit.id, hit]));
	const corrections = safeRecord<NoteCorrection>();
	for (const key of Object.keys(values)) {
		const value = record(
			values[key],
			"INVALID_CORRECTION",
			"Note correction must be an object.",
		);
		exactKeys(
			value,
			["hitId", "piece", "target", "accent", "ghost", "deleted", "updatedAt"],
			"INVALID_CORRECTION",
		);
		const hitId = nonEmptyString(value, "hitId", "INVALID_CORRECTION");
		const hit = hitById.get(hitId);
		if (key !== hitId || hit === undefined) {
			throw new ProjectFileValidationError(
				"DANGLING_CORRECTION",
				`Correction '${key}' does not reference an imported hit.`,
			);
		}
		const piece =
			value["piece"] === undefined ? undefined : drumPiece(value["piece"], false);
		const target =
			value["target"] === undefined ? undefined : validateTarget(value["target"]);
		const accent = optionalBoolean(value, "accent", "INVALID_CORRECTION");
		const ghost = optionalBoolean(value, "ghost", "INVALID_CORRECTION");
		const deleted = optionalBoolean(value, "deleted", "INVALID_CORRECTION");
		if (accent === true && ghost === true) {
			throw new ProjectFileValidationError(
				"ACCENT_GHOST_CONFLICT",
				"A correction cannot enable accent and ghost simultaneously.",
			);
		}
		if (deleted === false) {
			throw new ProjectFileValidationError(
				"INVALID_CORRECTION",
				"Restore is represented by removing the deletion override.",
			);
		}
		if (piece !== undefined || target !== undefined) {
			const effectivePiece =
				piece ??
				effectiveMappingPiece(
					hit.sourceMappingKey,
					sourceMappings,
					mappings,
				);
			const effectiveTarget =
				target ??
				effectiveMappingTarget(
					hit.sourceMappingKey,
					sourceMappings,
					mappings,
					effectivePiece,
				);
			validatePieceTarget(effectivePiece, effectiveTarget);
		}
		corrections[key] = {
			hitId,
			...(piece === undefined ? {} : { piece }),
			...(target === undefined ? {} : { target }),
			...(accent === undefined ? {} : { accent }),
			...(ghost === undefined ? {} : { ghost }),
			...(deleted === true ? { deleted: true as const } : {}),
			updatedAt: timestamp(value, "updatedAt", "INVALID_CORRECTION"),
		};
	}
	return corrections;
}

function validateEditor(input: unknown): { readonly offsetMs: number } {
	const value = record(input, "INVALID_EDITOR_STATE", "editor must be an object.");
	exactKeys(value, ["offsetMs"], "INVALID_EDITOR_STATE");
	return {
		offsetMs: finiteNumber(value["offsetMs"], "INVALID_EDITOR_STATE"),
	};
}

function validateExport(input: unknown): ChdgExportState {
	const value = record(input, "INVALID_EXPORT_MANIFEST", "export must be an object.");
	exactKeys(
		value,
		[
			"status",
			"targetDirectory",
			"lastSuccessfulAt",
			"fingerprints",
			"managedFiles",
		],
		"INVALID_EXPORT_MANIFEST",
	);
	const status = stringMember<ChdgExportStatus>(
		value["status"],
		VALID_EXPORT_STATUSES,
		"INVALID_EXPORT_MANIFEST",
	);
	const targetDirectory = optionalNonEmptyString(
		value,
		"targetDirectory",
		"INVALID_EXPORT_MANIFEST",
	);
	const lastSuccessfulAt =
		value["lastSuccessfulAt"] === undefined
			? undefined
			: timestamp(value, "lastSuccessfulAt", "INVALID_EXPORT_MANIFEST");
	const fingerprints =
		value["fingerprints"] === undefined
			? undefined
			: validateFingerprints(value["fingerprints"]);
	const managedFiles =
		value["managedFiles"] === undefined
			? undefined
			: validateManagedFiles(value["managedFiles"]);
	if (
		targetDirectory === undefined &&
		(lastSuccessfulAt !== undefined ||
			fingerprints !== undefined ||
			managedFiles !== undefined ||
			status !== EXPORT_STATUS.NEVER_EXPORTED)
	) {
		throw new ProjectFileValidationError(
			"INVALID_EXPORT_MANIFEST",
			"Export ownership metadata requires a target directory.",
		);
	}
	if (
		status === EXPORT_STATUS.CURRENT &&
		(lastSuccessfulAt === undefined ||
			fingerprints === undefined ||
			managedFiles === undefined)
	) {
		throw new ProjectFileValidationError(
			"INVALID_EXPORT_MANIFEST",
			"A current export requires timestamp, fingerprints, and managed files.",
		);
	}
	return {
		status,
		...(targetDirectory === undefined ? {} : { targetDirectory }),
		...(lastSuccessfulAt === undefined ? {} : { lastSuccessfulAt }),
		...(fingerprints === undefined ? {} : { fingerprints }),
		...(managedFiles === undefined ? {} : { managedFiles }),
	};
}

function validateFingerprints(input: unknown) {
	const value = record(
		input,
		"INVALID_EXPORT_MANIFEST",
		"Export fingerprints must be an object.",
	);
	const keys = [
		"sourceDocument",
		"mappings",
		"corrections",
		"metadata",
		"audio",
		"cover",
	] as const;
	exactKeys(value, keys, "INVALID_EXPORT_MANIFEST");
	return Object.fromEntries(
		keys
			.map((key) => [
				key,
				value[key] === undefined
					? undefined
					: sha256(value[key], "INVALID_EXPORT_MANIFEST"),
			])
			.filter((entry): entry is [string, string] => entry[1] !== undefined),
	);
}

function validateManagedFiles(
	input: unknown,
): Partial<Record<ManagedExportFileName, {
	readonly sha256: string;
	readonly sizeBytes: number;
	readonly writtenAt: string;
}>> {
	const value = record(
		input,
		"INVALID_EXPORT_MANIFEST",
		"Export managedFiles must be an object.",
	);
	const managedFiles: Partial<
		Record<
			ManagedExportFileName,
			{ readonly sha256: string; readonly sizeBytes: number; readonly writtenAt: string }
		>
	> = safeRecord();
	for (const key of Object.keys(value)) {
		if (!VALID_MANAGED_FILES.has(key)) {
			throw new ProjectFileValidationError(
				"INVALID_EXPORT_MANIFEST",
				`Unsupported managed export file '${key}'.`,
			);
		}
		const metadata = record(
			value[key],
			"INVALID_EXPORT_MANIFEST",
			"Managed file metadata must be an object.",
		);
		exactKeys(metadata, ["sha256", "sizeBytes", "writtenAt"], "INVALID_EXPORT_MANIFEST");
		managedFiles[key as ManagedExportFileName] = {
			sha256: sha256(metadata["sha256"], "INVALID_EXPORT_MANIFEST"),
			sizeBytes: nonNegativeInteger(
				metadata["sizeBytes"],
				"INVALID_EXPORT_MANIFEST",
			),
			writtenAt: timestamp(
				metadata,
				"writtenAt",
				"INVALID_EXPORT_MANIFEST",
			),
		};
	}
	return managedFiles;
}

function validateCrossSectionConsistency(
	assets: ChdgAssetsSection,
	imported: ChdgImportSection,
	sourceDocument: ChdgSourceDocument,
	mappings: ProjectMappings,
): void {
	const hitCounts = new Map<string, number>();
	for (const [key, mapping] of Object.entries(imported.sourceMappings)) {
		if (mapping.sourceKind !== assets.source.sourceKind) {
			throw new ProjectFileValidationError(
				"INCONSISTENT_SOURCE_IDENTITY",
				`Source mapping '${key}' does not match the archived source kind.`,
			);
		}
	}
	for (const hit of sourceDocument.hits) {
		const mapping = Object.hasOwn(
			imported.sourceMappings,
			hit.sourceMappingKey,
		)
			? imported.sourceMappings[hit.sourceMappingKey]
			: undefined;
		if (mapping === undefined) {
			throw new ProjectFileValidationError(
				"DANGLING_SOURCE_MAPPING",
				`Imported hit '${hit.id}' references unknown mapping '${hit.sourceMappingKey}'.`,
			);
		}
		if (mapping.sourceKind !== hit.sourceIdentity.kind) {
			throw new ProjectFileValidationError(
				"INCONSISTENT_SOURCE_IDENTITY",
				`Imported hit '${hit.id}' source kind does not match its mapping.`,
			);
		}
		if (mapping.detectedPiece !== hit.detectedPiece) {
			throw new ProjectFileValidationError(
				"INCONSISTENT_SOURCE_IDENTITY",
				`Imported hit '${hit.id}' detected piece does not match its mapping.`,
			);
		}
		if (!imported.selectedTrackIds.includes(hit.sourceIdentity.trackIndex)) {
			throw new ProjectFileValidationError(
				"INCONSISTENT_SOURCE_IDENTITY",
				`Imported hit '${hit.id}' references an unselected source track.`,
			);
		}
		hitCounts.set(
			hit.sourceMappingKey,
			(hitCounts.get(hit.sourceMappingKey) ?? 0) + 1,
		);
	}
	for (const [key, mapping] of Object.entries(imported.sourceMappings)) {
		if ((hitCounts.get(key) ?? 0) !== mapping.count) {
			throw new ProjectFileValidationError(
				"INCONSISTENT_SOURCE_MAPPING",
				`Source mapping '${key}' count does not match imported hits.`,
			);
		}
	}
	for (const [key, target] of Object.entries(mappings.targetOverrides)) {
		if (
			Object.hasOwn(mappings.interpretationOverrides, key) &&
			mappings.interpretationOverrides[key]?.kind === "ignore"
		) {
			throw new ProjectFileValidationError(
				"INVALID_MAPPING_STATE",
				`Ignored source mapping '${key}' cannot also define a target override.`,
			);
		}
		if (
			imported.sourceMappings[key]?.status === SOURCE_MAPPING_STATUS.IGNORED &&
			(!Object.hasOwn(mappings.interpretationOverrides, key) ||
				mappings.interpretationOverrides[key]?.kind !== "piece")
		) {
			throw new ProjectFileValidationError(
				"INVALID_MAPPING_STATE",
				`An ignored source mapping '${key}' requires a piece override before a target override.`,
			);
		}
		const piece = effectiveMappingPiece(key, imported.sourceMappings, mappings);
		validatePieceTarget(piece, target);
	}
}

function effectiveMappingTarget(
	key: string,
	sourceMappings: Readonly<Record<string, SourceMappingDefinition>>,
	mappings: ProjectMappings,
	effectivePiece: Exclude<DrumPiece, "unknown">,
): CloneHeroTarget {
	const override = Object.hasOwn(mappings.targetOverrides, key)
		? mappings.targetOverrides[key]
		: undefined;
	if (override !== undefined) return override;
	if (
		Object.hasOwn(mappings.interpretationOverrides, key) &&
		mappings.interpretationOverrides[key]?.kind === "piece"
	) {
		return standardTargetForPiece(effectivePiece);
	}
	return (
		sourceMappings[key]?.defaultTarget ?? standardTargetForPiece(effectivePiece)
	);
}

function standardTargetForPiece(
	piece: Exclude<DrumPiece, "unknown">,
): CloneHeroTarget {
	switch (piece) {
		case DRUM_PIECE.KICK:
			return { lane: CLONE_HERO_LANE.KICK, cymbal: false };
		case DRUM_PIECE.SNARE:
			return { lane: CLONE_HERO_LANE.RED, cymbal: false };
		case DRUM_PIECE.HIHAT_CLOSED:
		case DRUM_PIECE.HIHAT_OPEN:
			return { lane: CLONE_HERO_LANE.YELLOW, cymbal: true };
		case DRUM_PIECE.CRASH:
		case DRUM_PIECE.RIDE:
			return { lane: CLONE_HERO_LANE.GREEN, cymbal: true };
		case DRUM_PIECE.TOM_HIGH:
			return { lane: CLONE_HERO_LANE.YELLOW, cymbal: false };
		case DRUM_PIECE.TOM_MID:
			return { lane: CLONE_HERO_LANE.BLUE, cymbal: false };
		case DRUM_PIECE.TOM_FLOOR:
			return { lane: CLONE_HERO_LANE.GREEN, cymbal: false };
	}
}

function effectiveMappingPiece(
	key: string,
	sourceMappings: Readonly<Record<string, SourceMappingDefinition>>,
	mappings: ProjectMappings,
): Exclude<DrumPiece, "unknown"> {
	const override = Object.hasOwn(mappings.interpretationOverrides, key)
		? mappings.interpretationOverrides[key]
		: undefined;
	if (override?.kind === "piece") return override.piece;
	const piece = sourceMappings[key]?.detectedPiece;
	if (piece === undefined || piece === DRUM_PIECE.UNKNOWN) {
		throw new ProjectFileValidationError(
			"INVALID_DRUM_PIECE",
			`Source mapping '${key}' has no effective musical piece.`,
		);
	}
	return piece;
}

function validateTarget(input: unknown): CloneHeroTarget {
	const value = record(
		input,
		"INVALID_CLONE_HERO_TARGET",
		"Clone Hero target must be an object.",
	);
	exactKeys(value, ["lane", "cymbal"], "INVALID_CLONE_HERO_TARGET");
	const lane = stringMember<CloneHeroLane>(
		value["lane"],
		VALID_LANES,
		"INVALID_CLONE_HERO_TARGET",
	);
	const cymbal = booleanField(value, "cymbal", "INVALID_CLONE_HERO_TARGET");
	if (cymbal && (lane === CLONE_HERO_LANE.KICK || lane === CLONE_HERO_LANE.RED)) {
		throw new ProjectFileValidationError(
			"INVALID_CLONE_HERO_TARGET",
			"Kick and red lanes cannot be cymbals.",
		);
	}
	return { lane, cymbal };
}

function validatePieceTarget(
	piece: Exclude<DrumPiece, "unknown">,
	target: CloneHeroTarget,
): void {
	if (piece === DRUM_PIECE.KICK && target.lane !== CLONE_HERO_LANE.KICK) {
		throw new ProjectFileValidationError(
			"INVALID_PIECE_TARGET_COMBINATION",
			"A kick must target the normal Expert kick lane.",
		);
	}
	if (piece !== DRUM_PIECE.KICK && target.lane === CLONE_HERO_LANE.KICK) {
		throw new ProjectFileValidationError(
			"INVALID_PIECE_TARGET_COMBINATION",
			"Only a kick may target the kick lane.",
		);
	}
	if (CYMBAL_PIECES.has(piece) !== target.cymbal) {
		throw new ProjectFileValidationError(
			"INVALID_PIECE_TARGET_COMBINATION",
			`Musical piece '${piece}' is inconsistent with target cymbal semantics.`,
		);
	}
}

function toCanonicalProject(project: ChdgProjectFile): ChdgProjectFile {
	return {
		schemaVersion: 1,
		...(project.appVersion === undefined ? {} : { appVersion: project.appVersion }),
		project: { ...project.project },
		import: {
			selectedTrackIds: [...project.import.selectedTrackIds],
			sourceMappings: sortRecord(project.import.sourceMappings),
			importedAt: project.import.importedAt,
			importerVersion: project.import.importerVersion,
		},
		assets: {
			source: { ...project.assets.source },
			audio: { ...project.assets.audio },
			...(project.assets.cover === undefined
				? {}
				: { cover: { ...project.assets.cover } }),
		},
		sourceDocument: {
			resolution: project.sourceDocument.resolution,
			tempos: [...project.sourceDocument.tempos],
			timeSignatures: [...project.sourceDocument.timeSignatures],
			sections: [...project.sourceDocument.sections],
			hits: [...project.sourceDocument.hits],
		},
		mappings: {
			interpretationOverrides: sortRecord(
				project.mappings.interpretationOverrides,
			),
			targetOverrides: sortRecord(project.mappings.targetOverrides),
		},
		corrections: sortRecord(project.corrections),
		editor: { offsetMs: project.editor.offsetMs },
		export: {
			status: project.export.status,
			...(project.export.targetDirectory === undefined
				? {}
				: { targetDirectory: project.export.targetDirectory }),
			...(project.export.lastSuccessfulAt === undefined
				? {}
				: { lastSuccessfulAt: project.export.lastSuccessfulAt }),
			...(project.export.fingerprints === undefined
				? {}
				: { fingerprints: { ...project.export.fingerprints } }),
			...(project.export.managedFiles === undefined
				? {}
				: { managedFiles: sortRecord(project.export.managedFiles) }),
		},
	};
}

function sortRecord<T>(value: Readonly<Record<string, T>>): Record<string, T> {
	const sorted = safeRecord<T>();
	for (const key of Object.keys(value).sort((left, right) =>
		left < right ? -1 : left > right ? 1 : 0,
	)) {
		sorted[key] = value[key] as T;
	}
	return sorted;
}

function safeRecord<T>(): Record<string, T> {
	return Object.create(null) as Record<string, T>;
}

function normalizeArticulationKey(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function internalPath(input: unknown, asset: string): string {
	if (
		typeof input !== "string" ||
		input.length === 0 ||
		input.startsWith("/") ||
		WINDOWS_ABSOLUTE_PATH_PATTERN.test(input) ||
		input.includes("\\") ||
		input.includes("//") ||
		input.startsWith("./") ||
		input.split("/").some((segment) => segment === "." || segment === "..") ||
		CONTROL_CHARACTER_PATTERN.test(input) ||
		!input.startsWith("assets/")
	) {
		throw new ProjectFileValidationError(
			"INVALID_ASSET_PATH",
			`Internal ${asset} path must be a normalized project-relative POSIX path.`,
		);
	}
	return input;
}

function drumPiece(
	input: unknown,
	allowUnknown: true,
): DrumPiece;
function drumPiece(
	input: unknown,
	allowUnknown: false,
): Exclude<DrumPiece, "unknown">;
function drumPiece(input: unknown, allowUnknown: boolean): DrumPiece {
	if (
		typeof input !== "string" ||
		!ALL_DRUM_PIECES.has(input) ||
		(!allowUnknown && !MUSICAL_DRUM_PIECES.has(input))
	) {
		throw new ProjectFileValidationError(
			"INVALID_DRUM_PIECE",
			`Invalid musical drum piece: ${String(input)}.`,
		);
	}
	return input as DrumPiece;
}

function validateStrictTickOrder(
	entries: readonly { readonly tick: number }[],
	code: string,
): void {
	for (let index = 1; index < entries.length; index += 1) {
		if (entries[index]!.tick <= entries[index - 1]!.tick) {
			throw new ProjectFileValidationError(
				code,
				"Timing entries must be strictly sorted by tick.",
			);
		}
	}
}

function exactKeys(
	value: Record<string, unknown>,
	allowed: readonly string[],
	code: string,
): void {
	const allowedSet = new Set(allowed);
	const unexpected = Object.keys(value).find((key) => !allowedSet.has(key));
	if (unexpected !== undefined) {
		throw new ProjectFileValidationError(
			code,
			`Unexpected field '${unexpected}'.`,
		);
	}
}

function record(
	input: unknown,
	code: string,
	message: string,
): Record<string, unknown> {
	if (!isRecord(input)) {
		throw new ProjectFileValidationError(code, message);
	}
	return input;
}

function isRecord(input: unknown): input is Record<string, unknown> {
	return typeof input === "object" && input !== null && !Array.isArray(input);
}

function array(input: unknown, code: string): unknown[] {
	if (!Array.isArray(input)) {
		throw new ProjectFileValidationError(code, "Expected an array.");
	}
	return input;
}

function integerArray(input: unknown, code: string): number[] {
	return array(input, code).map((item) => nonNegativeInteger(item, code));
}

function nonEmptyString(
	value: Record<string, unknown>,
	key: string,
	code: string,
): string {
	const field = value[key];
	if (typeof field !== "string" || field.trim().length === 0) {
		throw new ProjectFileValidationError(code, `${key} must be a non-empty string.`);
	}
	return field;
}

function stringField(
	value: Record<string, unknown>,
	key: string,
	code: string,
): string {
	const field = value[key];
	if (typeof field !== "string") {
		throw new ProjectFileValidationError(code, `${key} must be a string.`);
	}
	return field;
}

function optionalStringProperty(
	value: Record<string, unknown>,
	key: string,
	code: string,
): Record<string, string> {
	if (value[key] === undefined) return {};
	return { [key]: stringField(value, key, code) };
}

function optionalNonNegativeIntegerProperty(
	value: Record<string, unknown>,
	key: string,
	code: string,
): Record<string, number> {
	if (value[key] === undefined) return {};
	return { [key]: nonNegativeInteger(value[key], code) };
}

function optionalNonEmptyString(
	value: Record<string, unknown>,
	key: string,
	code: string,
): string | undefined {
	if (value[key] === undefined) return undefined;
	return nonEmptyString(value, key, code);
}

function sourceKindField(
	value: Record<string, unknown>,
	key: string,
	code: string,
): "midi" | "gpif" {
	const field = value[key];
	if (field !== "midi" && field !== "gpif") {
		throw new ProjectFileValidationError(code, `${key} must be 'midi' or 'gpif'.`);
	}
	return field;
}

function timestamp(
	value: Record<string, unknown>,
	key: string,
	code: string,
): string {
	const field = value[key];
	if (
		typeof field !== "string" ||
		!ISO_TIMESTAMP_PATTERN.test(field) ||
		!Number.isFinite(Date.parse(field))
	) {
		throw new ProjectFileValidationError(code, `${key} must be an ISO UTC timestamp.`);
	}
	return field;
}

function sha256(input: unknown, code: string): string {
	if (typeof input !== "string" || !SHA256_PATTERN.test(input)) {
		throw new ProjectFileValidationError(code, "Expected a SHA-256 hex digest.");
	}
	return input.toLowerCase();
}

function finiteNumber(input: unknown, code: string): number {
	if (typeof input !== "number" || !Number.isFinite(input)) {
		throw new ProjectFileValidationError(code, "Expected a finite number.");
	}
	return input;
}

function nonNegativeFiniteNumber(input: unknown, code: string): number {
	const value = finiteNumber(input, code);
	if (value < 0) {
		throw new ProjectFileValidationError(code, "Expected a non-negative number.");
	}
	return value;
}

function positiveFiniteNumber(input: unknown, code: string): number {
	const value = finiteNumber(input, code);
	if (value <= 0) {
		throw new ProjectFileValidationError(code, "Expected a positive number.");
	}
	return value;
}

function nonNegativeInteger(input: unknown, code: string): number {
	const value = nonNegativeFiniteNumber(input, code);
	if (!Number.isInteger(value)) {
		throw new ProjectFileValidationError(code, "Expected a non-negative integer.");
	}
	return value;
}

function positiveInteger(input: unknown, code: string): number {
	const value = nonNegativeInteger(input, code);
	if (value === 0) {
		throw new ProjectFileValidationError(code, "Expected a positive integer.");
	}
	return value;
}

function integerInRange(
	input: unknown,
	minimum: number,
	maximum: number,
	code: string,
): number {
	const value = nonNegativeInteger(input, code);
	if (value < minimum || value > maximum) {
		throw new ProjectFileValidationError(
			code,
			`Expected an integer from ${minimum} through ${maximum}.`,
		);
	}
	return value;
}

function booleanField(
	value: Record<string, unknown>,
	key: string,
	code: string,
): boolean {
	const field = value[key];
	if (typeof field !== "boolean") {
		throw new ProjectFileValidationError(code, `${key} must be a boolean.`);
	}
	return field;
}

function optionalBoolean(
	value: Record<string, unknown>,
	key: string,
	code: string,
): boolean | undefined {
	return value[key] === undefined ? undefined : booleanField(value, key, code);
}

function stringMember<T extends string>(
	input: unknown,
	values: ReadonlySet<string>,
	code: string,
): T {
	if (typeof input !== "string" || !values.has(input)) {
		throw new ProjectFileValidationError(code, `Invalid value: ${String(input)}.`);
	}
	return input as T;
}
