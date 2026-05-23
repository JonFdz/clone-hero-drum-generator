import { describe, expect, it } from "vitest";
import type {
	NormalizationHitPreview,
	NormalizationPreview,
} from "@chdg/project/browser";
import {
	HIGHWAY_HIT_LINE_PERCENT,
	buildWaveformBars,
	deriveHighwayLimitations,
	deriveHighwayNotes,
	deriveTimelineNotes,
	effectiveNoteTime,
	formatTime,
	offsetMsToSeconds,
} from "./desktop-preview-model";

describe("desktop-preview-model", () => {
	it("formats time", () => {
		expect(formatTime(12.345)).toBe("00:12.345");
	});

	it("builds waveform-like bars", () => {
		expect(buildWaveformBars(10, 12)).toHaveLength(12);
	});

	it("converts milliseconds and applies preview note timing", () => {
		expect(offsetMsToSeconds(900)).toBe(0.9);
		expect(offsetMsToSeconds(-120)).toBe(-0.12);
		expect(effectiveNoteTime(1, 50)).toBe(1.05);
		expect(effectiveNoteTime(1, -50)).toBe(0.95);
	});

	it("derives notes from chart data", () => {
		const notes = deriveTimelineNotes(
			{
				resolution: 192,
				offsetSeconds: 0,
				hasAccurateTiming: true,
				limitations: [],
				noteEvents: [
					{ tick: 0, lane: 0, seconds: 1 },
					{ tick: 100, lane: 1, seconds: 2 },
				],
			},
			undefined,
			10,
			1.05,
			0,
		);
		expect(notes[0]?.highlighted).toBe(true);
		expect(notes[1]?.highlighted).toBe(false);
	});

	it("maps chart base notes and modifiers to highway notes", () => {
		const notes = deriveHighwayNotes(
			{
				resolution: 192,
				offsetSeconds: 0,
				hasAccurateTiming: true,
				limitations: [],
				noteEvents: [
					{ tick: 192, lane: 2, seconds: 1 },
					{ tick: 192, lane: 66, seconds: 1 },
					{ tick: 192, lane: 35, seconds: 1 },
					{ tick: 192, lane: 41, seconds: 1 },
				],
			},
			undefined,
			0,
			10,
			0,
		);
		expect(notes).toHaveLength(1);
		expect(notes[0]).toMatchObject({
			lane: "yellow",
			cymbal: true,
			accent: true,
			ghost: true,
		});
	});

	it("ignores orphan modifiers without crashing", () => {
		const notes = deriveHighwayNotes(
			{
				resolution: 192,
				offsetSeconds: 0,
				hasAccurateTiming: true,
				limitations: [],
				noteEvents: [{ tick: 192, lane: 66, seconds: 1 }],
			},
			undefined,
			0,
			10,
			0,
		);
		expect(notes).toHaveLength(0);
	});

	it("positions notes around the hit line by current time", () => {
		const notes = deriveHighwayNotes(
			{
				resolution: 192,
				offsetSeconds: 0,
				hasAccurateTiming: true,
				limitations: [],
				noteEvents: [
					{ tick: 1, lane: 1, seconds: 0.8 },
					{ tick: 2, lane: 2, seconds: 1.0 },
					{ tick: 3, lane: 3, seconds: 2.0 },
				],
			},
			undefined,
			1.0,
			10,
			0,
		);
		expect(notes.find((n) => n.lane === "yellow")?.yPercent).toBe(
			HIGHWAY_HIT_LINE_PERCENT,
		);
		expect(notes.find((n) => n.lane === "red")?.yPercent).toBeLessThan(
			HIGHWAY_HIT_LINE_PERCENT,
		);
		expect(notes.find((n) => n.lane === "blue")?.yPercent).toBeGreaterThan(
			HIGHWAY_HIT_LINE_PERCENT,
		);
	});

	it("omits notes outside lookbehind/lookahead via y-range visibility", () => {
		const notes = deriveHighwayNotes(
			{
				resolution: 192,
				offsetSeconds: 0,
				hasAccurateTiming: true,
				limitations: [],
				noteEvents: [
					{ tick: 1, lane: 1, seconds: 0.8 },
					{ tick: 2, lane: 2, seconds: 1.0 },
					{ tick: 3, lane: 3, seconds: 5.0 },
				],
			},
			undefined,
			1.0,
			10,
			0,
		);
		expect(notes.map((n) => n.lane)).toEqual(["red", "yellow"]);
	});

	it("scales fallback timing by audio duration", () => {
		const notes = deriveHighwayNotes(
			null,
			makeNormalizationPreview([
				{ tick: 0, piece: "kick", velocity: 100, source: midiSource() },
				{ tick: 100, piece: "kick", velocity: 100, source: midiSource() },
			]),
			8,
			10,
			0,
		);
		expect(notes.find((n) => n.atSeconds === 10)?.yPercent).toBeGreaterThan(
			HIGHWAY_HIT_LINE_PERCENT,
		);
	});

	it("returns honest limitation copy for normalization fallback", () => {
		expect(
			deriveHighwayLimitations(
				null,
				makeNormalizationPreview([
					{ tick: 0, piece: "kick", velocity: 100, source: midiSource() },
				]),
			)[0],
		).toBe(
			"Using normalization fallback data; timing is approximate and modifier data may be incomplete.",
		);
	});

	it("returns limited state when no highway data", () => {
		expect(deriveHighwayLimitations(null, undefined)[0]).toContain(
			"No generated chart",
		);
	});
});

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
