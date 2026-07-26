import type {
	ChdgSourceDocument,
	NormalizationPreview,
	NormalizedSourceTiming,
	SourceInspectionResult,
} from "@chdg/project/browser";

export type DesktopSourceTiming = Pick<
	ChdgSourceDocument,
	"resolution" | "tempos" | "timeSignatures" | "sections"
>;

export interface DesktopProjectIdentity {
	projectId: string;
	artist: string;
	songName: string;
	projectName: string;
	displayName: string;
}

export const DESKTOP_OUTPUT_STATUS = {
	NOT_GENERATED: "not-generated",
	GENERATED: "generated",
	NEEDS_REGENERATE: "needs-regenerate",
	FAILED: "failed",
} as const;

export type DesktopOutputStatus =
	(typeof DESKTOP_OUTPUT_STATUS)[keyof typeof DESKTOP_OUTPUT_STATUS];

/**
 * Transient source identity used only to invalidate runtime Source Review data.
 * It is deliberately not part of the persisted V1 project aggregate.
 */
export interface SourceReviewFingerprint {
	path: string;
	sizeBytes?: number;
	mtimeMs?: number;
}

/**
 * Runtime-only Source Review state retained while the legacy route remains
 * reachable. Canonical project persistence never reads or writes this cache.
 */
export interface SourceReviewRuntimeCache {
	schemaVersion: 1 | 2;
	sourceFingerprint: SourceReviewFingerprint;
	mappingFingerprint: string;
	selectedTracks: number[];
	inspectedAt: string;
	normalizedAt?: string;
	inspection: SourceInspectionResult;
	normalizationPreview?: NormalizationPreview;
	normalizedTiming?: NormalizedSourceTiming;
}
