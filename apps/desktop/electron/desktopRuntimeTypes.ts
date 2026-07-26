import type {
	NormalizationPreview,
	NormalizedSourceTiming,
	SourceInspectionResult,
} from "@chdg/project";

export const DESKTOP_OUTPUT_STATUS = {
	NOT_GENERATED: "not-generated",
	GENERATED: "generated",
	NEEDS_REGENERATE: "needs-regenerate",
	FAILED: "failed",
} as const;

export type DesktopOutputStatus =
	(typeof DESKTOP_OUTPUT_STATUS)[keyof typeof DESKTOP_OUTPUT_STATUS];

export interface SourceReviewFingerprint {
	path: string;
	sizeBytes?: number;
	mtimeMs?: number;
}

/** Runtime-only legacy Source Review data. Never serialized to project.chdg. */
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
