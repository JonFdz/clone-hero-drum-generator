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
) {
	const getChartPreviewData = vi.fn().mockResolvedValue({
		ok: false,
		error: { message: "stop after cache handoff" },
	});
	const bridge = {
		getSourceFingerprint: vi.fn().mockResolvedValue(fingerprintResult),
		getChartPreviewData,
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
});
