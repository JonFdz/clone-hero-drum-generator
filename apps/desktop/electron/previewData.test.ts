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
			selectedAudioPath: "/tmp/source/demo.wav",
		});
		expect(result.generatedPath).toBe("/tmp/output/song.ogg");
		expect(result.selectedAudioPath).toBe("/tmp/source/demo.wav");
	});

	it("derives generated song.ogg from output dir", () => {
		const result = pickAudioPreviewCandidate({ outputDir: "/tmp/output" });
		expect(result.generatedPath).toBe("/tmp/output/song.ogg");
	});

	it("keeps selected audio as fallback candidate", () => {
		const result = pickAudioPreviewCandidate({ selectedAudioPath: "/tmp/source/demo.wav" });
		expect(result.generatedPath).toBeUndefined();
		expect(result.selectedAudioPath).toBe("/tmp/source/demo.wav");
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
