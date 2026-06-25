import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
	parseChartPreviewData,
	pickAudioPreviewCandidate,
	resolveChartPreviewPath,
	sourceTimingFromAnalysisCache,
} from "./previewData";

describe("pickAudioPreviewCandidate", () => {
	it("prefers generated song.ogg path when explicit", () => {
		const result = pickAudioPreviewCandidate({
			generatedSongOggPath: "/tmp/output/song.ogg",
			outputDir: "/tmp/output",
		});
		expect(result.generatedPath).toBe("/tmp/output/song.ogg");
	});

	it("derives generated song.ogg from output dir", () => {
		const result = pickAudioPreviewCandidate({ outputDir: "/tmp/output" });
		expect(result.generatedPath).toBe("/tmp/output/song.ogg");
	});

	it("does not accept selected source audio as a generated Preview fallback", () => {
		const result = pickAudioPreviewCandidate({});
		expect(result.generatedPath).toBeUndefined();
	});
});

describe("parseChartPreviewData", () => {
	it("maps B tempo values as bpm*1000 for note timing", async () => {
		const tempDir = await mkdtemp(path.join(os.tmpdir(), "chdg-preview-"));
		const chartPath = path.join(tempDir, "notes.chart");
		await writeFile(
			chartPath,
			`[Song]\n{\n  Name = "Demo"\n  Offset = 0\n  Resolution = 192\n}\n\n[SyncTrack]\n{\n  0 = B 120000\n}\n\n[ExpertDrums]\n{\n  192 = N 0 0\n  384 = N 1 0\n}\n`,
			"utf8",
		);

		const data = await parseChartPreviewData(chartPath);
		expect(data.noteEvents[0]).toEqual(
			expect.objectContaining({
				tick: 192,
				lane: 0,
				length: 0,
				seconds: 0.5,
				endSeconds: 0.5,
			}),
		);
		expect(data.noteEvents[1]).toEqual(
			expect.objectContaining({
				tick: 384,
				lane: 1,
				length: 0,
				seconds: 1,
				endSeconds: 1,
			}),
		);
		expect(data.timing.tempos).toEqual([
			{ tick: 0, bpm: 120, seconds: 0, source: "generated-chart" },
		]);
		expect(data.timing.diagnostics).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ code: "SOURCE_COMPARISON_UNAVAILABLE" }),
			]),
		);
	});
	it("parses generated chart section events with tempo-aware timing", async () => {
		const tempDir = await mkdtemp(path.join(os.tmpdir(), "chdg-preview-"));
		const chartPath = path.join(tempDir, "notes.chart");
		await writeFile(
			chartPath,
			`[Song]
{
  Resolution = 192
}

[SyncTrack]
{
  0 = B 120000
  384 = B 60000
}

[Events]
{
  192 = E "section Verse 1"
  384 = E "phrase ignored"
  576 = E "section Break"
}

[ExpertDrums]
{
  192 = N 0 0
}
`,
			"utf8",
		);

		const data = await parseChartPreviewData(chartPath);
		expect(data.sectionEvents).toEqual([
			expect.objectContaining({
				tick: 192,
				name: "Verse 1",
				seconds: 0.5,
				source: "generated-chart",
			}),
			expect.objectContaining({
				tick: 576,
				name: "Break",
				source: "generated-chart",
			}),
		]);
		expect(data.sectionEvents[1]?.seconds).toBeCloseTo(2, 6);
		expect(data.timing.sections[1]).toEqual(
			expect.objectContaining({ tick: 576, name: "Break", seconds: 2 }),
		);
	});

	it("uses 120 BPM only before the first valid tempo and honors later changes", async () => {
		const tempDir = await mkdtemp(path.join(os.tmpdir(), "chdg-preview-"));
		const chartPath = path.join(tempDir, "notes.chart");
		await writeFile(
			chartPath,
			`[Song]
{
  Resolution = 192
}
[SyncTrack]
{
  0 = TS 4
  384 = B 60000
}
[ExpertDrums]
{
  192 = N 0 0
  384 = N 1 0
  576 = N 2 0
}
`,
			"utf8",
		);

		const data = await parseChartPreviewData(chartPath);

		expect(data.hasAccurateTiming).toBe(false);
		expect(data.noteEvents.map((note) => note.seconds)).toEqual([0.5, 1, 2]);
		expect(data.timing.tempos).toEqual([
			{ tick: 384, bpm: 60, seconds: 1, source: "generated-chart" },
		]);
		expect(data.limitations).toEqual([
			"Timing is low confidence: note timing uses 120 BPM until the first usable tempo, then honors later valid tempo changes.",
		]);
	});

	it("compares generated timing with accepted cached source analysis only", async () => {
		const tempDir = await mkdtemp(path.join(os.tmpdir(), "chdg-preview-"));
		const chartPath = path.join(tempDir, "notes.chart");
		await writeFile(
			chartPath,
			`[Song]
{
  Resolution = 192
}
[SyncTrack]
{
  0 = TS 4
  0 = B 120000
}
[Events]
{
}
[ExpertDrums]
{
  192 = N 0 0
}
`,
			"utf8",
		);

		const data = await parseChartPreviewData(chartPath, {
			resolution: 192,
			tempos: [
				{ tick: 0, bpm: 120 },
				{ tick: 384, bpm: 150 },
			],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [{ tick: 768, name: "Chorus" }],
		});

		expect(data.timing.diagnostics).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					code: "SOURCE_GENERATED_TEMPO_COUNT_MISMATCH",
				}),
				expect.objectContaining({
					code: "SOURCE_TEMPO_MISSING_IN_GENERATED",
				}),
				expect.objectContaining({
					code: "SOURCE_SECTION_MISSING_IN_GENERATED",
				}),
			]),
		);
		expect(data.timing.summary.label).toBe("Timing: 2 warnings, 1 info");
	});

	it("retains zero-length taps and positive sustains with endSeconds", async () => {
		const tempDir = await mkdtemp(path.join(os.tmpdir(), "chdg-preview-"));
		const chartPath = path.join(tempDir, "notes.chart");
		await writeFile(
			chartPath,
			`[Song]
{
  Resolution = 192
}
[SyncTrack]
{
  0 = B 120000
}
[ExpertDrums]
{
  192 = N 0 0
  384 = N 1 96
}
`,
			"utf8",
		);

		const data = await parseChartPreviewData(chartPath);
		expect(data.noteEvents[0]).toEqual(
			expect.objectContaining({ length: 0, seconds: 0.5, endSeconds: 0.5 }),
		);
		expect(data.noteEvents[1]).toEqual(
			expect.objectContaining({ length: 96, seconds: 1, endSeconds: 1.25 }),
		);
	});

	it("computes sustain endSeconds across tempo changes", async () => {
		const tempDir = await mkdtemp(path.join(os.tmpdir(), "chdg-preview-"));
		const chartPath = path.join(tempDir, "notes.chart");
		await writeFile(
			chartPath,
			`[Song]
{
  Resolution = 192
}
[SyncTrack]
{
  0 = B 120000
  384 = B 60000
}
[ExpertDrums]
{
  288 = N 2 288
}
`,
			"utf8",
		);

		const data = await parseChartPreviewData(chartPath);
		expect(data.noteEvents[0]?.seconds).toBeCloseTo(0.75, 6);
		expect(data.noteEvents[0]?.endSeconds).toBeCloseTo(2, 6);
		expect(data.noteEvents[0]?.endSeconds).toBeGreaterThanOrEqual(
			data.noteEvents[0]?.seconds ?? 0,
		);
	});

	it("retains valid raw modifier events, drops malformed negatives, and sorts deterministically", async () => {
		const tempDir = await mkdtemp(path.join(os.tmpdir(), "chdg-preview-"));
		const chartPath = path.join(tempDir, "notes.chart");
		await writeFile(
			chartPath,
			`[Song]
{
  Resolution = 192
}
[SyncTrack]
{
  0 = B 120000
}
[ExpertDrums]
{
  384 = N 35 0
  384 = N 66 0
  192 = N 2 0
  -5 = N 1 0
  120 = N -1 0
  130 = N 1 -2
  nope
}
`,
			"utf8",
			);

		const data = await parseChartPreviewData(chartPath);
		expect(data.noteEvents.map((note) => [note.tick, note.lane, note.length])).toEqual([
			[192, 2, 0],
			[384, 35, 0],
			[384, 66, 0],
		]);
	});

	it("keeps chart timing independent from preview offset handling", async () => {
		const tempDir = await mkdtemp(path.join(os.tmpdir(), "chdg-preview-"));
		const chartPath = path.join(tempDir, "notes.chart");
		await writeFile(
			chartPath,
			`[Song]
{
  Offset = 1.5
  Resolution = 192
}
[SyncTrack]
{
  0 = B 120000
}
[ExpertDrums]
{
  192 = N 0 0
}
`,
			"utf8",
		);

		const data = await parseChartPreviewData(chartPath);
		expect(data.offsetSeconds).toBe(1.5);
		expect(data.noteEvents[0]?.seconds).toBe(0.5);
		expect(data.noteEvents[0]?.endSeconds).toBe(0.5);
	});

	it("returns no section events when generated chart has no section markers", async () => {
		const tempDir = await mkdtemp(path.join(os.tmpdir(), "chdg-preview-"));
		const chartPath = path.join(tempDir, "notes.chart");
		await writeFile(
			chartPath,
			`[Song]
{
  Resolution = 192
}

[Events]
{
  0 = E "phrase intro"
}

[ExpertDrums]
{
}
`,
			"utf8",
		);

		const data = await parseChartPreviewData(chartPath);
		expect(data.sectionEvents).toEqual([]);
	});

});

