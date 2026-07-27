import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("chart offset IPC retirement", () => {
	it("returns an explicit unavailable envelope without writing notes.chart", () => {
		const source = readFileSync(
			new URL("./main.ts", import.meta.url),
			"utf8",
		);
		expect(source).toContain('"CHART_OFFSET_WRITE_NOT_AVAILABLE"');
		expect(source).not.toContain("applyChartOffsetFile");
		expect(source).not.toContain("Only notes.chart can be updated");
	});
});
