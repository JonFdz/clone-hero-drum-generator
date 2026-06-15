import type {
	ChdgProjectAnalysisCache,
	ChdgSourceFingerprint,
	NormalizationPreview,
	ProjectMappingOverrides,
	SourceInspectionResult,
	TrackCandidate,
} from "@chdg/project/browser";
import { MIDI_DRUM_NOTE_ATLAS_VERSION } from "@chdg/project/browser";
import { chooseDefaultTracks } from "./desktop-generate-model";

// Keep this browser-side fingerprint constant aligned with
// GPIF_ARTICULATION_RESOLVER_VERSION in @chdg/guitarpro. Importing the parser
// package directly here would couple the desktop browser model to GPIF parsing
// dependencies just to read a cache key.
const GPIF_ARTICULATION_RESOLVER_FINGERPRINT_VERSION = "0.1.0";

export type SourceReviewMappingRow = {
	key: string;
	sourceKind?: "midi" | "gpif";
	sourceValue?: string;
	label?: string;
	noteName?: string;
	inputMidiNumbers?: number[];
	outputMidiNumber?: number;
	resolvedVia?: string;
	action?: "map" | "candidate" | "ignore" | "unknown";
	automaticPiece?: string;
	suggestedPiece?: string;
	confidence?: string;
	family?: string;
	reason?: string;
	count?: number;
	firstTick?: number;
};

export type MappingReviewFilter =
	| "needs-review"
	| "candidates"
	| "unknown"
	| "ignored-known"
	| "auto-mapped"
	| "overrides"
	| "all";

export type MappingReviewRowKind =
	| "auto-mapped"
	| "candidate"
	| "ignored-known"
	| "unknown"
	| "override";

export type MappingReviewBadgeTone =
	| "success"
	| "review"
	| "info"
	| "warning"
	| "accent"
	| "neutral";

export type MappingReviewRowView = SourceReviewMappingRow & {
	kind: MappingReviewRowKind;
	badgeLabel: string;
	badgeTone: MappingReviewBadgeTone;
	primaryLabel: string;
	metaLabel: string;
	currentMappingLabel: string;
	automaticMappingLabel?: string;
	suggestedPieceLabel?: string;
	hasOverride: boolean;
	overrideLabel?: string;
	unresolved: boolean;
	unresolvedType?: "candidate" | "unknown";
};

export type SourceReviewMappingCounts = {
	unknown: number;
	candidates: number;
	ignoredKnown: number;
	unresolvedUnknown: number;
	unresolvedCandidates: number;
};

export type SourceReviewMappingAttention =
	| "manual-mapping-needed"
	| "review-recommended"
	| "known-percussion-ignored"
	| "ready";

export type SourceReviewCacheValidation =
	| {
			valid: true;
			inspection: SourceInspectionResult;
			normalizationPreview?: NormalizationPreview;
	  }
	| {
			valid: false;
			reason: "missing" | "source" | "inspection" | "mapping" | "tracks" | "normalization";
	  };

export function strongestDefaultTrack(tracks: TrackCandidate[]): number[] {
	return chooseDefaultTracks(tracks).slice(0, 1);
}

export function sourceFingerprintMatches(
	left: ChdgSourceFingerprint | undefined,
	right: ChdgSourceFingerprint | undefined,
): boolean {
	return Boolean(
		left &&
			right &&
			left.path === right.path &&
			left.sizeBytes === right.sizeBytes &&
			left.mtimeMs === right.mtimeMs,
	);
}

export function selectedTracksKey(selectedTracks: number[]): string {
	return [...selectedTracks].sort((a, b) => a - b).join(",");
}

export function stableMappingFingerprint(
	overrides: ProjectMappingOverrides | undefined,
): string {
	return stableStringify({
		gpifArticulationResolverVersion:
			GPIF_ARTICULATION_RESOLVER_FINGERPRINT_VERSION,
		mappingAtlasVersion: MIDI_DRUM_NOTE_ATLAS_VERSION,
		overrides: overrides ?? {},
	});
}

