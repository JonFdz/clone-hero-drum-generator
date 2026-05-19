import type { DrumHit, DrumPiece } from "@chdg/core";
import { issue } from "./issues.js";
import type { MultiTrackMergeSummary, ProjectIssue } from "./types.js";

const HAND_NOTE_PIECES = new Set<DrumPiece>([
	"snare",
	"hihat_closed",
	"hihat_open",
	"crash",
	"ride",
	"tom_high",
	"tom_mid",
	"tom_floor",
	"unknown",
]);

export function mergeDrumHits(
	hits: DrumHit[],
	selectedTracks: number[],
): { hits: DrumHit[]; summary: MultiTrackMergeSummary } {
	const issues: ProjectIssue[] = [];
	const deduped = deduplicateSamePiece(hits, issues);
	const hihatResolved = resolveHihatConflicts(deduped.hits, issues);
	const sorted = sortHits(hihatResolved.hits);
	const impossibleChordCount = detectImpossibleHandChords(sorted, issues);

	return {
		hits: sorted,
		summary: {
			selectedTracks,
			sourceTrackCount: selectedTracks.length,
			inputHitCount: hits.length,
			mergedHitCount: sorted.length,
			deduplicatedHitCount: deduped.duplicateHitCount,
			duplicateHitCount: deduped.duplicateHitCount,
			impossibleChordCount,
			issues,
		},
	};
}

function deduplicateSamePiece(
	hits: DrumHit[],
	issues: ProjectIssue[],
): { hits: DrumHit[]; duplicateHitCount: number } {
	const byIdentity = new Map<string, DrumHit[]>();
	for (const hit of hits) {
		const key = `${hit.tick}:${hit.piece}`;
		const bucket = byIdentity.get(key) ?? [];
		bucket.push(hit);
		byIdentity.set(key, bucket);
	}

	let duplicateHitCount = 0;
	const deduped: DrumHit[] = [];
	const duplicateTicks: number[] = [];

	for (const bucket of byIdentity.values()) {
		if (bucket.length === 1) {
			deduped.push(bucket[0]);
			continue;
		}

		duplicateHitCount += bucket.length - 1;
		duplicateTicks.push(bucket[0].tick);
		deduped.push(selectStrongestHit(bucket));
	}

	if (duplicateHitCount > 0) {
		issues.push(
			issue(
				"info",
				"DUPLICATE_HIT_DEDUPED",
				`Deduplicated ${duplicateHitCount} duplicate hit${duplicateHitCount === 1 ? "" : "s"}.`,
				{ duplicateHitCount, sampleTicks: sampleNumbers(duplicateTicks) },
			),
		);
	}

	return { hits: deduped, duplicateHitCount };
}

function resolveHihatConflicts(
	hits: DrumHit[],
	issues: ProjectIssue[],
): { hits: DrumHit[] } {
	const byTick = new Map<number, DrumHit[]>();
	for (const hit of hits) {
		const bucket = byTick.get(hit.tick) ?? [];
		bucket.push(hit);
		byTick.set(hit.tick, bucket);
	}

	let conflictCount = 0;
	const conflictTicks: number[] = [];
	const resolved: DrumHit[] = [];

	for (const [tick, bucket] of byTick.entries()) {
		const hasOpen = bucket.some((hit) => hit.piece === "hihat_open");
		const hasClosed = bucket.some((hit) => hit.piece === "hihat_closed");
		if (hasOpen && hasClosed) {
			conflictCount += bucket.filter(
				(hit) => hit.piece === "hihat_closed",
			).length;
			conflictTicks.push(tick);
			resolved.push(...bucket.filter((hit) => hit.piece !== "hihat_closed"));
			continue;
		}
		resolved.push(...bucket);
	}

	if (conflictCount > 0) {
		issues.push(
			issue(
				"warning",
				"HIHAT_OPEN_CLOSED_CONFLICT",
				`Resolved ${conflictCount} closed hi-hat conflict${conflictCount === 1 ? "" : "s"}; open hi-hat wins at the same tick.`,
				{ conflictCount, sampleTicks: sampleNumbers(conflictTicks) },
			),
		);
	}

	return { hits: resolved };
}

function detectImpossibleHandChords(
	hits: DrumHit[],
	issues: ProjectIssue[],
): number {
	const byTick = new Map<number, DrumHit[]>();
	for (const hit of hits) {
		const bucket = byTick.get(hit.tick) ?? [];
		bucket.push(hit);
		byTick.set(hit.tick, bucket);
	}

	const impossibleTicks: number[] = [];
	for (const [tick, bucket] of byTick.entries()) {
		const handNoteCount = bucket.filter((hit) =>
			HAND_NOTE_PIECES.has(hit.piece),
		).length;
		if (handNoteCount > 2) {
			impossibleTicks.push(tick);
		}
	}

	if (impossibleTicks.length > 0) {
		issues.push(
			issue(
				"warning",
				"IMPOSSIBLE_HAND_CHORD",
				`Detected ${impossibleTicks.length} likely impossible hand chord${impossibleTicks.length === 1 ? "" : "s"}; notes were left unchanged.`,
				{
					impossibleChordCount: impossibleTicks.length,
					sampleTicks: sampleNumbers(impossibleTicks),
				},
			),
		);
	}

	return impossibleTicks.length;
}

function selectStrongestHit(hits: DrumHit[]): DrumHit {
	return [...hits].sort(
		(a, b) =>
			b.velocity - a.velocity ||
			b.durationTicks - a.durationTicks ||
			sourceTrackIndex(a) - sourceTrackIndex(b),
	)[0];
}

function sortHits(hits: DrumHit[]): DrumHit[] {
	return [...hits].sort(
		(a, b) =>
			a.tick - b.tick ||
			pieceOrder(a.piece) - pieceOrder(b.piece) ||
			sourceTrackIndex(a) - sourceTrackIndex(b),
	);
}

function pieceOrder(piece: DrumPiece): number {
	return [
		"kick",
		"snare",
		"hihat_closed",
		"hihat_open",
		"tom_high",
		"tom_mid",
		"tom_floor",
		"crash",
		"ride",
		"unknown",
	].indexOf(piece);
}

function sourceTrackIndex(hit: DrumHit): number {
	return hit.source.trackIndex;
}

function sampleNumbers(values: number[]): number[] {
	return [...new Set(values)].sort((a, b) => a - b).slice(0, 10);
}
