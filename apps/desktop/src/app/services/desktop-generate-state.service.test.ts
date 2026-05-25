import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { DesktopGenerateState } from "./desktop-generate-state.service";
import {
	chooseDefaultTracks,
	detectDesktopSourceKind,
	validateGenerateState,
} from "./desktop-generate-model";

function state(
	overrides: Partial<DesktopGenerateState> = {},
): DesktopGenerateState {
	return {
		metadata: {},
		selectedTracks: [],
		issues: [],
		logs: [],
		mappingOverrides: {},
		status: "idle",
		...overrides,
	};
}

describe("desktop generate state helpers", () => {
	it("detects supported source types", () => {
		expect(detectDesktopSourceKind("song.mid")).toBe("midi");
		expect(detectDesktopSourceKind("song.MIDI")).toBe("midi");
		expect(detectDesktopSourceKind("song.gp")).toBe("gpif");
		expect(detectDesktopSourceKind("song.gp5")).toBeUndefined();
	});

	it("blocks generation without required audio", () => {
		const result = validateGenerateState(
			state({
				sourcePath: "demo.mid",
				outputDir: "/tmp/out",
				selectedTracks: [1],
			}),
		);

		expect(result.ok).toBe(false);
		expect(result.errors).toContain(
			"Audio file is required for Desktop Generate MVP.",
		);
	});

	it("blocks generation without source or output", () => {
		const result = validateGenerateState(
			state({ audioPath: "demo.mp3", selectedTracks: [1] }),
		);

		expect(result.ok).toBe(false);
		expect(result.errors).toContain("Source file is required.");
		expect(result.errors).toContain("Output folder is required.");
	});

	it("supports single and multiple selected tracks", () => {
		expect(
			validateGenerateState(
				state({
					sourcePath: "demo.gp",
					audioPath: "demo.wav",
					outputDir: "/tmp/out",
					selectedTracks: [3],
				}),
			).ok,
		).toBe(true);
		expect(
			validateGenerateState(
				state({
					sourcePath: "demo.gp",
					audioPath: "demo.wav",
					outputDir: "/tmp/out",
					selectedTracks: [3, 10],
				}),
			).ok,
		).toBe(true);
	});

	it("chooses the first strong drum candidate by default", () => {
		expect(
			chooseDefaultTracks([
				{ index: 1, noteCount: 0, strength: "unknown", role: "unknown" },
				{ index: 3, noteCount: 10, strength: "strong", role: "drums" },
				{ index: 10, noteCount: 8, strength: "strong", role: "drums" },
			]),
		).toEqual([3]);
	});
});

describe("desktop generate state source regressions", () => {
	const source = readFileSync(
		join(
			process.cwd(),
			"apps/desktop/src/app/services/desktop-generate-state.service.ts",
		),
		"utf8",
	);

	it("metadata changes use markNeedsRegenerate instead of markDirty", () => {
		expect(source).toContain("setMetadata(metadata: DesktopMetadata): void {");
		expect(source).toContain("this.projectState.markNeedsRegenerate();");
		expect(source).not.toContain(
			"setMetadata(metadata: DesktopMetadata): void {\n\t\tthis.patch({ metadata: { ...this.state().metadata, ...metadata } });\n\t\tthis.projectState.markDirty();",
		);
	});

	it("preserves outputFiles and lastGeneratedAt in project payload rebuild", () => {
		expect(source).toContain("lastGeneratedAt: state.lastGeneratedAt");
		expect(source).toContain(": state.outputFiles");
	});

	it("setMappingOverrides marks preview stale without clearing normalization preview", () => {
		expect(source).toContain("normalizationPreviewStale: true");
		expect(source).not.toContain(
			"setMappingOverrides(mappingOverrides: ProjectMappingOverrides): void {\n\t\tthis.patch({\n\t\t\tmappingOverrides: { ...mappingOverrides },\n\t\t\tnormalizationPreview: undefined,",
		);
	});

	it("marks generation failures before replacing the generating state", () => {
		expect(source).toContain(
			'const wasGenerating = this.state().status === "generating";',
		);
		expect(source).toContain("if (wasGenerating) {");
		expect(source).not.toContain('if (this.state().status === "generating") {');
	});
});
