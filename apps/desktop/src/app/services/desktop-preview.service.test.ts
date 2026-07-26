import "@angular/compiler";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { createAnalysisCache, stableMappingFingerprint } from "./source-review-model";
import { DesktopPreviewService } from "./desktop-preview.service";

const sourceFingerprint = {
	path: "/tmp/demo.mid",
	sizeBytes: 100,
	mtimeMs: 200,
};

const analysisCache = createAnalysisCache({
	sourceFingerprint,
	mappingFingerprint: stableMappingFingerprint({}),
	selectedTracks: [3],
	inspection: {
		sourceKind: "midi",
		sourcePath: "/tmp/demo.mid",
		resolution: 480,
		tempos: [],
		timeSignatures: [],
		sections: [],
		tracks: [
			{ index: 3, noteCount: 100, role: "drums", strength: "strong" },
		],
		issues: [],
	},
	normalizationPreview: {
		sourceKind: "midi",
		sourcePath: "/tmp/demo.mid",
		selectedTrack: 3,
		selectedTracks: [3],
		hitCount: 100,
		pieceSummary: {},
		firstHits: [],
		mappingCandidates: [],
		issues: [],
	},
});

function createService(
	fingerprintResult:
		| { ok: true; data: typeof sourceFingerprint }
		| { ok: false; error: { message: string } },
	options?: {
		chartResult?: { ok: true; data: { noteEvents: never[]; timing: object } };
		audioResult?:
			| {
					ok: true;
					data: { src: string; sourceKind: "generated" };
			  }
			| { ok: false; error: { message: string } };
	},
) {
	const getChartPreviewData = vi.fn().mockResolvedValue(
		options?.chartResult ?? {
			ok: false,
			error: { message: "stop after cache handoff" },
		},
	);
	const getAudioPreviewSource = vi.fn().mockResolvedValue(
		options?.audioResult ?? {
			ok: false,
			error: { message: "audio unavailable" },
		},
	);
	const bridge = {
		getSourceFingerprint: vi.fn().mockResolvedValue(fingerprintResult),
		getChartPreviewData,
		getAudioPreviewSource,
	};
	const generateState = {
		state: () => ({
			sourcePath: "/tmp/demo.mid",
			outputDir: "/tmp/output",
			outputFiles: {
				chart: "/tmp/output/notes.chart",
				songOgg: "/tmp/output/song.ogg",
			},
			analysisCache,
			selectedTracks: [3],
			mappingOverrides: {},
			metadata: {},
			issues: [],
			logs: [],
			status: "generated",
		}),
	};

	return {
		getChartPreviewData,
		getAudioPreviewSource,
		service: new DesktopPreviewService(
			bridge as never,
			generateState as never,
		),
	};
}

