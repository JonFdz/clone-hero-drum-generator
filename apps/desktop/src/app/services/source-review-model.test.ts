import { describe, expect, it } from "vitest";
import type { SourceInspectionResult } from "@chdg/project/browser";
import { MIDI_DRUM_NOTE_ATLAS_VERSION } from "@chdg/project/browser";
import {
	buildMappingReviewRowView,
	classifyMappingRow,
	createAnalysisCache,
	deriveDefaultMappingFilter,
	filterMappingReviewRows,
	hasStaleGpifTrackNoteCounts,
	mappingAttentionState,
	mappingReviewCounts,
	resolvePreviewAnalysisCache,
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
	it("rejects stale cached analysis before Preview source comparison", () => {
		const cache = createAnalysisCache({
			sourceFingerprint: {
				path: "/tmp/demo.mid",
				sizeBytes: 100,
				mtimeMs: 200,
			},
			mappingFingerprint: stableMappingFingerprint({}),
			selectedTracks: [3],
			inspection,
			normalizationPreview,
		});

		expect(
			resolvePreviewAnalysisCache({
				cache,
				sourceFingerprint: {
					path: "/tmp/demo.mid",
					sizeBytes: 101,
					mtimeMs: 200,
				},
				mappingFingerprint: stableMappingFingerprint({}),
				selectedTracks: [3],
			}),
		).toBeUndefined();
	});

	it("preserves a fresh Preview cache and rejects mapping-stale analysis", () => {
		const sourceFingerprint = {
			path: "/tmp/demo.mid",
			sizeBytes: 100,
			mtimeMs: 200,
		};
		const mappingFingerprint = stableMappingFingerprint({});
		const cache = createAnalysisCache({
			sourceFingerprint,
			mappingFingerprint,
			selectedTracks: [3],
			inspection,
			normalizationPreview,
		});

		expect(
			resolvePreviewAnalysisCache({
				cache,
				sourceFingerprint,
				mappingFingerprint,
				selectedTracks: [3],
			}),
		).toBe(cache);
		expect(
			resolvePreviewAnalysisCache({
				cache,
				sourceFingerprint,
				mappingFingerprint: "changed",
				selectedTracks: [3],
			}),
		).toBeUndefined();
	});

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

	it("stores normalized timing from the normalization result in the analysis cache", () => {
		const normalizedTiming = {
			resolution: 960,
			tempos: [
				{ tick: 0, bpm: 164 },
				{ tick: 184_320, bpm: 160 },
			],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [{ tick: 30_720, name: "Verse" }],
		};
		const cache = createAnalysisCache({
			sourceFingerprint: { path: "/tmp/demo.gp", sizeBytes: 1, mtimeMs: 2 },
			mappingFingerprint: "{}",
			selectedTracks: [3],
			inspection: {
				...inspection,
				sourceKind: "gpif",
				sourcePath: "/tmp/demo.gp",
			},
			normalizationPreview: {
				...normalizationPreview,
				sourceKind: "gpif",
				sourcePath: "/tmp/demo.gp",
				normalizedTiming,
			},
		});

		expect(cache.normalizedTiming).toEqual(normalizedTiming);
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

	describe("Phase 17M mapping review helpers", () => {
		const rows = [
			{
				key: "midi:36",
				sourceKind: "midi" as const,
				sourceValue: "36",
				label: "Bass Drum 1",
				action: "map" as const,
				automaticPiece: "kick" as const,
				count: 4,
				firstTick: 0,
			},
			{
				key: "midi:44",
				sourceKind: "midi" as const,
				sourceValue: "44",
				label: "Pedal Hi-Hat",
				action: "candidate" as const,
				suggestedPiece: "hihat_closed" as const,
				confidence: "medium" as const,
				reason: "Foot hi-hat can over-densify charts.",
				count: 2,
				firstTick: 480,
			},
			{
				key: "midi:54",
				sourceKind: "midi" as const,
				sourceValue: "54",
				label: "Tambourine",
				action: "ignore" as const,
				automaticPiece: "unknown" as const,
				count: 1,
			},
			{
				key: "midi:92",
				sourceKind: "midi" as const,
				sourceValue: "92",
				action: "unknown" as const,
				automaticPiece: "unknown" as const,
				count: 3,
			},
		];

		it("classifies rows with override precedence", () => {
			expect(classifyMappingRow(rows[0], {})).toBe("auto-mapped");
			expect(classifyMappingRow(rows[1], {})).toBe("candidate");
			expect(classifyMappingRow(rows[2], {})).toBe("ignored-known");
			expect(classifyMappingRow(rows[3], {})).toBe("unknown");
			expect(
				classifyMappingRow(rows[1], {
					"midi:44": {
						sourceKind: "midi",
						key: "midi:44",
						target: { kind: "piece", piece: "hihat_closed" },
					},
				}),
			).toBe("override");
		});

		it("filters needs-review to unresolved candidates and unknowns only", () => {
			expect(
				filterMappingReviewRows(rows, {}, "needs-review").map((row) => row.key),
			).toEqual(["midi:44", "midi:92"]);
			expect(
				filterMappingReviewRows(rows, {}, "ignored-known").map((row) => row.key),
			).toEqual(["midi:54"]);
			expect(
				filterMappingReviewRows(rows, {}, "auto-mapped").map((row) => row.key),
			).toEqual(["midi:36"]);
		});

		it("excludes override-resolved candidates and unknowns from needs-review", () => {
			const overrides = {
				"midi:44": {
					sourceKind: "midi" as const,
					key: "midi:44",
					target: { kind: "piece" as const, piece: "hihat_closed" as const },
				},
				"midi:92": {
					sourceKind: "midi" as const,
					key: "midi:92",
					target: { kind: "ignore" as const },
				},
			};
			expect(filterMappingReviewRows(rows, overrides, "needs-review")).toEqual([]);
			expect(
				filterMappingReviewRows(rows, overrides, "overrides").map((row) => row.key),
			).toEqual(["midi:44", "midi:92"]);
		});

		it("derives default filter from unresolved review state", () => {
			expect(deriveDefaultMappingFilter({ rows, overrides: {} })).toBe(
				"needs-review",
			);
			expect(
				deriveDefaultMappingFilter({
					rows: [rows[0], rows[2]],
					overrides: {},
				}),
			).toBe("all");
		});

		it("builds display labels for candidate suggestions and resettable overrides", () => {
			const candidate = buildMappingReviewRowView(rows[1], {});
			expect(candidate.badgeLabel).toBe("Candidate");
			expect(candidate.primaryLabel).toBe("MIDI 44 · Pedal Hi-Hat");
			expect(candidate.metaLabel).toBe("Candidate · 2 hits · first tick 480");
			expect(candidate.suggestedPieceLabel).toBe("Closed Hi-Hat");
			expect(candidate.unresolvedType).toBe("candidate");

			const override = buildMappingReviewRowView(rows[1], {
				"midi:44": {
					sourceKind: "midi",
					key: "midi:44",
					target: { kind: "piece", piece: "hihat_closed" },
				},
			});
			expect(override.badgeLabel).toBe("Mapped override");
			expect(override.primaryLabel).toBe("MIDI 44 · Pedal Hi-Hat");
			expect(override.hasOverride).toBe(true);
			expect(override.currentMappingLabel).toBe("Mapped to Closed Hi-Hat");
		});

		it("formats MIDI and GPIF labels without duplicated source text", () => {
			expect(
				buildMappingReviewRowView(
					{
						key: "midi:92",
						sourceKind: "midi",
						sourceValue: "92",
						action: "unknown",
						count: 1,
					},
					{},
				).primaryLabel,
			).toBe("MIDI 92 · Unknown");
			expect(
				buildMappingReviewRowView(
					{
						key: "gpif:midi 36",
						sourceKind: "gpif",
						sourceValue: "MIDI 36",
						label: "GPIF articulation (MIDI 36)",
						action: "map",
						automaticPiece: "kick",
						count: 218,
					},
					{},
				).primaryLabel,
			).toBe("GPIF articulation · MIDI 36");
		});
	});

});
