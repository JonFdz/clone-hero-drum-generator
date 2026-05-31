import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
	parseChartPreviewData,
	pickAudioPreviewCandidate,
	resolveChartPreviewPath,
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
		expect(data.noteEvents[0]?.seconds).toBeCloseTo(0.5, 6);
		expect(data.noteEvents[1]?.seconds).toBeCloseTo(1, 6);
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