describe("DesktopPreviewService analysis cache handoff", () => {
	it("blocks canonical Preview when the export manifest has only notes.chart", async () => {
		const getChartPreviewData = vi.fn();
		const getAudioPreviewSource = vi.fn();
		const service = new DesktopPreviewService(
			{ getChartPreviewData, getAudioPreviewSource } as never,
			{
				state: () => ({
					status: "generated",
					metadata: {},
					outputDir: "/tmp/output",
					outputFiles: { chart: "/tmp/output/notes.chart" },
				}),
			} as never,
		);

		await service.load();

		expect(service.error()).toBe(
			"Existing managed preview output is unavailable. The canonical export manifest must include both notes.chart and song.ogg.",
		);
		expect(getChartPreviewData).not.toHaveBeenCalled();
		expect(getAudioPreviewSource).not.toHaveBeenCalled();
	});

	it("blocks canonical Preview when the export manifest has only song.ogg", async () => {
		const getChartPreviewData = vi.fn();
		const getAudioPreviewSource = vi.fn();
		const service = new DesktopPreviewService(
			{ getChartPreviewData, getAudioPreviewSource } as never,
			{
				state: () => ({
					status: "generated",
					metadata: {},
					outputDir: "/tmp/output",
					outputFiles: { songOgg: "/tmp/output/song.ogg" },
				}),
			} as never,
		);

		await service.load();

		expect(service.error()).toBe(
			"Existing managed preview output is unavailable. The canonical export manifest must include both notes.chart and song.ogg.",
		);
		expect(getChartPreviewData).not.toHaveBeenCalled();
		expect(getAudioPreviewSource).not.toHaveBeenCalled();
	});

	it("uses both manifest-derived paths without forwarding outputDir", async () => {
		const { getChartPreviewData, getAudioPreviewSource, service } = createService(
			{
				ok: false,
				error: { message: "fingerprint unavailable" },
			},
			{
				chartResult: {
					ok: true,
					data: { noteEvents: [], timing: {} },
				},
				audioResult: {
					ok: true,
					data: {
						src: "file:///tmp/output/song.ogg",
						sourceKind: "generated",
					},
				},
			},
		);

		await service.load();

		expect(getChartPreviewData).toHaveBeenCalledWith({
			chartPath: "/tmp/output/notes.chart",
			sourceTiming: undefined,
			analysis: undefined,
		});
		expect(getAudioPreviewSource).toHaveBeenCalledWith({
			generatedSongOggPath: "/tmp/output/song.ogg",
		});
		expect(service.audioSrc()).toBe("file:///tmp/output/song.ogg");
	});

	it("blocks Preview when the manifest chart path is missing on disk", async () => {
		const { getAudioPreviewSource, service } = createService(
			{ ok: false, error: { message: "fingerprint unavailable" } },
			{
				audioResult: {
					ok: true,
					data: {
						src: "file:///tmp/output/song.ogg",
						sourceKind: "generated",
					},
				},
			},
		);

		await service.load();

		expect(service.error()).toBe(
			"Generated notes.chart unavailable: stop after cache handoff",
		);
		expect(service.chartData()).toBeNull();
		expect(getAudioPreviewSource).not.toHaveBeenCalled();
	});

	it("keeps offset changes runtime-only instead of invoking retired project saves", () => {
		const source = readFileSync(
			new URL("./desktop-preview.service.ts", import.meta.url),
			"utf8",
		);
		expect(source).not.toContain(".saveProject(");
		expect(source).not.toContain("buildProjectStatePayload");
		expect(source).not.toContain(".applyChartOffset(");
		expect(source).not.toContain("markDirty()");
		expect(source).not.toContain("markNeedsRegenerate()");
		expect(source).not.toContain("setOffsetMsInput(");
		expect(source).toContain("runtimeOffsetStatusMessage()");
	});

	it("reports missing managed preview output without offering generation", async () => {
		const service = new DesktopPreviewService({} as never, {
			state: () => ({ status: "idle", metadata: {} }),
		} as never);

		await service.load();

		expect(service.error()).toBe(
			"Existing managed preview output is unavailable. The canonical export manifest must include both notes.chart and song.ogg.",
		);
		expect(service.error()).not.toMatch(/^Generate /);
	});

	it("keeps an applied offset as the session baseline until explicit reload", async () => {
		const { service } = createService({ ok: true, data: sourceFingerprint });
		service.setPreviewOffsetInput("125");

		await service.applyOffset();

		expect(service.previewOffsetMs()).toBe(125);
		expect(service.savedOffsetMs()).toBe(125);
		expect(service.offsetDirty()).toBe(false);
		expect(service.offsetStatus()).toBe(
			"Preview offset applied for this runtime session only. notes.chart was not modified.",
		);

		await service.load();

		expect(service.previewOffsetMs()).toBe(0);
		expect(service.savedOffsetMs()).toBe(0);
	});

	it("does not forward a stale analysis cache to the runtime bridge", async () => {
		const { getChartPreviewData, service } = createService({
			ok: true,
			data: { ...sourceFingerprint, sizeBytes: sourceFingerprint.sizeBytes + 1 },
		});

		await service.load();

		expect(getChartPreviewData).toHaveBeenCalledWith({
			chartPath: "/tmp/output/notes.chart",
			sourceTiming: undefined,
			analysis: undefined,
		});
	});

	it("does not forward analysis when the source fingerprint is unavailable", async () => {
		const { getChartPreviewData, service } = createService({
			ok: false,
			error: { message: "fingerprint unavailable" },
		});

		await service.load();

		expect(getChartPreviewData).toHaveBeenCalledWith({
			chartPath: "/tmp/output/notes.chart",
			sourceTiming: undefined,
			analysis: undefined,
		});
	});

	it("forwards a fresh analysis cache to the runtime bridge", async () => {
		const { getChartPreviewData, service } = createService({
			ok: true,
			data: sourceFingerprint,
		});

		await service.load();

		expect(getChartPreviewData).toHaveBeenCalledWith({
			chartPath: "/tmp/output/notes.chart",
			sourceTiming: undefined,
			analysis: analysisCache,
		});
	});

	it("blocks Preview when the manifest audio path is missing on disk", async () => {
		const chartData = {
			noteEvents: [],
			timing: { summary: { label: "Timing: 2 warnings" } },
		};
		const { service } = createService(
			{ ok: true, data: sourceFingerprint },
			{
				chartResult: { ok: true, data: chartData },
				audioResult: {
					ok: false,
					error: { message: "song.ogg missing" },
				},
			},
		);

		await service.load();

		expect(service.chartData()).toBeNull();
		expect(service.audioSrc()).toBeNull();
		expect(service.error()).toBe("Generated song.ogg unavailable: song.ogg missing");
		expect(service.waveformStatus()).toBe("empty");
		expect(service.waveformError()).toBeNull();
		expect(service.previewStatus()).toBe("Preview unavailable");
	});

	it("blocks canonical Preview when browser audio fails at runtime", () => {
		const { service } = createService({ ok: true, data: sourceFingerprint });
		const chartData = {
			noteEvents: [],
			timing: { summary: { label: "Timing: OK" } },
		};
		service.chartData.set(chartData as never);
		service.audioSrc.set("file:///tmp/output/song.ogg");
		service.sourceKind.set("generated");
		service.waveformStatus.set("ready");
		service.currentTime.set(12);
		service.duration.set(120);

		service.handleAudioRuntimeError("Audio failed to load.");

		expect(service.chartData()).toBeNull();
		expect(service.error()).toBe(
			"Preview audio failed at runtime: Audio failed to load.",
		);
		expect(service.audioSrc()).toBeNull();
		expect(service.sourceKind()).toBeNull();
		expect(service.currentTime()).toBe(0);
		expect(service.duration()).toBe(0);
		expect(service.waveformStatus()).toBe("empty");
		expect(service.waveformError()).toBeNull();
		expect(service.previewStatus()).toBe("Preview unavailable");
	});

	it("distinguishes usable audio from waveform-only failure", () => {
		const { service } = createService({ ok: true, data: sourceFingerprint });
		expect(service.previewStatus()).toBe("Preview unavailable");

		service.chartData.set({ noteEvents: [], timing: {} } as never);
		service.audioSrc.set("file:///tmp/output/song.ogg");
		service.sourceKind.set("generated");
		service.waveformStatus.set("ready");

		expect(service.previewStatus()).toBe("Preview up to date");

		service.waveformStatus.set("error");
		expect(service.previewStatus()).toBe(
			"Preview ready · waveform unavailable",
		);
	});
});