export function validateSourceReviewCache(input: {
	cache: ChdgProjectAnalysisCache | undefined;
	sourceFingerprint: ChdgSourceFingerprint;
	mappingFingerprint: string;
	selectedTracks: number[];
}): SourceReviewCacheValidation {
	const { cache, sourceFingerprint, mappingFingerprint, selectedTracks } =
		input;
	if (!cache) return { valid: false, reason: "missing" };
	if (!sourceFingerprintMatches(cache.sourceFingerprint, sourceFingerprint)) {
		return { valid: false, reason: "source" };
	}
	if (hasStaleGpifTrackNoteCounts(cache, selectedTracks)) {
		return { valid: false, reason: "inspection" };
	}
	if (cache.normalizationPreview?.mappingCoverage?.atlasVersion !== undefined &&
		cache.normalizationPreview.mappingCoverage.atlasVersion !== MIDI_DRUM_NOTE_ATLAS_VERSION
	) {
		return { valid: false, reason: "mapping" };
	}
	if (cache.mappingFingerprint !== mappingFingerprint) {
		return cache.inspection
			? { valid: false, reason: "mapping" }
			: { valid: false, reason: "missing" };
	}
	if (
		selectedTracksKey(cache.selectedTracks) !==
		selectedTracksKey(selectedTracks)
	) {
		return { valid: false, reason: "tracks" };
	}
	if (!cache.normalizationPreview) {
		return { valid: false, reason: "normalization" };
	}
	return {
		valid: true,
		inspection: cache.inspection,
		normalizationPreview: cache.normalizationPreview,
	};
}

export function resolvePreviewAnalysisCache(input: {
	cache: ChdgProjectAnalysisCache | undefined;
	sourceFingerprint: ChdgSourceFingerprint;
	mappingFingerprint: string;
	selectedTracks: number[];
}): ChdgProjectAnalysisCache | undefined {
	return validateSourceReviewCache(input).valid ? input.cache : undefined;
}


export function hasStaleGpifTrackNoteCounts(
	cache: ChdgProjectAnalysisCache,
	selectedTracks: number[],
): boolean {
	if (cache.schemaVersion >= 2) return false;
	const inspection = cache.inspection;
	if (inspection.sourceKind !== "gpif") return false;
	if (inspection.tracks.length === 0) return false;
	const hasKnownNoteCount = (track: TrackCandidate): boolean =>
		typeof track.noteCount === "number" && Number.isFinite(track.noteCount);
	const selected = new Set(selectedTracks);
	const selectedTrackMissingCount = inspection.tracks.some(
		(track) => selected.has(track.index) && !hasKnownNoteCount(track),
	);
	const allTracksMissingCounts = inspection.tracks.every(
		(track) => !hasKnownNoteCount(track),
	);
	return selectedTrackMissingCount || allTracksMissingCounts;
}

export function createAnalysisCache(input: {
	sourceFingerprint: ChdgSourceFingerprint;
	mappingFingerprint: string;
	selectedTracks: number[];
	inspection: SourceInspectionResult;
	normalizationPreview?: NormalizationPreview;
	inspectedAt?: string;
	normalizedAt?: string;
}): ChdgProjectAnalysisCache {
	return {
		schemaVersion: 2,
		sourceFingerprint: input.sourceFingerprint,
		mappingFingerprint: input.mappingFingerprint,
		selectedTracks: [...input.selectedTracks].sort((a, b) => a - b),
		inspectedAt: input.inspectedAt ?? new Date().toISOString(),
		...(input.normalizedAt ? { normalizedAt: input.normalizedAt } : {}),
		inspection: input.inspection,
		...(input.normalizationPreview
			? { normalizationPreview: input.normalizationPreview }
			: {}),
	};
}

export const MAPPING_REVIEW_FILTERS: ReadonlyArray<{ id: MappingReviewFilter; label: string }> = [
	{ id: "needs-review", label: "Needs review" },
	{ id: "candidates", label: "Candidates" },
	{ id: "unknown", label: "Unknown" },
	{ id: "ignored-known", label: "Ignored known" },
	{ id: "auto-mapped", label: "Auto-mapped" },
	{ id: "overrides", label: "Overrides" },
	{ id: "all", label: "All" },
];

