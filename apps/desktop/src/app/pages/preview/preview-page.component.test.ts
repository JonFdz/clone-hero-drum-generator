import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
	join(
		process.cwd(),
		"apps/desktop/src/app/pages/preview/preview-page.component.ts",
	),
	"utf8",
);

describe("Preview timing diagnostics UI", () => {
	it("shows generated timing summary, diagnostics, and detailed tables", () => {
		expect(source).toContain("Timing Diagnostics");
		expect(source).toContain("Tempo Events");
		expect(source).toContain("Time Signatures");
		expect(source).toContain("Generated Sections");
		expect(source).toContain("Generated Notes");
		expect(source).toContain("timing.summary.label");
		expect(source).toContain("timing.diagnostics");
	});

	it("formats offset as an adjustment and exposes source comparison unavailable", () => {
		expect(source).toContain("Offset adjustment");
		expect(source).toContain("SOURCE_COMPARISON_UNAVAILABLE");
		expect(source).not.toContain("Offset warning");
	});
});
