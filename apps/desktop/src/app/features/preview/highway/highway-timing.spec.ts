import { describe, expect, it } from "vitest";
import {
	buildHighwayTimingMap,
	chartSecondsAtTick,
	enumerateMusicalLines,
	musicalPositionAtTick,
	tickAtChartSeconds,
} from "./highway-timing";

describe("highway-timing", () => {
	it("converts ticks to seconds at constant tempo", () => {
		const map = buildHighwayTimingMap({
			resolution: 192,
			tempos: [{ tick: 0, bpm: 120, seconds: 0 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4, seconds: 0 }],
		});
		expect(map).not.toBeNull();
		expect(chartSecondsAtTick(map!, 192)).toBe(0.5);
		expect(chartSecondsAtTick(map!, 384)).toBe(1);
	});

	it("converts ticks across tempo changes continuously", () => {
		const map = buildHighwayTimingMap({
			resolution: 192,
			tempos: [
				{ tick: 0, bpm: 120, seconds: 0 },
				{ tick: 384, bpm: 60, seconds: 1 },
			],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4, seconds: 0 }],
		});
		expect(map).not.toBeNull();
		expect(chartSecondsAtTick(map!, 384)).toBe(1);
		expect(chartSecondsAtTick(map!, 576)).toBe(2);
	});

	it("round-trips tick and seconds around tempo boundaries", () => {
		const map = buildHighwayTimingMap({
			resolution: 192,
			tempos: [
				{ tick: 0, bpm: 120, seconds: 0 },
				{ tick: 384, bpm: 90, seconds: 1 },
			],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4, seconds: 0 }],
		});
		const ticks = [0, 191, 192, 384, 500, 768];
		for (const tick of ticks) {
			const roundTrip = tickAtChartSeconds(map!, chartSecondsAtTick(map!, tick));
			expect(Math.abs(roundTrip - tick)).toBeLessThanOrEqual(1e-6);
		}
	});

	it("returns null when no initial usable tempo exists", () => {
		const map = buildHighwayTimingMap({
			resolution: 192,
			tempos: [{ tick: 192, bpm: 120, seconds: 0.5 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4, seconds: 0 }],
		});
		expect(map).toBeNull();
	});

	it("derives beat and measure positions including legal signature changes", () => {
		const map = buildHighwayTimingMap({
			resolution: 192,
			tempos: [{ tick: 0, bpm: 120, seconds: 0 }],
			timeSignatures: [
				{ tick: 0, numerator: 4, denominator: 4, seconds: 0 },
				{ tick: 768, numerator: 3, denominator: 4, seconds: 2 },
			],
		});
		expect(musicalPositionAtTick(map!, 0)).toMatchObject({
			measure: 1,
			beat: 1,
		});
		expect(musicalPositionAtTick(map!, 192)).toMatchObject({
			measure: 1,
			beat: 2,
		});
		expect(musicalPositionAtTick(map!, 768)).toMatchObject({
			measure: 2,
			beat: 1,
			numerator: 3,
		});
	});

	it("omits measure output when time signature data is incomplete", () => {
		const map = buildHighwayTimingMap({
			resolution: 192,
			tempos: [{ tick: 0, bpm: 120, seconds: 0 }],
			timeSignatures: [],
		});
		expect(map).not.toBeNull();
		expect(map?.hasMeterData).toBe(false);
		expect(musicalPositionAtTick(map!, 192)).toBeNull();
	});

	it("enumerates unique musical lines and enforces a deterministic cap", () => {
		const map = buildHighwayTimingMap({
			resolution: 192,
			tempos: [{ tick: 0, bpm: 120, seconds: 0 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4, seconds: 0 }],
		});
		const lines = enumerateMusicalLines(map!, {
			startSeconds: 0,
			endSeconds: 120,
			maxLines: 8,
		});
		expect(lines.length).toBeLessThanOrEqual(8);
		expect(lines.some((line) => line.kind === "measure")).toBe(true);
		expect(new Set(lines.map((line) => line.tick)).size).toBe(lines.length);
	});
});