export function classifyMappingRow(
	row: SourceReviewMappingRow,
	overrides: ProjectMappingOverrides,
): MappingReviewRowKind {
	if (overrides[row.key]) return "override";
	if (row.action === "unknown") return "unknown";
	if (row.action === "candidate") return "candidate";
	if (row.action === "ignore") return "ignored-known";
	if (row.action === "map") return "auto-mapped";
	return row.automaticPiece === "unknown" || !row.automaticPiece
		? "unknown"
		: "auto-mapped";
}

export function mappingReviewPrimaryLabel(row: SourceReviewMappingRow): string {
	const sourceKind = row.sourceKind ?? (row.key.startsWith("gpif:") ? "gpif" : "midi");
	const sourceValue = cleanMappingLabel(row.sourceValue ?? sourceValueFromKey(row.key));
	const noteName = cleanMappingLabel(row.noteName ?? row.label);
	if (sourceKind === "gpif") {
		const detail = noteName && !labelsEquivalent(noteName, sourceValue) ? noteName : sourceValue;
		return detail ? `GPIF articulation · ${detail}` : "GPIF articulation";
	}
	const midiValue = sourceValue.match(/^midi\s+\d+$/i)
		? sourceValue
		: /^\d+$/.test(sourceValue)
			? `MIDI ${sourceValue}`
			: sourceValue.toLowerCase().startsWith("midi:")
				? sourceValue.replace(/^midi:/i, "MIDI ")
				: `MIDI ${sourceValue}`;
	const detail = noteName && !labelsEquivalent(noteName, midiValue) ? noteName : "Unknown";
	return `${midiValue} · ${detail}`;
}

export function mappingReviewMetaLabel(
	row: SourceReviewMappingRow,
	kind: MappingReviewRowKind,
	override: ProjectMappingOverrides[string] | undefined,
): string {
	const parts = [
		mappingReviewBadgeLabel(kind, override),
		row.count === undefined ? undefined : `${row.count} ${row.count === 1 ? "hit" : "hits"}`,
		row.firstTick === undefined ? undefined : `first tick ${row.firstTick}`,
	].filter((part): part is string => Boolean(part));
	return parts.join(" · ");
}

function cleanMappingLabel(value: string | undefined): string {
	if (!value) return "";
	return value
		.replace(/^gpif\s+articulation\s*\((.*)\)$/i, "$1")
		.replace(/^gpif\s+articulation\s*[·:-]?\s*/i, "")
		.replace(/^\((.*)\)$/i, "$1")
		.trim();
}

function labelsEquivalent(left: string, right: string): boolean {
	const normalize = (value: string) =>
		value.toLowerCase().replace(/^midi[:\s]*/, "").replace(/[^a-z0-9]+/g, "");
	return normalize(left) === normalize(right);
}

function sourceValueFromKey(key: string): string {
	if (key.startsWith("midi:")) return key.replace(/^midi:/, "MIDI ");
	if (key.startsWith("gpif:")) return key.replace(/^gpif:/, "");
	return key;
}

export function buildMappingReviewRowView(
	row: SourceReviewMappingRow,
	overrides: ProjectMappingOverrides,
): MappingReviewRowView {
	const override = overrides[row.key];
	const kind = classifyMappingRow(row, overrides);
	const unresolvedUnknown = isUnresolvedUnknown(row, overrides);
	const unresolvedCandidate = isUnresolvedCandidate(row, overrides);
	const automaticMappingLabel = mappingPieceLabel(row.automaticPiece);
	const suggestedPieceLabel = mappingPieceLabel(row.suggestedPiece);
	const overrideLabel = override
		? override.target.kind === "ignore"
			? "Ignored by project override"
			: `Mapped by project override: ${mappingPieceLabel(override.target.piece)}`
		: undefined;
	return {
		...row,
		kind,
		badgeLabel: mappingReviewBadgeLabel(kind, override),
		badgeTone: mappingReviewBadgeTone(kind),
		primaryLabel: mappingReviewPrimaryLabel(row),
		metaLabel: mappingReviewMetaLabel(row, kind, override),
		currentMappingLabel: currentMappingLabel(row, override),
		automaticMappingLabel,
		suggestedPieceLabel,
		hasOverride: Boolean(override),
		overrideLabel,
		unresolved: unresolvedUnknown || unresolvedCandidate,
		unresolvedType: unresolvedUnknown
			? "unknown"
			: unresolvedCandidate
				? "candidate"
				: undefined,
	};
}

