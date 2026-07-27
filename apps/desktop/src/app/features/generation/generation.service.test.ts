import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canOpenCanonicalPreview } from "./generation.service";

const source = readFileSync(
	new URL("./generation.service.ts", import.meta.url),
	"utf8",
);

describe("GenerationService legacy persistence detachment", () => {
	it("keeps managed generation explicitly unavailable without bridge calls", () => {
		expect(source).not.toContain(".saveProject(");
		expect(source).not.toContain("buildProjectStatePayload");
		expect(source).not.toContain("bridge.generatePackage");
		expect(source).not.toContain("buildGenerateInput");
		expect(source).not.toContain("startGenerating");
		expect(source).not.toContain("applyGeneration");
		expect(source).toContain(
			"Managed package generation is not available in this legacy workflow.",
		);
	});

	it("opens Preview only for current canonical output with both managed files", () => {
		expect(
			canOpenCanonicalPreview(
				{
					outputFiles: {
						chart: "/tmp/output/notes.chart",
						songOgg: "/tmp/output/song.ogg",
					},
				},
				{ outputStatus: "generated", missingPaths: [] },
			),
		).toBe(true);
		expect(
			canOpenCanonicalPreview(
				{ outputFiles: { chart: "/tmp/output/notes.chart" } },
				{ outputStatus: "generated", missingPaths: [] },
			),
		).toBe(false);
		expect(
			canOpenCanonicalPreview(
				{ outputFiles: { songOgg: "/tmp/output/song.ogg" } },
				{ outputStatus: "generated", missingPaths: [] },
			),
		).toBe(false);
	});

	it("rejects stale output and missing managed paths", () => {
		const outputFiles = {
			chart: "/tmp/output/notes.chart",
			songOgg: "/tmp/output/song.ogg",
		};
		expect(
			canOpenCanonicalPreview(
				{ outputFiles },
				{ outputStatus: "needs-regenerate", missingPaths: [] },
			),
		).toBe(false);
		for (const kind of [
			"outputDir",
			"outputChartPath",
			"outputAudioPath",
		] as const) {
			expect(
				canOpenCanonicalPreview(
					{ outputFiles },
					{
						outputStatus: "generated",
						missingPaths: [{ kind, message: `${kind} missing` }],
					},
				),
			).toBe(false);
		}
	});
});
