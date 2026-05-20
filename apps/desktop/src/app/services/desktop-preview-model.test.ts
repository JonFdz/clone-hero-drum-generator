import { describe, expect, it } from "vitest";
import {
	buildWaveformBars,
	deriveHighwayLimitations,
	deriveHighwayNotes,
	deriveTimelineNotes,
	formatTime,
} from "./desktop-preview-model";

describe("desktop-preview-model", () => {
	it("formats time", () => {
		expect(formatTime(12.345)).toBe("00:12.345");
	});

	it("builds waveform-like bars", () => {
		expect(buildWaveformBars(10, 12)).toHaveLength(12);
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
		);
		expect(notes).toHaveLength(0);
	});

	it("calculates visible window and note position relative to current time", () => {
		const notes = deriveHighwayNotes(
			{
				resolution: 192,
				offsetSeconds: 0,
				hasAccurateTiming: true,
				limitations: [],
				noteEvents: [
					{ tick: 1, lane: 1, seconds: 0.8 },
					{ tick: 2, lane: 1, seconds: 4.5 },
				],
			},
			undefined,
			1,
		);
		expect(notes).toHaveLength(1);
		expect(notes[0]?.yPercent).toBeGreaterThan(0);
		expect(notes[0]?.yPercent).toBeLessThan(100);
	});

	it("returns limited state when no highway data", () => {
		expect(deriveHighwayLimitations(null, undefined)[0]).toContain(
			"No generated chart",
		);
	});
});
