import { describe, expect, it } from "vitest";
import {
	PREVIEW_LANES,
	adaptChartPreviewDataToPreviewNotes,
	computePreviewViewport,
	filterVisiblePreviewNotes,
	pieceToPreviewGlyph,
	pieceToPreviewLane,
	projectPercentToSeconds,
	projectSecondsToPercent,
	type PreviewNote,
} from "./preview-chart-stage-model";

function previewNoteEvent(tick: number, lane: number, seconds: number, length = 0) {
	return { tick, lane, length, seconds, endSeconds: seconds + length / 192 / 2 };
}

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
		expect(computePreviewViewport(0, 60)).toEqual({
			startSeconds: 0,
			endSeconds: 3.5,
			durationSeconds: 60,
		});
		expect(computePreviewViewport(10, 60)).toEqual({
			startSeconds: 9.5,
			endSeconds: 13,
			durationSeconds: 60,
		});
		expect(computePreviewViewport(178, 180)).toEqual({
			startSeconds: 176.5,
			endSeconds: 180,
			durationSeconds: 180,
		});
		expect(computePreviewViewport(3, 3)).toEqual({
			startSeconds: 0,
			endSeconds: 3,
			durationSeconds: 3,
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

	it("projects chart x percent back to seconds", () => {
		const viewport = { startSeconds: 9.5, endSeconds: 13 };
		expect(projectPercentToSeconds(0, viewport)).toBe(9.5);
		expect(projectPercentToSeconds(0.5, viewport)).toBe(11.25);
		expect(projectPercentToSeconds(1, viewport)).toBe(13);
		expect(projectPercentToSeconds(-1, viewport)).toBe(9.5);
		expect(projectPercentToSeconds(2, viewport)).toBe(13);
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
				sectionEvents: [],
				noteEvents: [
					previewNoteEvent(1, 0, 1),
					previewNoteEvent(2, 2, 2),
					previewNoteEvent(3, 2, 3),
					previewNoteEvent(3, 66, 3),
					previewNoteEvent(4, 3, 4),
					previewNoteEvent(4, 67, 4),
					previewNoteEvent(5, 4, 5),
					previewNoteEvent(5, 68, 5),
					previewNoteEvent(6, 99, 6),
				],
			},
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

	it("does not adapt normalization fallback data into generated preview notes", () => {
		const notes = adaptChartPreviewDataToPreviewNotes(null);
		expect(notes).toEqual([]);
	});

	it("produces visible chart-stage notes around the current viewport", () => {
		const viewport = computePreviewViewport(12, 30);
		const notes = adaptChartPreviewDataToPreviewNotes(
			{
				resolution: 192,
				offsetSeconds: 0,
				hasAccurateTiming: true,
				limitations: [],
				sectionEvents: [],
				noteEvents: [
					previewNoteEvent(1, 0, 11.1),
					previewNoteEvent(2, 1, 11.5),
					previewNoteEvent(3, 2, 13),
					previewNoteEvent(4, 3, 15.4),
				],
			},
			0,
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
