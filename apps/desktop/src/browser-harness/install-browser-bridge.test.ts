import { describe, expect, it } from "vitest";
import { createBrowserBridge, installBrowserBridge } from "./install-browser-bridge";
import { resolveBrowserScenario } from "./scenario-registry";
import {
	HARNESS_AUDIO_PREVIEW_SRC,
	HARNESS_PATHS,
} from "./fixture-builders";

describe("browser bridge installation", () => {
	it("installs a complete bridge with deterministic startup responses", async () => {
		const target: { chdg?: Window["chdg"] } = {};
		const scenario = resolveBrowserScenario("empty");
		const bridge = installBrowserBridge(target, scenario);

		expect(target.chdg).toBe(bridge);
		expect(await bridge.getAppInfo()).toMatchObject({ mode: "browser-harness" });
		expect(await bridge.getHealth()).toMatchObject({ ok: true, mode: "browser-harness" });
		expect(await bridge.readSettings()).toMatchObject({ ok: true });
		expect(await bridge.readRecentProjects()).toEqual({ ok: true, data: [], issues: [] });
	});

	it("refuses to overwrite an existing bridge", () => {
		const target = { chdg: createBrowserBridge(resolveBrowserScenario("empty")) };
		expect(() =>
			installBrowserBridge(target, resolveBrowserScenario("project-loaded")),
		).toThrow('bridge installation: window.chdg is already defined');
	});

	it("rejects unsupported operations with the operation and scenario", async () => {
		const bridge = createBrowserBridge(resolveBrowserScenario("preview-ready"));
		await expect(bridge.pickSourceFile()).rejects.toThrow(
			'operation "pickSourceFile" is unsupported in scenario "preview-ready"',
		);
		await expect(bridge.generatePackage({} as never)).rejects.toThrow(
			'operation "generatePackage" is unsupported in scenario "preview-ready"',
		);
	});

	it("returns scenario-owned source data for compatible synthetic inputs", async () => {
		const bridge = createBrowserBridge(
			resolveBrowserScenario("source-review-ready"),
		);
		const inspection = await bridge.inspectSource({
			sourcePath: HARNESS_PATHS.SOURCE,
			drumsOnly: true,
		});
		const normalization = await bridge.normalizeSelection({
			sourcePath: HARNESS_PATHS.SOURCE,
			trackIndexes: [3],
			mappingOverrides: {},
		});
		const fingerprint = await bridge.getSourceFingerprint(HARNESS_PATHS.SOURCE);
		expect(inspection).toMatchObject({
			ok: true,
			data: { sourcePath: HARNESS_PATHS.SOURCE },
		});
		expect(normalization).toMatchObject({
			ok: true,
			data: { sourcePath: HARNESS_PATHS.SOURCE, selectedTracks: [3] },
		});
		expect(fingerprint).toMatchObject({
			ok: true,
			data: { path: HARNESS_PATHS.SOURCE },
		});
	});

	it("rejects incompatible source paths, tracks, and mapping overrides", async () => {
		const bridge = createBrowserBridge(
			resolveBrowserScenario("source-review-attention"),
		);
		await expect(
			bridge.inspectSource({ sourcePath: "C:\\Other\\demo.mid" }),
		).rejects.toThrow(
			'operation "inspectSource" rejected input in scenario "source-review-attention": sourcePath must equal the scenario synthetic source path',
		);
		await expect(
			bridge.normalizeSelection({
				sourcePath: HARNESS_PATHS.SOURCE,
				trackIndexes: [7],
			}),
		).rejects.toThrow("selected tracks must equal scenario tracks [3]");
		await expect(
			bridge.normalizeSelection({
				sourcePath: HARNESS_PATHS.SOURCE,
				trackIndexes: [3],
				mappingOverrides: {
					"midi:99": { target: { kind: "piece", piece: "snare" } },
				},
			}),
		).rejects.toThrow("mappingOverrides must equal the scenario mapping state");
		await expect(
			bridge.getSourceFingerprint("C:\\Other\\demo.mid"),
		).rejects.toThrow(
			'operation "getSourceFingerprint" rejected input in scenario "source-review-attention"',
		);
	});

	it.each([
		{ trackIndex: 3, trackIndexes: [3] },
		{ trackIndex: 3, trackIndexes: [7] },
	])(
		"rejects normalization input with both track selectors: %j",
		async (trackSelection) => {
			const bridge = createBrowserBridge(
				resolveBrowserScenario("source-review-ready"),
			);
			await expect(
				bridge.normalizeSelection({
					sourcePath: HARNESS_PATHS.SOURCE,
					...trackSelection,
					mappingOverrides: {},
				}),
			).rejects.toThrow(
				'operation "normalizeSelection" rejected input in scenario "source-review-ready": trackIndex and trackIndexes cannot both be provided',
			);
		},
	);

	it("keeps legacy project persistence explicitly unavailable", async () => {
		const scenario = resolveBrowserScenario("source-review-ready");
		const bridge = createBrowserBridge(scenario);
		await expect(
			bridge.saveProject(scenario.project!),
		).rejects.toThrow(
			'operation "saveProject" is unsupported in scenario "source-review-ready"',
		);
		await expect(
			createBrowserBridge(resolveBrowserScenario("empty")).saveProject({
				...scenario.project!,
			}),
		).rejects.toThrow(
			'operation "saveProject" is unsupported in scenario "empty"',
		);
	});

	it("returns a typed unavailable result for canonical project deletion", async () => {
		const bridge = createBrowserBridge(resolveBrowserScenario("project-loaded"));

		await expect(
			bridge.deleteProjectFile(HARNESS_PATHS.PROJECT),
		).resolves.toEqual({
			ok: false,
			error: {
				code: "CANONICAL_PROJECT_DELETE_NOT_AVAILABLE",
				message:
					"Whole-project deletion requires a dedicated canonical filesystem contract and is not available in this legacy workflow.",
			},
			issues: [],
		});
	});

	it("validates preview paths before returning static chart and audio data", async () => {
		const bridge = createBrowserBridge(resolveBrowserScenario("preview-ready"));
		await expect(
			bridge.getChartPreviewData({
				chartPath: HARNESS_PATHS.CHART,
			}),
		).resolves.toMatchObject({ ok: true, data: { resolution: 480 } });
		await expect(
			bridge.getAudioPreviewSource({
				generatedSongOggPath: HARNESS_PATHS.SONG_OGG,
			}),
		).resolves.toMatchObject({
			ok: true,
			data: {
				src: HARNESS_AUDIO_PREVIEW_SRC,
				sourceKind: "generated",
			},
		});
		await expect(
			bridge.getChartPreviewData({
				chartPath: "C:\\Other\\notes.chart",
			}),
		).rejects.toThrow(
			'operation "getChartPreviewData" rejected input in scenario "preview-ready"',
		);
		await expect(
			bridge.getAudioPreviewSource({
				generatedSongOggPath: "C:\\Other\\song.ogg",
			}),
		).rejects.toThrow(
			'operation "getAudioPreviewSource" rejected input in scenario "preview-ready"',
		);
	});
});
