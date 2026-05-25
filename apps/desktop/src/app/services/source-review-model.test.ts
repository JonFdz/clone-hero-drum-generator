import { describe, expect, it } from "vitest";
import type { SourceInspectionResult } from "@chdg/project/browser";
import {
	createAnalysisCache,
	selectedTracksKey,
	sourceFingerprintMatches,
	stableMappingFingerprint,
	strongestDefaultTrack,
	validateSourceReviewCache,
} from "./source-review-model";

const inspection: SourceInspectionResult = {
	sourceKind: "midi",
	sourcePath: "/tmp/demo.mid",
	resolution: 480,
	tempos: [],
	timeSignatures: [],
	sections: [],
	tracks: [
		{ index: 1, noteCount: 12, role: "unknown", strength: "unknown" },
		{ index: 3, noteCount: 100, role: "drums", strength: "strong" },
		{ index: 10, noteCount: 90, role: "drums", strength: "strong" },
	],
	issues: [],
};

const normalizationPreview = {
	sourceKind: "midi" as const,
	sourcePath: "/tmp/demo.mid",
	selectedTrack: 3,
	selectedTracks: [3],
	hitCount: 100,
	pieceSummary: {},
	firstHits: [],
	mappingCandidates: [],
	issues: [],
};

describe("source-review-model", () => {
	it("selects exactly one strongest default track", () => {
		expect(strongestDefaultTrack(inspection.tracks)).toEqual([3]);
	});

	it("preserves stable selected track keys", () => {
		expect(selectedTracksKey([10, 3, 10])).toBe("3,10,10");
	});

	it("compares source fingerprint path, size, and mtime", () => {
		expect(sourceFingerprintMatches({ path: "a", sizeBytes: 1, mtimeMs: 2 }, { path: "a", sizeBytes: 1, mtimeMs: 2 })).toBe(true);
		expect(sourceFingerprintMatches({ path: "a", sizeBytes: 1, mtimeMs: 2 }, { path: "a", sizeBytes: 2, mtimeMs: 2 })).toBe(false);
	});

	it("creates a stable mapping fingerprint independent of object key order", () => {
		const left = stableMappingFingerprint({
			"midi:40": { sourceKind: "midi", key: "midi:40", target: { kind: "ignore" } },
			"midi:37": { sourceKind: "midi", key: "midi:37", target: { kind: "piece", piece: "snare" } },
		});
		const right = stableMappingFingerprint({
			"midi:37": { sourceKind: "midi", key: "midi:37", target: { kind: "piece", piece: "snare" } },
			"midi:40": { sourceKind: "midi", key: "midi:40", target: { kind: "ignore" } },
		});
		expect(left).toBe(right);
	});

	it("validates matching complete cache", () => {
		const sourceFingerprint = { path: "/tmp/demo.mid", sizeBytes: 1, mtimeMs: 2 };
		const cache = createAnalysisCache({
			sourceFingerprint,
			mappingFingerprint: "{}",
			selectedTracks: [3],
			inspection,
			normalizationPreview,
		});
		expect(validateSourceReviewCache({ cache, sourceFingerprint, mappingFingerprint: "{}", selectedTracks: [3] }).valid).toBe(true);
	});

	it("invalidates cache on source, mapping, and selected track mismatch", () => {
		const sourceFingerprint = { path: "/tmp/demo.mid", sizeBytes: 1, mtimeMs: 2 };
		const cache = createAnalysisCache({
			sourceFingerprint,
			mappingFingerprint: "{}",
			selectedTracks: [3],
			inspection,
			normalizationPreview,
		});
		expect(validateSourceReviewCache({ cache, sourceFingerprint: { ...sourceFingerprint, mtimeMs: 3 }, mappingFingerprint: "{}", selectedTracks: [3] })).toEqual({ valid: false, reason: "source" });
		expect(validateSourceReviewCache({ cache, sourceFingerprint, mappingFingerprint: "changed", selectedTracks: [3] })).toEqual({ valid: false, reason: "mapping" });
		expect(validateSourceReviewCache({ cache, sourceFingerprint, mappingFingerprint: "{}", selectedTracks: [10] })).toEqual({ valid: false, reason: "tracks" });
	});
});
