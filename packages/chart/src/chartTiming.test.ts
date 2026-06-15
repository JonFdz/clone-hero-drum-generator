import { describe, expect, it } from "vitest";
import {
	compareGeneratedChartTiming,
	formatChartTime,
	parseGeneratedChartTiming,
	summarizeTimingDiagnostics,
} from "./chartTiming.js";

function chart(parts: {
	song?: string;
	sync?: string;
	events?: string;
	drums?: string;
}): string {
	return `[Song]
{
  Resolution = 192
  Offset = 0
${parts.song ?? ""}
}

[SyncTrack]
{
${parts.sync ?? ""}
}

[Events]
{
${parts.events ?? ""}
}

[ExpertDrums]
{
${parts.drums ?? ""}
}
`;
}

describe("parseGeneratedChartTiming", () => {
	it("parses generated timing tables and computes seconds across tempo segments", () => {
		const result = parseGeneratedChartTiming(
			chart({
				song: "  Resolution = 480\n  Offset = 0.035",
				sync: "  0 = TS 4 2\n  0 = B 120000\n  960 = TS 6 3\n  960 = B 60000",
				events: '  1440 = E "section Break"',
				drums: "  480 = N 0 0\n  1440 = N 1 0\n  1440 = N 66 0",
			}),
		);

		expect(result.resolution).toBe(480);
		expect(result.offsetSeconds).toBe(0.035);
		expect(result.hasAccurateTiming).toBe(true);
		expect(result.tempos).toEqual([
			{ tick: 0, bpm: 120, seconds: 0, source: "generated-chart" },
			{ tick: 960, bpm: 60, seconds: 1, source: "generated-chart" },
		]);
		expect(result.timeSignatures).toEqual([
			{
				tick: 0,
				numerator: 4,
				denominator: 4,
				seconds: 0,
				source: "generated-chart",
			},
			{
				tick: 960,
				numerator: 6,
				denominator: 8,
				seconds: 1,
				source: "generated-chart",
			},
		]);
		expect(result.sections).toEqual([
			{
				tick: 1440,
				name: "Break",
				seconds: 2,
				source: "generated-chart",
			},
		]);
		expect(result.notes).toEqual({
			count: 2,
			firstTick: 480,
			lastTick: 1440,
			firstSeconds: 0.5,
			lastSeconds: 2,
		});
	});

	it("marks missing initial tempo as inaccurate and uses an explicit 120 BPM fallback", () => {
		const result = parseGeneratedChartTiming(
			chart({
				sync: "  192 = B 100000\n  0 = TS 4",
				drums: "  192 = N 0 0",
			}),
		);

		expect(result.hasAccurateTiming).toBe(false);
		expect(result.notes.firstSeconds).toBe(0.5);
		expect(result.diagnostics.map((item) => item.code)).toEqual(
			expect.arrayContaining([
				"TIMING_NO_INITIAL_TEMPO",
				"TIMING_FALLBACK_USED",
				"TIMING_UNSORTED_SYNCTRACK",
			]),
		);
	});

	it("diagnoses missing, duplicate, invalid, and absent initial timing events", () => {
		const result = parseGeneratedChartTiming(
			chart({
				sync:
					"  192 = TS 3\n  192 = TS 4 2\n  384 = B nope\n  480 = B 0\n  960 = B 120000\n  960 = B 121000",
				drums: "  192 = N 0 0",
			}),
		);

		expect(result.diagnostics.map((item) => item.code)).toEqual(
			expect.arrayContaining([
				"TIMING_NO_INITIAL_TEMPO",
				"TIMING_NO_INITIAL_TIME_SIGNATURE",
				"TIMING_DUPLICATE_TEMPO_TICK",
				"TIMING_DUPLICATE_TS_TICK",
				"TIMING_INVALID_BPM",
				"TIMING_FALLBACK_USED",
			]),
		);
	});

	it("diagnoses a duplicate tempo tick when invalid and valid BPM events share it", () => {
		const result = parseGeneratedChartTiming(
			chart({
				sync: "  0 = TS 4\n  0 = B nope\n  0 = B 120000",
			}),
		);

		expect(result.diagnostics).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					code: "TIMING_INVALID_BPM",
					details: { tick: 0 },
				}),
				expect.objectContaining({
					code: "TIMING_DUPLICATE_TEMPO_TICK",
					details: { tick: 0 },
				}),
			]),
		);
	});

	it("reports one duplicate diagnostic and each invalid BPM at an invalid-only tick", () => {
		const result = parseGeneratedChartTiming(
			chart({
				sync: "  0 = TS 4\n  192 = B nope\n  192 = B 0",
			}),
		);

		expect(
			result.diagnostics.filter(
				(item) => item.code === "TIMING_DUPLICATE_TEMPO_TICK",
			),
		).toEqual([
			expect.objectContaining({
				details: { tick: 192 },
			}),
		]);
		expect(
			result.diagnostics.filter((item) => item.code === "TIMING_INVALID_BPM"),
		).toHaveLength(2);
	});

	it("diagnoses charts with no tempo or time-signature events", () => {
		const result = parseGeneratedChartTiming(
			chart({ drums: "  384 = N 0 0" }),
		);

		expect(result.hasAccurateTiming).toBe(false);
		expect(result.notes.lastSeconds).toBe(1);
		expect(result.diagnostics).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					code: "TIMING_NO_TEMPO_EVENTS",
					severity: "warning",
				}),
				expect.objectContaining({
					code: "TIMING_NO_TIME_SIGNATURES",
					severity: "warning",
				}),
				expect.objectContaining({
					code: "TIMING_FALLBACK_USED",
					severity: "info",
				}),
			]),
		);
	});

	it("uses consecutive BPM deltas for conservative jump severity", () => {
		const result = parseGeneratedChartTiming(
			chart({
				sync:
					"  0 = TS 4\n  0 = B 120000\n  192 = B 151000\n  384 = B 202000",
			}),
		);

		expect(result.diagnostics).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					code: "TIMING_SUSPICIOUS_BPM_JUMP_INFO",
					severity: "info",
				}),
				expect.objectContaining({
					code: "TIMING_SUSPICIOUS_BPM_JUMP_WARNING",
					severity: "warning",
				}),
			]),
		);
	});

	it("treats one BPM on a generated long song and non-zero offset as info only", () => {
		const result = parseGeneratedChartTiming(
			chart({
				song: "  Offset = -0.25",
				sync: "  0 = TS 4\n  0 = B 120000",
				drums: `  ${192 * 60 * 7} = N 0 0`,
			}),
		);

		expect(result.notes.lastSeconds).toBe(210);
		expect(result.diagnostics).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					code: "TIMING_ONLY_ONE_TEMPO_LONG_SONG",
					severity: "info",
				}),
				expect.objectContaining({
					code: "TIMING_OFFSET_PRESENT",
					severity: "info",
				}),
			]),
		);
		expect(result.diagnostics.filter((item) => item.severity === "warning")).toEqual([]);
	});
});

