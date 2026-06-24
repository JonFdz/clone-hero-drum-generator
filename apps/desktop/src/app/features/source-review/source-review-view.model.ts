import type {
	MappingProfileApplyMode,
	MappingOverrideProfile,
} from "@chdg/project/browser";
import type {
	MappingReviewFilter,
	MappingReviewRowView,
} from "../../services/source-review-model";
import type { TrackCandidate } from "@chdg/project/browser";

/** Presentation-ready row for a track candidate. */
export type TrackRowView = {
	index: number;
	name: string;
	noteCountLabel: string;
	confidenceLabel: string;
	confidenceClass: string;
	statusLabel: string;
	statusClass: string;
	selected: boolean;
};

/** Presentation-ready row for a mapping review entry. */
export type MappingReviewRowViewWithControls = MappingReviewRowView & {
	selectValue: string;
	selectOptions: { value: string; label: string }[];
	showIgnoreAction: boolean;
};

export type MappingFilterOption = { id: MappingReviewFilter; label: string };

/** Display issue with precomputed label and mapping flag. */
export type DisplayIssueView = {
	severity: "error" | "warning" | "info";
	code: string;
	message: string;
	count: number;
	label: string;
	isMapping: boolean;
};

/** Piece summary entry for the piece summary preview. */
export type PieceSummaryEntry = { kind: string; label: string; count: string };

/** Source summary facts row. */
export type SummaryFact = { icon: string; label: string; value: string };

/** Combined summary view model. */
export type CombinedSummaryView = {
	selectedTracks: number;
	hitCountLabel: string;
	duplicatesLabel: string;
	unknownCountLabel: string;
	warningCountLabel: string;
};

/** Mapping profile view model with precomputed override count. */
export type MappingProfileView = {
	id: string;
	name: string;
	description?: string;
	overrideCount: number;
};

/** Inputs needed by the selected-source card. */
export type SelectedSourceView = {
	sourceKind: "midi" | "gpif" | undefined;
	sourceKindLabel: string;
	fileName: string;
	filePath: string;
	analyzedAt: string;
};

/** Apply-mode option for the profiles selector. */
export type ApplyModeOption = { value: MappingProfileApplyMode; label: string };

export type ApplyModeOptions = readonly ApplyModeOption[];

export const APPLY_MODE_OPTIONS: ApplyModeOption[] = [
	{ value: "merge", label: "merge" },
	{ value: "replace", label: "replace" },
];

/** Re-exports to keep component files colocated. */
export type { MappingOverrideProfile, TrackCandidate };
