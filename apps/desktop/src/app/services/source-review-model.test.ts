import { describe, expect, it } from "vitest";
import type { SourceInspectionResult } from "@chdg/project/browser";
import { MIDI_DRUM_NOTE_ATLAS_VERSION } from "@chdg/project/browser";
import {
	createAnalysisCache,
	hasStaleGpifTrackNoteCounts,
	mappingAttentionState,
	mappingReviewCounts,
	selectedTracksKey,
	sourceFingerprintMatches,
	shouldExpandMappingReview,
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
		expect(left).toContain(MIDI_DRUM_NOTE_ATLAS_VERSION);
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
		expect(cache.schemaVersion).toBe(2);
		expect(validateSourceReviewCache({ cache, sourceFingerprint, mappingFingerprint: "{}", selectedTracks: [3] }).valid).toBe(true);
	});


	it("invalidates cached normalization when atlas version changes", () => {
		const sourceFingerprint = { path: "/tmp/demo.mid", sizeBytes: 1, mtimeMs: 2 };
		const cache = createAnalysisCache({
			sourceFingerprint,
			mappingFingerprint: stableMappingFingerprint({}),
			selectedTracks: [3],
			inspection,
			normalizationPreview: {
				...normalizationPreview,
				mappingCoverage: {
					atlasVersion: "0.0.9",
					totalEventCount: 1,
					mappedEventCount: 1,
					candidateEventCount: 0,
					ignoredEventCount: 0,
					unknownEventCount: 0,
					mappedSourceCount: 1,
					candidateSourceCount: 0,
					ignoredSourceCount: 0,
					unknownSourceCount: 0,
				},
			},
		});
		expect(validateSourceReviewCache({ cache, sourceFingerprint, mappingFingerprint: stableMappingFingerprint({}), selectedTracks: [3] })).toEqual({ valid: false, reason: "mapping" });
	});

	it("invalidates stale GPIF v1 caches when selected track note counts are missing", () => {
		const sourceFingerprint = { path: "/tmp/demo.gp", sizeBytes: 1, mtimeMs: 2 };
		const staleInspection: SourceInspectionResult = {
			sourceKind: "gpif",
			sourcePath: "/tmp/demo.gp",
			tempos: [],
			timeSignatures: [],
			sections: [],
			tracks: [
				{ index: 0, noteCount: null, role: "unknown", strength: "unknown" },
				{ index: 3, noteCount: null, role: "drums", strength: "strong" },
			],
			issues: [],
		};
		const staleCache = {
			schemaVersion: 1 as const,
			sourceFingerprint,
			mappingFingerprint: "{}",
			selectedTracks: [3],
			inspectedAt: "2026-01-01T00:00:00.000Z",
			inspection: staleInspection,
			normalizationPreview: {
				...normalizationPreview,
				sourceKind: "gpif" as const,
				sourcePath: "/tmp/demo.gp",
			},
		};

		expect(hasStaleGpifTrackNoteCounts(staleCache, [3])).toBe(true);
		expect(validateSourceReviewCache({ cache: staleCache, sourceFingerprint, mappingFingerprint: "{}", selectedTracks: [3] })).toEqual({ valid: false, reason: "inspection" });
	});

	it("keeps v2 GPIF caches valid even when a source truly has unknown note counts", () => {
		const sourceFingerprint = { path: "/tmp/demo.gp", sizeBytes: 1, mtimeMs: 2 };
		const cache = createAnalysisCache({
			sourceFingerprint,
			mappingFingerprint: "{}",
			selectedTracks: [3],
			inspection: {
				...inspection,
				sourceKind: "gpif",
				sourcePath: "/tmp/demo.gp",
				tracks: [{ index: 3, noteCount: null, role: "drums", strength: "strong" }],
			},
			normalizationPreview: {
				...normalizationPreview,
				sourceKind: "gpif" as const,
				sourcePath: "/tmp/demo.gp",
			},
		});

		expect(hasStaleGpifTrackNoteCounts(cache, [3])).toBe(false);
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

	it("keeps Mapping Review collapsed for generic warnings", () => {
		expect(
			shouldExpandMappingReview({
				overrides: {},
				normalizationPreview: {
					...normalizationPreview,
					issues: [
						{
							severity: "warning",
							code: "GENERIC_WARNING",
							message: "Generic warning belongs in Issues & Warnings.",
						},
					],
				},
			}),
		).toBe(false);
	});

	it("opens Mapping Review for mapping unknowns or active overrides", () => {
		expect(
			shouldExpandMappingReview({
				overrides: {},
				normalizationPreview: {
					...normalizationPreview,
					mappingCandidates: [
						{
							key: "gpif:Mystery",
							sourceKind: "gpif",
							sourceValue: "Mystery",
							automaticPiece: "unknown",
							count: 1,
						},
					],
				},
			}),
		).toBe(true);
		expect(
			shouldExpandMappingReview({
				overrides: {
					"gpif:Mystery": {
						sourceKind: "gpif",
						key: "gpif:Mystery",
						target: { kind: "ignore" },
					},
				},
				normalizationPreview,
			}),
		).toBe(true);
	});
	describe("mapping coverage semantic states", () => {
		it("treats ignored known percussion as resolved and not unknown", () => {
			const rows = [
				{
					key: "midi:54",
					sourceKind: "midi" as const,
					sourceValue: "54",
					action: "ignore" as const,
					automaticPiece: "unknown" as const,
					label: "Tambourine",
					count: 1,
				},
			];

			expect(mappingReviewCounts({ rows, overrides: {} })).toMatchObject({
				unknown: 0,
				candidates: 0,
				ignoredKnown: 1,
				unresolvedUnknown: 0,
				unresolvedCandidates: 0,
			});
			expect(mappingAttentionState({ rows, overrides: {} })).toBe(
				"known-percussion-ignored",
			);
			expect(
				shouldExpandMappingReview({
					overrides: {},
					normalizationPreview: { ...normalizationPreview, mappingCandidates: rows },
				}),
			).toBe(false);
		});

		it("separates unresolved candidates from unknowns", () => {
			const rows = [
				{
					key: "midi:44",
					sourceKind: "midi" as const,
					sourceValue: "44",
					action: "candidate" as const,
					suggestedPiece: "hihat_closed" as const,
					count: 1,
				},
			];

			expect(mappingReviewCounts({ rows, overrides: {} })).toMatchObject({
				unknown: 0,
				candidates: 1,
				unresolvedUnknown: 0,
				unresolvedCandidates: 1,
			});
			expect(mappingAttentionState({ rows, overrides: {} })).toBe(
				"review-recommended",
			);
		});

		it("keeps unresolved unknowns as strongest attention", () => {
			const rows = [
				{
					key: "midi:92",
					sourceKind: "midi" as const,
					sourceValue: "92",
					action: "unknown" as const,
					automaticPiece: "unknown" as const,
					count: 1,
				},
			];

			expect(mappingReviewCounts({ rows, overrides: {} })).toMatchObject({
				unknown: 1,
				unresolvedUnknown: 1,
			});
			expect(mappingAttentionState({ rows, overrides: {} })).toBe(
				"manual-mapping-needed",
			);
		});

		 it("treats piece override as resolving a candidate", () => {
			const rows = [
				{
					key: "midi:44",
					sourceKind: "midi" as const,
					sourceValue: "44",
					action: "candidate" as const,
					suggestedPiece: "hihat_closed" as const,
					count: 1,
				},
			];
			const overrides = {
				"midi:44": {
					sourceKind: "midi" as const,
					key: "midi:44",
					target: { kind: "piece" as const, piece: "hihat_closed" as const },
				},
			};

			expect(mappingReviewCounts({ rows, overrides })).toMatchObject({
				candidates: 1,
				unresolvedCandidates: 0,
			});
			expect(mappingAttentionState({ rows, overrides })).toBe("ready");
		});

		it("treats ignore override as resolving an unknown", () => {
			const rows = [
				{
					key: "midi:92",
					sourceKind: "midi" as const,
					sourceValue: "92",
					action: "unknown" as const,
					automaticPiece: "unknown" as const,
					count: 1,
				},
			];
			const overrides = {
				"midi:92": {
					sourceKind: "midi" as const,
					key: "midi:92",
					target: { kind: "ignore" as const },
				},
			};

			expect(mappingReviewCounts({ rows, overrides })).toMatchObject({
				unknown: 1,
				unresolvedUnknown: 0,
			});
			expect(mappingAttentionState({ rows, overrides })).toBe("ready");
		});
	});

});
