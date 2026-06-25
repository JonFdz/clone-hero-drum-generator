import { describe, expect, it } from "vitest";
import {
	HIGHWAY_HIT_LINE_PERCENT,
	buildWaveformBars,
	deriveAdjacentSections,
	deriveCurrentSection,
	deriveHighwayLimitations,
	deriveHighwayNotes,
	deriveSectionNavigationItems,
	deriveTimelineNotes,
	effectiveNoteTime,
	formatTime,
	offsetMsToSeconds,
} from "./desktop-preview-model";

function previewNoteEvent(tick: number, lane: number, seconds: number, length = 0) {
	return { tick, lane, length, seconds, endSeconds: seconds + length / 192 / 2 };
}

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
				sectionEvents: [],
				noteEvents: [
					previewNoteEvent(0, 0, 1),
					previewNoteEvent(100, 1, 2),
				],
			},
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
				sectionEvents: [],
				noteEvents: [
					previewNoteEvent(192, 2, 1),
					previewNoteEvent(192, 66, 1),
					previewNoteEvent(192, 35, 1),
					previewNoteEvent(192, 41, 1),
				],
			},
			0,
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
				sectionEvents: [],
				noteEvents: [previewNoteEvent(192, 66, 1)],
			},
			0,
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
				sectionEvents: [],
				noteEvents: [
					previewNoteEvent(1, 1, 0.8),
					previewNoteEvent(2, 2, 1.0),
					previewNoteEvent(3, 3, 2.0),
				],
			},
			1.0,
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
				sectionEvents: [],
				noteEvents: [
					previewNoteEvent(1, 1, 0.8),
					previewNoteEvent(2, 2, 1.0),
					previewNoteEvent(3, 3, 5.0),
				],
			},
			1.0,
			0,
		);
		expect(notes.map((n) => n.lane)).toEqual(["red", "yellow"]);
	});

	it("does not derive generated highway notes from normalization fallback", () => {
		const notes = deriveHighwayNotes(null, 8, 0);
		expect(notes).toEqual([]);
	});


	it("sorts section navigation before assigning UI-only duplicate suffixes", () => {
		const items = deriveSectionNavigationItems(
			{
				resolution: 192,
				offsetSeconds: 0,
				hasAccurateTiming: true,
				limitations: [],
				noteEvents: [],
				sectionEvents: [
					{ tick: 192, name: "Chorus", seconds: 72.6, source: "generated-chart" },
					{ tick: 0, name: "Chorus", seconds: 30, source: "generated-chart" },
					{ tick: 384, name: "Bridge", seconds: 90, source: "generated-chart" },
				],
			},
			250,
		);

		expect(items.map((item) => item.displayName)).toEqual([
			"Chorus",
			"Chorus 2",
			"Bridge",
		]);
		expect(items.map((item) => item.tick)).toEqual([0, 192, 384]);
		expect(items[0]?.name).toBe("Chorus");
		expect(items[0]?.effectiveSeconds).toBe(30.25);
		expect(items[1]?.label).toBe("Chorus 2 · 01:12");
	});

	it("derives current and adjacent sections using preview offset", () => {
		const chartData = {
			resolution: 192,
			offsetSeconds: 0,
			hasAccurateTiming: true,
			limitations: [],
			noteEvents: [],
			sectionEvents: [
				{ tick: 0, name: "Intro", seconds: 0, source: "generated-chart" as const },
				{ tick: 192, name: "Verse", seconds: 30, source: "generated-chart" as const },
				{ tick: 384, name: "Break", seconds: 60, source: "generated-chart" as const },
			],
		};

		expect(deriveCurrentSection(chartData, 30.1, 250)?.name).toBe("Intro");
		expect(deriveCurrentSection(chartData, 30.25, 250)?.name).toBe("Verse");

		const items = deriveSectionNavigationItems(chartData, 250);
		expect(deriveAdjacentSections(items, 30.25).previous?.name).toBe("Intro");
		expect(deriveAdjacentSections(items, 30.25).next?.name).toBe("Break");
		expect(
			deriveCurrentSection(
				{ ...chartData, sectionEvents: [chartData.sectionEvents[1]] },
				30.1,
				250,
			),
		).toBeUndefined();
	});

	it("returns limited state when no highway data", () => {
		expect(deriveHighwayLimitations(null)[0]).toContain(
			"No generated notes.chart",
		);
	});
});
