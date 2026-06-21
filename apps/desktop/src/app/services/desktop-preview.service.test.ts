import "@angular/compiler";
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
		audioResult?: { ok: false; error: { message: string } };
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
			outputFiles: { chart: "/tmp/output/notes.chart" },
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
			{} as never,
		),
	};
}

describe("DesktopPreviewService analysis cache handoff", () => {
	it("does not forward a stale analysis cache to the runtime bridge", async () => {
		const { getChartPreviewData, service } = createService({
			ok: true,
			data: { ...sourceFingerprint, sizeBytes: sourceFingerprint.sizeBytes + 1 },
		});

		await service.load();

		expect(getChartPreviewData).toHaveBeenCalledWith({
			outputDir: "/tmp/output",
			chartPath: "/tmp/output/notes.chart",
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
			outputDir: "/tmp/output",
			chartPath: "/tmp/output/notes.chart",
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
			outputDir: "/tmp/output",
			chartPath: "/tmp/output/notes.chart",
			analysis: analysisCache,
		});
	});

	it("keeps chart timing available when generated audio cannot be loaded", async () => {
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

		expect(service.chartData()).toBe(chartData);
		expect(service.audioSrc()).toBeNull();
		expect(service.error()).toBeNull();
		expect(service.waveformStatus()).toBe("empty");
		expect(service.waveformError()).toBe(
			"Audio and waveform unavailable: song.ogg missing",
		);
		expect(service.previewStatus()).toBe("Chart ready · audio unavailable");
	});

	it("handles a browser audio runtime error without hiding loaded chart timing", () => {
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

		expect(service.chartData()).toBe(chartData);
		expect(service.error()).toBeNull();
		expect(service.audioSrc()).toBeNull();
		expect(service.sourceKind()).toBeNull();
		expect(service.currentTime()).toBe(0);
		expect(service.duration()).toBe(0);
		expect(service.waveformStatus()).toBe("empty");
		expect(service.waveformError()).toBe(
			"Audio and waveform unavailable: Audio failed to load.",
		);
		expect(service.previewStatus()).toBe("Chart ready · audio unavailable");
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
