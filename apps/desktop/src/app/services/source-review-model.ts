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

export type SourceReviewMappingRow = {
	key: string;
	action?: "map" | "candidate" | "ignore" | "unknown";
	automaticPiece?: string;
	suggestedPiece?: string;
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