describe("compareGeneratedChartTiming", () => {
	it("reports cached source tempo, TS, and section mismatches", () => {
		const generated = parseGeneratedChartTiming(
			chart({
				sync: "  0 = TS 4\n  0 = B 120000\n  384 = B 150000",
				events: '  0 = E "section Intro"',
			}),
		);

		const diagnostics = compareGeneratedChartTiming(generated, {
			resolution: 192,
			tempos: [
				{ tick: 0, bpm: 120.001 },
				{ tick: 192, bpm: 130 },
			],
			timeSignatures: [
				{ tick: 0, numerator: 4, denominator: 4 },
				{ tick: 768, numerator: 3, denominator: 4 },
			],
			sections: [
				{ tick: 0, name: " intro " },
				{ tick: 960, name: "Chorus" },
			],
		});

		expect(diagnostics.map((item) => item.code)).toEqual(
			expect.arrayContaining([
				"SOURCE_TEMPO_MISSING_IN_GENERATED",
				"GENERATED_EXTRA_TEMPO",
				"SOURCE_GENERATED_TS_COUNT_MISMATCH",
				"SOURCE_SECTION_MISSING_IN_GENERATED",
			]),
		);
	});

	it("honors ±0.001 BPM tolerance and reports unavailable cache explicitly", () => {
		const generated = parseGeneratedChartTiming(
			chart({ sync: "  0 = TS 4\n  0 = B 120000" }),
		);

		expect(
			compareGeneratedChartTiming(generated, {
				resolution: 192,
				tempos: [{ tick: 0, bpm: 120.001 }],
				timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
				sections: [],
			}).filter((item) => item.code.includes("TEMPO")),
		).toEqual([]);
		expect(compareGeneratedChartTiming(generated, undefined)).toEqual([
			expect.objectContaining({
				code: "SOURCE_COMPARISON_UNAVAILABLE",
				severity: "info",
			}),
		]);
	});

	it("does not perform exact-tick comparison across different resolutions", () => {
		const generated = parseGeneratedChartTiming(
			chart({ sync: "  0 = TS 4\n  0 = B 120000" }),
		);
		const diagnostics = compareGeneratedChartTiming(generated, {
			resolution: 960,
			tempos: [{ tick: 480, bpm: 120 }],
			timeSignatures: [{ tick: 480, numerator: 4, denominator: 4 }],
			sections: [{ tick: 480, name: "Intro" }],
		});

		expect(diagnostics).toEqual([
			expect.objectContaining({ code: "SOURCE_GENERATED_RESOLUTION_MISMATCH" }),
		]);
	});

	it("does not report a TS mismatch when equal-count signatures match exactly", () => {
		const generated = parseGeneratedChartTiming(
			chart({ sync: "  0 = TS 4\n  0 = B 120000\n  768 = TS 6 3" }),
		);

		const diagnostics = compareGeneratedChartTiming(generated, {
			resolution: 192,
			tempos: [{ tick: 0, bpm: 120 }],
			timeSignatures: [
				{ tick: 0, numerator: 4, denominator: 4 },
				{ tick: 768, numerator: 6, denominator: 8 },
			],
			sections: [],
		});

		expect(
			diagnostics.filter(
				(item) => item.code === "SOURCE_GENERATED_TS_COUNT_MISMATCH",
			),
		).toEqual([]);
	});

	it("reports the accepted TS mismatch diagnostic for equal-count semantic differences", () => {
		const generated = parseGeneratedChartTiming(
			chart({ sync: "  0 = TS 4\n  0 = B 120000\n  768 = TS 6 3" }),
		);

		const diagnostics = compareGeneratedChartTiming(generated, {
			resolution: 192,
			tempos: [{ tick: 0, bpm: 120 }],
			timeSignatures: [
				{ tick: 0, numerator: 4, denominator: 4 },
				{ tick: 768, numerator: 7, denominator: 8 },
			],
			sections: [],
		});

		expect(diagnostics).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					code: "SOURCE_GENERATED_TS_COUNT_MISMATCH",
					severity: "warning",
				}),
			]),
		);
	});
});

describe("timing formatting", () => {
	it("formats chart time and concise severity counts", () => {
		expect(formatChartTime(65.4321)).toBe("01:05.432");
		expect(
			summarizeTimingDiagnostics([
				{ code: "W", severity: "warning", message: "warning" },
				{ code: "I", severity: "info", message: "info" },
			]),
		).toEqual({
			status: "warning",
			label: "Timing: 1 warning, 1 info",
			errorCount: 0,
			warningCount: 1,
			infoCount: 1,
			importantMessages: ["warning"],
		});
	});

	it("reports timing OK when diagnostics are empty", () => {
		expect(summarizeTimingDiagnostics([]).label).toBe("Timing: OK");
		expect(formatChartTime(Number.NaN)).toBe("Unavailable");
	});
});
