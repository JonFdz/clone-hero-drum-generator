import { formatTrackNoteCount } from "../../services/track-note-count";
import type { ProjectIssue } from "@chdg/project/browser";

/** Compact icon labels for drum pieces used by mapping templates. */
export const PIECE_LABELS: Record<string, string> = {
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

/** Ordered drum-piece ids offered as override targets. */
export const MAPPING_PIECES = [
	"kick",
	"snare",
	"hihat_closed",
	"hihat_open",
	"crash",
	"ride",
	"tom_high",
	"tom_mid",
	"tom_floor",
] as const;

export type MappingPiece = (typeof MAPPING_PIECES)[number];

/** Presentation option for a piece selector (value + label precomputed). */
export type PieceOption = { value: string; label: string };

/** Piece selection options including the empty + ignore choices. */
export const MAPPING_PIECE_OPTIONS: PieceOption[] = [
	...MAPPING_PIECES.map((piece) => ({
		value: piece,
		label: pieceLabel(piece),
	})),
];

const PIECE_LABEL_FALLBACK = (piece: string): string =>
	piece.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

/** Human-readable label for a drum piece id. */
export function pieceLabel(piece: string): string {
	return PIECE_LABELS[piece] ?? PIECE_LABEL_FALLBACK(piece);
}

/** Confidence label normalized for display. */
export function confidenceLabel(value: string): string {
	return value === "unknown"
		? "N/A"
		: value.charAt(0).toUpperCase() + value.slice(1);
}

/** File basename extracted from a path. */
export function compactFileName(filePath: string | undefined): string {
	return filePath?.split(/[\\/]/).pop() ?? "";
}

/** Number formatting used across Source Review summaries. */
export function formatNumber(value: number): string {
	return new Intl.NumberFormat().format(value);
}

/** Note-count label for a track candidate row. */
export function noteCountLabel(noteCount: number | null | undefined): string {
	return formatTrackNoteCount(noteCount);
}

/** Whether an issue is mapping-related (excluding info severity). */
export function isMappingIssue(issue: ProjectIssue): boolean {
	if (issue.severity === "info") return false;
	return (
		/unknown|unmapped|mapping/i.test(issue.code) ||
		/(unknown|unmapped|mapping|articulation|rimshot|side[- ]?stick|midi note|note \d+)/i.test(
			issue.message,
		) ||
		Boolean(issue.details?.["notes"] || issue.details?.["unknownArticulations"])
	);
}

/** Grouping key for collapsing similar issues. */
export function issueGroupKey(issue: ProjectIssue): string {
	if (issue.severity !== "info")
		return `${issue.severity}:${issue.code}:${issue.message}`;
	return `${issue.severity}:${issue.code}:${issue.message.replace(/\d+/g, "#")}`;
}

/** Display label for a grouped issue (severity · code [· count]). */
export function issueLabel(issue: {
	severity: string;
	code: string;
	count: number;
}): string {
	const base = `${issue.severity} · ${issue.code}`;
	return issue.count > 1 ? `${base} · ${issue.count} similar` : base;
}

/** Infer the source kind for a mapping row from its key prefix. */
export function mappingSourceKind(row: {
	sourceKind?: "midi" | "gpif";
	key: string;
}): "midi" | "gpif" {
	return row.sourceKind ?? (row.key.startsWith("gpif:") ? "gpif" : "midi");
}