describe("sourceTimingFromAnalysisCache", () => {
	it("extracts only cached resolution, tempo, time-signature, and section data", () => {
		const source = sourceTimingFromAnalysisCache({
			schemaVersion: 2,
			sourceFingerprint: { path: "/tmp/demo.mid" },
			mappingFingerprint: "mapping",
			selectedTracks: [53],
			inspectedAt: "2026-06-14T00:00:00.000Z",
			inspection: {
				sourceKind: "midi",
				sourcePath: "/tmp/demo.mid",
				resolution: 480,
				tempos: [{ tick: 0, bpm: 147 }],
				timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
				sections: [{ tick: 960, name: "Verse" }],
				tracks: [],
				issues: [],
			},
		});

		expect(source).toEqual({
			resolution: 480,
			tempos: [{ tick: 0, bpm: 147 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [{ tick: 960, name: "Verse" }],
		});
	});

	it("prefers normalized source timing over raw inspection timing", () => {
		const source = sourceTimingFromAnalysisCache({
			schemaVersion: 2,
			sourceFingerprint: { path: "/tmp/demo.gp" },
			mappingFingerprint: "mapping",
			selectedTracks: [3],
			inspectedAt: "2026-06-14T00:00:00.000Z",
			normalizedAt: "2026-06-14T00:01:00.000Z",
			normalizedTiming: {
				resolution: 960,
				tempos: [
					{ tick: 0, bpm: 164 },
					{ tick: 184_320, bpm: 160 },
				],
				timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
				sections: [{ tick: 30_720, name: "Verse" }],
			},
			inspection: {
				sourceKind: "gpif",
				sourcePath: "/tmp/demo.gp",
				tempos: [{ path: "GPIF.Score.Tempo", value: "147" }],
				timeSignatures: [],
				sections: [],
				tracks: [],
				issues: [],
			},
		});

		expect(source).toEqual({
			resolution: 960,
			tempos: [
				{ tick: 0, bpm: 164 },
				{ tick: 184_320, bpm: 160 },
			],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [{ tick: 30_720, name: "Verse" }],
		});
	});

	it("falls back to reliable inspection timing when normalized timing is malformed", () => {
		const cache = {
			schemaVersion: 2,
			sourceFingerprint: { path: "/tmp/demo.mid" },
			mappingFingerprint: "mapping",
			selectedTracks: [53],
			inspectedAt: "2026-06-14T00:00:00.000Z",
			normalizedTiming: {
				resolution: 480,
				tempos: "invalid",
				timeSignatures: [],
				sections: [],
			},
			inspection: {
				sourceKind: "midi",
				sourcePath: "/tmp/demo.mid",
				resolution: 480,
				tempos: [{ tick: 0, bpm: 147 }],
				timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
				sections: [{ tick: 960, name: "Verse" }],
				tracks: [],
				issues: [],
			},
		};

		expect(
			sourceTimingFromAnalysisCache(
				cache as unknown as Parameters<typeof sourceTimingFromAnalysisCache>[0],
			),
		).toEqual({
			resolution: 480,
			tempos: [{ tick: 0, bpm: 147 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [{ tick: 960, name: "Verse" }],
		});
	});

	it("detects missing generated GPIF tempos from normalized cached timing", async () => {
		const tempDir = await mkdtemp(path.join(os.tmpdir(), "chdg-preview-"));
		const chartPath = path.join(tempDir, "notes.chart");
		await writeFile(
			chartPath,
			`[Song]
{
  Resolution = 960
}
[SyncTrack]
{
  0 = TS 4
  0 = B 164000
}
[Events]
{
}
[ExpertDrums]
{
  0 = N 0 0
}
`,
			"utf8",
		);
		const sourceTiming = sourceTimingFromAnalysisCache({
			schemaVersion: 2,
			sourceFingerprint: { path: "/tmp/demo.gp" },
			mappingFingerprint: "mapping",
			selectedTracks: [3],
			inspectedAt: "2026-06-14T00:00:00.000Z",
			normalizedTiming: {
				resolution: 960,
				tempos: [
					{ tick: 0, bpm: 164 },
					{ tick: 184_320, bpm: 160 },
				],
				timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
				sections: [],
			},
			inspection: {
				sourceKind: "gpif",
				sourcePath: "/tmp/demo.gp",
				tempos: [],
				timeSignatures: [],
				sections: [],
				tracks: [],
				issues: [],
			},
		});

		const data = await parseChartPreviewData(chartPath, sourceTiming);
		expect(data.timing.diagnostics.map((item) => item.code)).toEqual(
			expect.arrayContaining([
				"SOURCE_GENERATED_TEMPO_COUNT_MISMATCH",
				"SOURCE_TEMPO_MISSING_IN_GENERATED",
			]),
		);
	});

	it("returns undefined without a cache instead of recalculating source analysis", () => {
		expect(sourceTimingFromAnalysisCache(undefined)).toBeUndefined();
	});

	it("treats malformed persisted nested timing collections as unavailable", () => {
		const cache = {
			schemaVersion: 2,
			sourceFingerprint: { path: "/tmp/demo.mid" },
			mappingFingerprint: "mapping",
			selectedTracks: [53],
			inspectedAt: "2026-06-14T00:00:00.000Z",
			inspection: {
				sourceKind: "midi",
				sourcePath: "/tmp/demo.mid",
				resolution: 480,
				tempos: { tick: 0, bpm: 147 },
				timeSignatures: [],
				sections: [],
				tracks: [],
				issues: [],
			},
		};

		expect(() =>
			sourceTimingFromAnalysisCache(
				cache as unknown as Parameters<typeof sourceTimingFromAnalysisCache>[0],
			),
		).not.toThrow();
		expect(
			sourceTimingFromAnalysisCache(
				cache as unknown as Parameters<typeof sourceTimingFromAnalysisCache>[0],
			),
		).toBeUndefined();
	});

	it("rejects malformed time-signature or section collections without affecting valid caches", () => {
		const baseCache = {
			schemaVersion: 2,
			sourceFingerprint: { path: "/tmp/demo.mid" },
			mappingFingerprint: "mapping",
			selectedTracks: [53],
			inspectedAt: "2026-06-14T00:00:00.000Z",
			inspection: {
				sourceKind: "midi",
				sourcePath: "/tmp/demo.mid",
				resolution: 480,
				tempos: [{ tick: 0, bpm: 147 }],
				timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
				sections: [{ tick: 960, name: "Verse" }],
				tracks: [],
				issues: [],
			},
		};
		const malformedTimeSignatures = {
			...baseCache,
			inspection: {
				...baseCache.inspection,
				timeSignatures: "4/4",
			},
		};
		const malformedSections = {
			...baseCache,
			inspection: {
				...baseCache.inspection,
				sections: null,
			},
		};

		expect(
			sourceTimingFromAnalysisCache(
				malformedTimeSignatures as unknown as Parameters<
					typeof sourceTimingFromAnalysisCache
				>[0],
			),
		).toBeUndefined();
		expect(
			sourceTimingFromAnalysisCache(
				malformedSections as unknown as Parameters<
					typeof sourceTimingFromAnalysisCache
				>[0],
			),
		).toBeUndefined();
		expect(
			sourceTimingFromAnalysisCache(
				baseCache as Parameters<typeof sourceTimingFromAnalysisCache>[0],
			),
		).toEqual({
			resolution: 480,
			tempos: [{ tick: 0, bpm: 147 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [{ tick: 960, name: "Verse" }],
		});
	});

	it("treats raw GPIF inspection timing summaries as comparison unavailable", () => {
		const source = sourceTimingFromAnalysisCache({
			schemaVersion: 2,
			sourceFingerprint: { path: "/tmp/demo.gp" },
			mappingFingerprint: "mapping",
			selectedTracks: [0],
			inspectedAt: "2026-06-14T00:00:00.000Z",
			inspection: {
				sourceKind: "gpif",
				sourcePath: "/tmp/demo.gp",
				tempos: [{ path: "GPIF.Score.Tempo", value: "147" }],
				timeSignatures: [
					{
						path: "GPIF.MasterBars.MasterBar[0].TimeSignature",
						value: "4/4",
					},
				],
				sections: [
					{
						name: "Verse",
						kind: "marker",
						path: "GPIF.MasterBars.MasterBar[0].Marker",
					},
				],
				tracks: [],
				issues: [],
			},
		});

		expect(source).toBeUndefined();
	});
});

describe("resolveChartPreviewPath", () => {
	it("accepts notes.chart in output dir", () => {
		const out = resolveChartPreviewPath({ outputDir: "/tmp/out" });
		expect(out.chartPath).toBe(path.resolve("/tmp/out/notes.chart"));
	});

	it("rejects non-notes chart path", () => {
		expect(() =>
			resolveChartPreviewPath({ outputDir: "/tmp/out", chartPath: "/tmp/out/other.txt" }),
		).toThrowError("PREVIEW_CHART_NOT_ALLOWED");
	});

	it("rejects notes.chart outside provided output dir", () => {
		expect(() =>
			resolveChartPreviewPath({ outputDir: "/tmp/out", chartPath: "/tmp/other/notes.chart" }),
		).toThrowError("PREVIEW_CHART_NOT_ALLOWED");
	});
});