export function buildMappingReviewRows(
	rows: SourceReviewMappingRow[],
	overrides: ProjectMappingOverrides,
): MappingReviewRowView[] {
	return rows.map((row) => buildMappingReviewRowView(row, overrides));
}

export function filterMappingReviewRows(
	rows: SourceReviewMappingRow[],
	overrides: ProjectMappingOverrides,
	filter: MappingReviewFilter,
): MappingReviewRowView[] {
	const views = buildMappingReviewRows(rows, overrides);
	return views.filter((row) => {
		switch (filter) {
			case "needs-review":
				return row.unresolved;
			case "candidates":
				return row.action === "candidate";
			case "unknown":
				return row.action === "unknown" || (!row.action && (row.automaticPiece === "unknown" || !row.automaticPiece));
			case "ignored-known":
				return row.action === "ignore";
			case "auto-mapped":
				return row.kind === "auto-mapped";
			case "overrides":
				return row.hasOverride;
			case "all":
				return true;
		}
	});
}

export function deriveDefaultMappingFilter(input: {
	rows: SourceReviewMappingRow[];
	overrides: ProjectMappingOverrides;
}): MappingReviewFilter {
	const counts = mappingReviewCounts(input);
	return counts.unresolvedCandidates > 0 || counts.unresolvedUnknown > 0
		? "needs-review"
		: "all";
}

export function mappingReviewFilterCount(input: {
	rows: SourceReviewMappingRow[];
	overrides: ProjectMappingOverrides;
	filter: MappingReviewFilter;
}): number {
	return filterMappingReviewRows(
		input.rows,
		input.overrides,
		input.filter,
	).length;
}

function mappingReviewBadgeLabel(
	kind: MappingReviewRowKind,
	override: ProjectMappingOverrides[string] | undefined,
): string {
	if (override?.target.kind === "piece") return "Mapped override";
	if (override?.target.kind === "ignore") return "Ignored override";
	switch (kind) {
		case "auto-mapped":
			return "Auto-mapped";
		case "candidate":
			return "Candidate";
		case "ignored-known":
			return "Ignored known";
		case "unknown":
			return "Unknown";
		case "override":
			return "Override";
	}
}

function mappingReviewBadgeTone(kind: MappingReviewRowKind): MappingReviewBadgeTone {
	switch (kind) {
		case "auto-mapped":
			return "success";
		case "candidate":
			return "review";
		case "ignored-known":
			return "info";
		case "unknown":
			return "warning";
		case "override":
			return "accent";
	}
}

function currentMappingLabel(
	row: SourceReviewMappingRow,
	override: ProjectMappingOverrides[string] | undefined,
): string {
	if (override?.target.kind === "ignore") return "Ignored by project override";
	if (override?.target.kind === "piece") return `Mapped to ${mappingPieceLabel(override.target.piece)}`;
	if (row.action === "candidate") {
		return row.suggestedPiece
			? `Skipped by default · Suggests ${mappingPieceLabel(row.suggestedPiece)}`
			: "Skipped by default · No default lane";
	}
	if (row.action === "ignore") return "Known percussion ignored by default";
	if (row.action === "unknown" || !row.automaticPiece || row.automaticPiece === "unknown") {
		return "Skipped · Unknown lane";
	}
	return `Default mapping: ${mappingPieceLabel(row.automaticPiece)}`;
}

