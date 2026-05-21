import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
	applyChartOffsetFile,
	applySongOffsetToChartText,
	offsetMsToSeconds,
} from "./chartOffset";

describe("chartOffset", () => {
	it("converts milliseconds to chart seconds", () => {
		expect(offsetMsToSeconds(900)).toBe(0.9);
		expect(offsetMsToSeconds(-120)).toBe(-0.12);
	});

	it("replaces existing [Song] Offset", () => {
		const text = `[Song]\n{\n  Name = "Demo"\n  Offset = 0\n  Resolution = 192\n}\n\n[ExpertDrums]\n{\n  192 = N 0 0\n}`;
		const out = applySongOffsetToChartText(text, 0.9);
		expect(out).toContain("Offset = 0.9");
		expect(out).toContain("192 = N 0 0");
	});

	it("inserts Offset when missing", () => {
		const text = `[Song]\n{\n  Name = "Demo"\n  Resolution = 192\n}\n`;
		const out = applySongOffsetToChartText(text, -0.12);
		expect(out).toContain("Offset = -0.12");
	});

	it("writes positive and negative offsets without changing notes/events", async () => {
		const tempDir = await mkdtemp(path.join(os.tmpdir(), "chdg-offset-"));
		const chartPath = path.join(tempDir, "notes.chart");
		const original = `[Song]\n{\n  Name = "Demo"\n  Offset = 0\n  Resolution = 192\n}\n\n[Events]\n{\n  0 = E "section Intro"\n}\n\n[ExpertDrums]\n{\n  192 = N 0 0\n  384 = N 1 0\n}`;
		await writeFile(chartPath, original, "utf8");

		await applyChartOffsetFile({ chartPath, offsetMs: 900 });
		let text = await readFile(chartPath, "utf8");
		expect(text).toContain("Offset = 0.9");
		expect(text).toContain("192 = N 0 0");
		expect(text).toContain('0 = E "section Intro"');

		await applyChartOffsetFile({ chartPath, offsetMs: -120 });
		text = await readFile(chartPath, "utf8");
		expect(text).toContain("Offset = -0.12");
		expect(text).toContain("384 = N 1 0");
	});

	it("rejects non-finite offset", () => {
		expect(() => offsetMsToSeconds(Number.NaN)).toThrowError("OFFSET_NOT_FINITE");
	});
});
