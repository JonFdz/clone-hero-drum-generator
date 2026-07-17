import { describe, expect, it } from "vitest";
import { createBrowserBridge } from "./install-browser-bridge";
import { resolveBrowserScenario } from "./scenario-registry";
import { DesktopPreviewService } from "../app/services/desktop-preview.service";

describe("initial browser harness scenarios", () => {
	it("keeps empty stateless and project-loaded project-backed", () => {
		expect(resolveBrowserScenario("empty").project).toBeUndefined();
		expect(resolveBrowserScenario("project-loaded").project).toMatchObject({
			projectName: "Demo Project",
			generationStatus: "not-generated",
		});
	});

	it("provides coherent ready and attention source-review states", () => {
		const ready = resolveBrowserScenario("source-review-ready");
		const readyMappedHitCount = Object.values(
			ready.normalization?.pieceSummary ?? {},
		).reduce((total, count) => total + count, 0);
		expect(ready.project?.selectedTracks).toEqual([3]);
		expect(ready.normalization?.issues).toEqual([]);
		expect(ready.normalization?.mappingCandidates[0].action).toBe("map");
		expect(readyMappedHitCount).toBe(ready.normalization?.hitCount);
		expect(readyMappedHitCount).toBe(ready.inspection?.tracks[0]?.noteCount);

		const attention = resolveBrowserScenario("source-review-attention");
		const inspectedNoteCount = attention.inspection?.tracks[0]?.noteCount ?? 0;
		const knownMappedHitCount = Object.values(
			attention.normalization?.pieceSummary ?? {},
		).reduce((total, count) => total + count, 0);
		const unknownHitCount =
			attention.normalization?.mappingCandidates
				.filter((candidate) => candidate.action === "unknown")
				.reduce((total, candidate) => total + candidate.count, 0) ?? 0;

		expect(attention.normalization?.issues[0]).toMatchObject({
			severity: "warning",
			code: "UNKNOWN_MIDI_NOTE",
		});
		expect(attention.normalization?.mappingCandidates[0].action).toBe("unknown");
		expect(knownMappedHitCount).toBe(attention.normalization?.hitCount);
		expect(knownMappedHitCount + unknownHitCount).toBe(inspectedNoteCount);
	});

	it("distinguishes ready, running, and failed generation state seeds", () => {
		expect(resolveBrowserScenario("generate-ready").generationSeed).toBe("ready");
		expect(resolveBrowserScenario("generate-running").generationSeed).toBe(
			"running",
		);
		expect(resolveBrowserScenario("generate-failed").generationSeed).toBe(
			"failed",
		);
	});

	it("provides chart preview data while honestly rejecting browser audio", async () => {
		const bridge = createBrowserBridge(resolveBrowserScenario("preview-ready"));
		const chart = await bridge.getChartPreviewData({});
		const audio = await bridge.getAudioPreviewSource({});
		expect(chart).toMatchObject({ ok: true, data: { resolution: 480 } });
		expect(chart.ok && chart.data.noteEvents.length).toBeGreaterThan(0);
		expect(audio).toMatchObject({
			ok: false,
			error: { code: "BROWSER_AUDIO_UNAVAILABLE" },
		});
	});

	it("loads preview-ready chart data through the real preview service path", async () => {
		const scenario = resolveBrowserScenario("preview-ready");
		const project = scenario.project!;
		const service = new DesktopPreviewService(
			createBrowserBridge(scenario) as never,
			{
				state: () => ({
					sourcePath: project.sourcePath,
					outputDir: project.outputDir,
					outputFiles: project.outputFiles,
					analysisCache: project.analysis,
					selectedTracks: project.selectedTracks,
					mappingOverrides: project.mappingOverrides ?? {},
					metadata: project.metadata,
					status: "generated",
				}),
			} as never,
			{} as never,
		);

		await service.load();

		expect(service.chartData()?.noteEvents.length).toBeGreaterThan(0);
		expect(service.previewStatus()).toBe("Chart ready · audio unavailable");
	});

	it("never runs generation as part of scenario setup", async () => {
		for (const id of ["generate-ready", "generate-running", "generate-failed"] as const) {
			const bridge = createBrowserBridge(resolveBrowserScenario(id));
			await expect(bridge.generatePackage({} as never)).rejects.toThrow(
				`operation "generatePackage" is unsupported in scenario "${id}"`,
			);
		}
	});
});
