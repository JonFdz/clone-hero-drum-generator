import type {
	ChdgProjectAnalysisCache,
	ChdgSourceFingerprint,
	NormalizationPreview,
	ProjectMappingOverrides,
	SourceInspectionResult,
	TrackCandidate,
} from "@chdg/project/browser";
import { chooseDefaultTracks } from "./desktop-generate-model";

export type SourceReviewCacheValidation =
	| {
			valid: true;
			inspection: SourceInspectionResult;
			normalizationPreview?: NormalizationPreview;
	  }
	| {
			valid: false;
			reason: "missing" | "source" | "mapping" | "tracks" | "normalization";
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
	return stableStringify(overrides ?? {});
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
		schemaVersion: 1,
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

export function shouldExpandMappingReview(input: {
	normalizationPreview?: NormalizationPreview;
	overrides: ProjectMappingOverrides;
	manualReviewRecommended?: boolean;
	profileError?: boolean;
	forcedOpen?: boolean;
}): boolean {
	return Boolean(
		input.forcedOpen ||
			input.manualReviewRecommended ||
			input.profileError ||
			Object.keys(input.overrides).length > 0 ||
			(input.normalizationPreview?.mappingCandidates ?? []).some(
				(candidate) => candidate.automaticPiece === "unknown",
			) ||
			(input.normalizationPreview?.issues ?? []).some(
				(issue) => issue.severity === "warning" || issue.severity === "error",
			),
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
