import { describe, expect, it } from "vitest";
import { buildWaveformBars, deriveTimelineNotes, formatTime } from "./desktop-preview-model";

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
});
