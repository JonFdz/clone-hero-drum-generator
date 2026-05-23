import { describe, expect, it } from "vitest";
import type {
	NormalizationHitPreview,
	NormalizationPreview,
} from "@chdg/project/browser";
import {
	PREVIEW_LANES,
	adaptChartPreviewDataToPreviewNotes,
	computePreviewViewport,
	filterVisiblePreviewNotes,
	pieceToPreviewGlyph,
	pieceToPreviewLane,
	projectSecondsToPercent,
	type PreviewNote,
} from "./preview-chart-stage-model";

describe("preview-chart-stage-model", () => {
	it("defines the required preview lane order", () => {
		expect(PREVIEW_LANES.map((lane) => lane.id)).toEqual([
			"kick",
			"snare",
			"hi_hat",
			"tom_high",
			"ride",
			"tom_mid",
			"crash",
			"tom_floor",
		]);
	});

	it("maps drum pieces to canonical preview lanes", () => {
		expect(pieceToPreviewLane("kick")).toBe("kick");
		expect(pieceToPreviewLane("snare")).toBe("snare");
		expect(pieceToPreviewLane("sidestick")).toBe("snare");
		expect(pieceToPreviewLane("hihat_open")).toBe("hi_hat");
		expect(pieceToPreviewLane("hihat_closed")).toBe("hi_hat");
		expect(pieceToPreviewLane("tom_high")).toBe("tom_high");
		expect(pieceToPreviewLane("ride")).toBe("ride");
		expect(pieceToPreviewLane("tom_mid")).toBe("tom_mid");
		expect(pieceToPreviewLane("crash")).toBe("crash");
		expect(pieceToPreviewLane("tom_floor")).toBe("tom_floor");
		expect(pieceToPreviewLane("unknown_piece")).toBeNull();
	});

	it("maps cymbals to diamonds and non-cymbals to circles", () => {
		expect(pieceToPreviewGlyph("hihat_closed")?.shape).toBe("diamond");
		expect(pieceToPreviewGlyph("ride")?.shape).toBe("diamond");
		expect(pieceToPreviewGlyph("crash")?.shape).toBe("diamond");

		expect(pieceToPreviewGlyph("kick")?.shape).toBe("circle");
		expect(pieceToPreviewGlyph("snare")?.shape).toBe("circle");
		expect(pieceToPreviewGlyph("tom_high")?.shape).toBe("circle");
		expect(pieceToPreviewGlyph("tom_mid")?.shape).toBe("circle");
		expect(pieceToPreviewGlyph("tom_floor")?.shape).toBe("circle");
	});

	it("keeps same-color families readable by shape", () => {
		expect(pieceToPreviewGlyph("tom_high")).toMatchObject({
			color: pieceToPreviewGlyph("hihat_open")?.color,
			shape: "circle",
		});
		expect(pieceToPreviewGlyph("tom_mid")).toMatchObject({
			color: pieceToPreviewGlyph("ride")?.color,
			shape: "circle",
		});
		expect(pieceToPreviewGlyph("tom_floor")).toMatchObject({
			color: pieceToPreviewGlyph("crash")?.color,
			shape: "circle",
		});
	});

	it("computes a clamped current-time viewport", () => {
		expect(computePreviewViewport(12, 60)).toEqual({
			startSeconds: 10,
			endSeconds: 18,
			durationSeconds: 60,
		});
		expect(computePreviewViewport(1, 60)).toEqual({
			startSeconds: 0,
			endSeconds: 8,
			durationSeconds: 60,
		});
		expect(computePreviewViewport(58, 60)).toEqual({
			startSeconds: 52,
			endSeconds: 60,
			durationSeconds: 60,
		});
		expect(computePreviewViewport(3, 5)).toEqual({
			startSeconds: 0,
			endSeconds: 5,
			durationSeconds: 5,
		});
	});

	it("projects seconds to safe percentages", () => {
		const viewport = { startSeconds: 10, endSeconds: 18 };
		expect(projectSecondsToPercent(10, viewport)).toBe(0);
		expect(projectSecondsToPercent(14, viewport)).toBe(50);
		expect(projectSecondsToPercent(18, viewport)).toBe(100);
		expect(projectSecondsToPercent(9, viewport)).toBe(0);
		expect(projectSecondsToPercent(20, viewport)).toBe(100);
		expect(
			projectSecondsToPercent(14, { startSeconds: 2, endSeconds: 2 }),
		).toBe(0);
	});

	it("filters visible notes with viewport padding", () => {
		const notes = [
			makeNote("early", 9.7),
			makeNote("visible", 10),
			makeNote("late", 18.2),
			makeNote("too-late", 18.4),
		];
		expect(
			filterVisiblePreviewNotes(notes, {
				startSeconds: 10,
				endSeconds: 18,
			}).map((note) => note.id),
		).toEqual(["visible", "late"]);
	});

	it("adapts chart preview data and ignores unknown modifier-only events", () => {
		const notes = adaptChartPreviewDataToPreviewNotes(
			{
				resolution: 192,
				offsetSeconds: 0,
				hasAccurateTiming: true,
				limitations: [],
				noteEvents: [
					{ tick: 1, lane: 0, seconds: 1 },
					{ tick: 2, lane: 2, seconds: 2 },
					{ tick: 3, lane: 2, seconds: 3 },
					{ tick: 3, lane: 66, seconds: 3 },
					{ tick: 4, lane: 3, seconds: 4 },
					{ tick: 4, lane: 67, seconds: 4 },
					{ tick: 5, lane: 4, seconds: 5 },
					{ tick: 5, lane: 68, seconds: 5 },
					{ tick: 6, lane: 99, seconds: 6 },
				],
			},
			undefined,
			10,
			50,
		);
		expect(notes.map((note) => note.piece)).toEqual([
			"kick",
			"tom_high",
			"hihat_closed",
			"ride",
			"crash",
		]);
		expect(notes[0]?.seconds).toBe(1.05);
		expect(notes.find((note) => note.piece === "hihat_closed")?.shape).toBe(
			"diamond",
		);
	});

	it("adapts normalization fallback data and safely skips unknown pieces", () => {
		const notes = adaptChartPreviewDataToPreviewNotes(
			null,
			makeNormalizationPreview([
				{ tick: 0, piece: "kick", velocity: 100, source: midiSource() },
				{
					tick: 50,
					piece: "unknown_piece" as NormalizationHitPreview["piece"],
					velocity: 100,
					source: midiSource(),
				},
				{ tick: 100, piece: "crash", velocity: 100, source: midiSource() },
			]),
			8,
		);
		expect(notes.map((note) => note.piece)).toEqual(["kick", "crash"]);
		expect(notes[1]?.seconds).toBe(8);
		expect(notes[1]?.shape).toBe("diamond");
	});

	it("produces visible chart-stage notes around the current viewport", () => {
		const viewport = computePreviewViewport(12, 30);
		const notes = adaptChartPreviewDataToPreviewNotes(
			{
				resolution: 192,
				offsetSeconds: 0,
				hasAccurateTiming: true,
				limitations: [],
				noteEvents: [
					{ tick: 1, lane: 0, seconds: 9.6 },
					{ tick: 2, lane: 1, seconds: 10 },
					{ tick: 3, lane: 2, seconds: 16 },
					{ tick: 4, lane: 3, seconds: 18.4 },
				],
			},
			undefined,
			30,
		);
		expect(filterVisiblePreviewNotes(notes, viewport).map((note) => note.piece)).toEqual([
			"snare",
			"tom_high",
		]);
	});
});

function makeNote(id: string, seconds: number): PreviewNote {
	return {
		id,
		laneId: "kick",
		piece: "kick",
		seconds,
		color: "#ff8a1f",
		shape: "circle",
	};
}

function makeNormalizationPreview(
	firstHits: NormalizationHitPreview[],
): NormalizationPreview {
	return {
		sourceKind: "midi",
		sourcePath: "/tmp/demo.mid",
		selectedTrack: 0,
		selectedTracks: [0],
		hitCount: firstHits.length,
		pieceSummary: { kick: firstHits.length },
		firstHits,
		issues: [],
		mappingCandidates: [],
	};
}

function midiSource() {
	return { midiNote: 36, trackIndex: 0, trackName: "Test", channel: 9 };
}