function mappingPieceLabel(piece: string | undefined): string | undefined {
	if (!piece || piece === "unknown") return undefined;
	const labels: Record<string, string> = {
		kick: "Kick",
		snare: "Snare",
		hihat_closed: "Closed Hi-Hat",
		hihat_open: "Open Hi-Hat",
		crash: "Crash",
		ride: "Ride",
		tom_high: "High Tom",
		tom_mid: "Mid Tom",
		tom_floor: "Floor Tom",
	};
	return labels[piece] ?? piece
		.replace(/_/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function hasPieceOverride(
	row: SourceReviewMappingRow,
	overrides: ProjectMappingOverrides,
): boolean {
	return overrides[row.key]?.target.kind === "piece";
}

export function hasIgnoreOverride(
	row: SourceReviewMappingRow,
	overrides: ProjectMappingOverrides,
): boolean {
	return overrides[row.key]?.target.kind === "ignore";
}

export function isUnresolvedUnknown(
	row: SourceReviewMappingRow,
	overrides: ProjectMappingOverrides,
): boolean {
	if (hasPieceOverride(row, overrides) || hasIgnoreOverride(row, overrides)) {
		return false;
	}
	if (row.action) return row.action === "unknown";
	return row.automaticPiece === "unknown" || !row.automaticPiece;
}

export function isUnresolvedCandidate(
	row: SourceReviewMappingRow,
	overrides: ProjectMappingOverrides,
): boolean {
	if (hasPieceOverride(row, overrides) || hasIgnoreOverride(row, overrides)) {
		return false;
	}
	return row.action === "candidate";
}

export function mappingReviewCounts(input: {
	rows: SourceReviewMappingRow[];
	overrides: ProjectMappingOverrides;
}): SourceReviewMappingCounts {
	return input.rows.reduce<SourceReviewMappingCounts>(
		(counts, row) => {
			if (row.action === "unknown" || (!row.action && (row.automaticPiece === "unknown" || !row.automaticPiece))) {
				counts.unknown += 1;
			}
			if (row.action === "candidate") counts.candidates += 1;
			if (row.action === "ignore") counts.ignoredKnown += 1;
			if (isUnresolvedUnknown(row, input.overrides)) counts.unresolvedUnknown += 1;
			if (isUnresolvedCandidate(row, input.overrides)) counts.unresolvedCandidates += 1;
			return counts;
		},
		{
			unknown: 0,
			candidates: 0,
			ignoredKnown: 0,
			unresolvedUnknown: 0,
			unresolvedCandidates: 0,
		},
	);
}

export function mappingAttentionState(input: {
	rows: SourceReviewMappingRow[];
	overrides: ProjectMappingOverrides;
}): SourceReviewMappingAttention {
	const counts = mappingReviewCounts(input);
	if (counts.unresolvedUnknown > 0) return "manual-mapping-needed";
	if (counts.unresolvedCandidates > 0) return "review-recommended";
	if (counts.ignoredKnown > 0) return "known-percussion-ignored";
	return "ready";
}

export function shouldExpandMappingReview(input: {
	normalizationPreview?: NormalizationPreview;
	overrides: ProjectMappingOverrides;
	manualReviewRecommended?: boolean;
	profileError?: boolean;
}): boolean {
	const rows = input.normalizationPreview?.mappingCandidates ?? [];
	const counts = mappingReviewCounts({ rows, overrides: input.overrides });
	return Boolean(
		input.manualReviewRecommended ||
			input.profileError ||
			Object.keys(input.overrides).length > 0 ||
			counts.unresolvedUnknown > 0 ||
			counts.unresolvedCandidates > 0,
	);
}

export function sourceSectionsLabel(
	inspection: SourceInspectionResult | undefined,
): string {
	const count = inspection?.sections?.length ?? 0;
	return count > 0 ? `${count} detected` : "None detected";
}

function stableStringify(value: unknown): string {
	if (value === null || typeof value !== "object") {
		return JSON.stringify(value);
	}
	if (Array.isArray(value)) {
		return `[${value.map((item) => stableStringify(item)).join(",")}]`;
	}
	const record = value as Record<string, unknown>;
	return `{${Object.keys(record)
		.sort()
		.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
		.join(",")}}`;
}
