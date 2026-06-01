import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	normalizeDrumsFromFile: vi.fn(),
	normalizeGpDrums: vi.fn(),
}));

vi.mock("@chdg/midi", () => ({
	normalizeDrumsFromFile: mocks.normalizeDrumsFromFile,
}));

vi.mock("@chdg/guitarpro", () => ({
	normalizeGpDrums: mocks.normalizeGpDrums,
}));

import type { DrumHit } from "@chdg/core";
import { mergeDrumHits } from "./mergeDrumHits.js";
import { normalizeSelection } from "./normalizeSelection.js";

describe("normalizeSelection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns MIDI normalization preview DTO", async () => {
		mocks.normalizeDrumsFromFile.mockResolvedValue({
			track: { index: 53 },
			hits: [
				{
					tick: 0,
					piece: "kick",
					velocity: 96,
					durationTicks: 0,
					source: {
						midiNote: 36,
						trackIndex: 53,
						trackName: "Drums",
						channel: 9,
					},
				},
			],
			unknownNotes: [31],
		});

		const result = await normalizeSelection({
			sourcePath: "demo.mid",
			trackIndex: 53,
		});

		expect(result).toMatchObject({
			sourceKind: "midi",
			selectedTrack: 53,
			selectedTracks: [53],
			hitCount: 1,
			pieceSummary: { kick: 1 },
		});
		expect(result.issues).toEqual([
			expect.objectContaining({
				code: "UNKNOWN_MIDI_NOTES",
				severity: "warning",
			}),
		]);
	});

	it("applies mapping override during normalization preview", async () => {
		mocks.normalizeDrumsFromFile.mockResolvedValue({
			track: { index: 53 },
			hits: [
				{
					tick: 0,
					piece: "kick",
					velocity: 96,
					durationTicks: 0,
					source: {
						midiNote: 37,
						trackIndex: 53,
						trackName: "Drums",
						channel: 9,
					},
				},
			],
			unknownNotes: [],
		});

		const result = await normalizeSelection({
			sourcePath: "demo.mid",
			trackIndex: 53,
			mappingOverrides: {
				"midi:37": {
					sourceKind: "midi",
					key: "midi:37",
					target: { kind: "piece", piece: "snare" },
				},
			},
		});

		expect(result.pieceSummary).toEqual({ snare: 1 });
		expect(result.mappingCandidates).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: "midi:37",
					automaticPiece: "kick",
				}),
			]),
		);
	});

	it("includes mapping candidates from all normalized hits, not only firstHits", async () => {
		mocks.normalizeDrumsFromFile.mockResolvedValue({
			track: { index: 53 },
			hits: Array.from({ length: 12 }, (_, index) => ({
				tick: index * 10,
				piece: "unknown",
				velocity: 90,
				durationTicks: 0,
				source: {
					midiNote: 60 + index,
					trackIndex: 53,
					trackName: "Drums",
					channel: 9,
				},
			})),
			unknownNotes: [60, 61],
		});
		const result = await normalizeSelection({
			sourcePath: "demo.mid",
			trackIndex: 53,
		});
		expect(result.firstHits).toHaveLength(10);
		expect(result.mappingCandidates).toHaveLength(12);
		expect(result.mappingCandidates.find((candidate) => candidate.key === "midi:71")).toBeTruthy();
	});

	it("filters unknown midi warning when note is mapped by override", async () => {
		mocks.normalizeDrumsFromFile.mockResolvedValue({
			track: { index: 53 },
			hits: [
				{
					tick: 0,
					piece: "unknown",
					velocity: 90,
					durationTicks: 0,
					source: {
						midiNote: 39,
						trackIndex: 53,
						trackName: "Drums",
						channel: 9,
					},
				},
			],
			unknownNotes: [39],
		});
		const result = await normalizeSelection({
			sourcePath: "demo.mid",
			trackIndex: 53,
			mappingOverrides: {
				"midi:39": {
					sourceKind: "midi",
					key: "midi:39",
					target: { kind: "piece", piece: "snare" },
				},
			},
		});
		expect(result.issues.find((issue) => issue.code === "UNKNOWN_MIDI_NOTES")).toBeUndefined();
	});

	it("returns GPIF normalization preview DTO", async () => {
		mocks.normalizeGpDrums.mockResolvedValue({
			trackIndex: 3,
			hits: [
				{
					tick: 120,
					piece: "snare",
					velocity: 100,
					durationTicks: 0,
					source: { kind: "gpif", trackIndex: 3, rawArticulation: "Snare" },
				},
			],
			warnings: ["Synthetic warning"],
			unhandled: ["Synthetic unhandled"],
			unknownArticulations: [{ rawArticulation: "Mystery", count: 2 }],
		});

		const result = await normalizeSelection({
			sourcePath: "demo.gp",
			trackIndex: 3,
		});

		expect(result).toMatchObject({
			sourceKind: "gpif",
			selectedTrack: 3,
			selectedTracks: [3],
			hitCount: 1,
			pieceSummary: { snare: 1 },
		});
		expect(result.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ code: "GPIF_WARNING" }),
				expect.objectContaining({ code: "GPIF_UNHANDLED" }),
				expect.objectContaining({ code: "UNKNOWN_GPIF_ARTICULATION" }),
			]),
		);
	});

	it("filters unknown GPIF articulation warning when mapped by override", async () => {
		mocks.normalizeGpDrums.mockResolvedValue({
			trackIndex: 3,
			hits: [
				{
					tick: 120,
					piece: "unknown",
					velocity: 100,
					durationTicks: 0,
					source: { kind: "gpif", trackIndex: 3, rawArticulation: "Mystery" },
				},
			],
			warnings: [],
			unhandled: [],
			unknownArticulations: [{ rawArticulation: "Mystery", count: 2 }],
		});

		const result = await normalizeSelection({
			sourcePath: "demo.gp",
			trackIndex: 3,
			mappingOverrides: {
				"gpif:mystery": {
					sourceKind: "gpif",
					key: "gpif:mystery",
					target: { kind: "piece", piece: "snare" },
				},
			},
		});

		expect(
			result.issues.find((issue) => issue.code === "UNKNOWN_GPIF_ARTICULATION"),
		).toBeUndefined();
	});

	it("derives GPIF mapping coverage event counts from mapping candidates", async () => {
		mocks.normalizeGpDrums.mockResolvedValue({
			trackIndex: 3,
			hits: [
				gpifHit({
					tick: 0,
					piece: "kick",
					trackIndex: 3,
					rawArticulation: "Kick",
					articulationKey: "gpif:3:kick:no-output:no-input",
				}),
				gpifHit({
					tick: 120,
					piece: "kick",
					trackIndex: 3,
					rawArticulation: "Kick",
					articulationKey: "gpif:3:kick:no-output:no-input",
				}),
			],
			warnings: [],
			unhandled: [],
			unknownArticulations: [{ key: "gpif:3:mystery-effect:no-output:no-input", rawArticulation: "Mystery Effect", count: 1 }],
			mappingSources: [
				{
					key: "gpif:3:kick:no-output:no-input",
					sourceKind: "gpif",
					sourceValue: "Kick",
					action: "map",
					automaticPiece: "kick",
					confidence: "high",
					count: 2,
					firstTick: 0,
				},
				{
					key: "gpif:3:pedal-hi-hat:44:no-input",
					sourceKind: "gpif",
					sourceValue: "Pedal Hi-Hat",
					action: "candidate",
					suggestedPiece: "hihat_closed",
					confidence: "medium",
					count: 1,
					firstTick: 240,
				},
				{
					key: "gpif:3:tambourine:54:no-input",
					sourceKind: "gpif",
					sourceValue: "Tambourine",
					action: "ignore",
					confidence: "high",
					count: 1,
					firstTick: 360,
				},
				{
					key: "gpif:3:mystery-effect:no-output:no-input",
					sourceKind: "gpif",
					sourceValue: "Mystery Effect",
					action: "unknown",
					automaticPiece: "unknown",
					confidence: "low",
					count: 1,
					firstTick: 480,
				},
			],
		});

		const result = await normalizeSelection({
			sourcePath: "demo.gp",
			trackIndex: 3,
		});

		expect(result.mappingCoverage).toMatchObject({
			totalEventCount: 5,
			mappedEventCount: 2,
			candidateEventCount: 1,
			ignoredEventCount: 1,
			unknownEventCount: 1,
			mappedSourceCount: 1,
			candidateSourceCount: 1,
			ignoredSourceCount: 1,
			unknownSourceCount: 1,
		});
	});

	it("returns merged MIDI preview for multiple tracks", async () => {
		mocks.normalizeDrumsFromFile
			.mockResolvedValueOnce({
				track: { index: 3 },
				hits: [midiHit({ tick: 0, piece: "kick", velocity: 80, trackIndex: 3 })],
				unknownNotes: [],
			})
			.mockResolvedValueOnce({
				track: { index: 10 },
				hits: [midiHit({ tick: 0, piece: "kick", velocity: 110, trackIndex: 10 })],
				unknownNotes: [],
			});

		const result = await normalizeSelection({
			sourcePath: "demo.mid",
			trackIndexes: [3, 10],
		});

		expect(mocks.normalizeDrumsFromFile).toHaveBeenNthCalledWith(
			1,
			"demo.mid",
			expect.any(Object),
			{ trackIndex: 3 },
		);
		expect(mocks.normalizeDrumsFromFile).toHaveBeenNthCalledWith(
			2,
			"demo.mid",
			expect.any(Object),
			{ trackIndex: 10 },
		);
		expect(result.selectedTracks).toEqual([3, 10]);
		expect(result.hitCount).toBe(1);
		expect(result.firstHits[0].velocity).toBe(110);
		expect(result.mergeSummary?.duplicateHitCount).toBe(1);
	});

	it("returns merged GPIF preview for multiple tracks", async () => {
		mocks.normalizeGpDrums
			.mockResolvedValueOnce({
				trackIndex: 3,
				hits: [gpifHit({ tick: 120, piece: "snare", trackIndex: 3 })],
				warnings: [],
				unhandled: [],
				unknownArticulations: [],
			})
			.mockResolvedValueOnce({
				trackIndex: 10,
				hits: [gpifHit({ tick: 120, piece: "crash", trackIndex: 10 })],
				warnings: [],
				unhandled: [],
				unknownArticulations: [],
			});

		const result = await normalizeSelection({
			sourcePath: "demo.gp",
			trackIndexes: [3, 10],
		});

		expect(result.selectedTracks).toEqual([3, 10]);
		expect(result.hitCount).toBe(2);
		expect(result.mergeSummary?.inputHitCount).toBe(2);
	});
});

describe("mergeDrumHits", () => {
	it("deduplicates same tick and piece using highest velocity", () => {
		const result = mergeDrumHits(
			[
				midiHit({ tick: 960, piece: "kick", velocity: 80, trackIndex: 3 }),
				midiHit({ tick: 960, piece: "kick", velocity: 110, trackIndex: 10 }),
			],
			[3, 10],
		);

		expect(result.hits).toHaveLength(1);
		expect(result.hits[0].tick).toBe(960);
		expect(result.hits[0].velocity).toBe(110);
		expect(result.summary.duplicateHitCount).toBe(1);
	});

	it("keeps different ticks without averaging timing", () => {
		const result = mergeDrumHits(
			[
				midiHit({ tick: 960, piece: "kick", trackIndex: 3 }),
				midiHit({ tick: 970, piece: "kick", trackIndex: 10 }),
			],
			[3, 10],
		);

		expect(result.hits.map((hit) => hit.tick)).toEqual([960, 970]);
		expect(result.summary.duplicateHitCount).toBe(0);
	});

	it("prefers open hi-hat over closed hi-hat at the same tick", () => {
		const result = mergeDrumHits(
			[
				midiHit({ tick: 1000, piece: "hihat_closed", trackIndex: 3 }),
				midiHit({ tick: 1000, piece: "hihat_open", trackIndex: 10 }),
			],
			[3, 10],
		);

		expect(result.hits.map((hit) => hit.piece)).toEqual(["hihat_open"]);
		expect(result.summary.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ code: "HIHAT_OPEN_CLOSED_CONFLICT" }),
			]),
		);
	});

	it("warns on impossible hand chords without deleting notes", () => {
		const result = mergeDrumHits(
			[
				midiHit({ tick: 1440, piece: "snare", trackIndex: 3 }),
				midiHit({ tick: 1440, piece: "crash", trackIndex: 3 }),
				midiHit({ tick: 1440, piece: "tom_mid", trackIndex: 10 }),
			],
			[3, 10],
		);

		expect(result.hits).toHaveLength(3);
		expect(result.summary.impossibleChordCount).toBe(1);
		expect(result.summary.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ code: "IMPOSSIBLE_HAND_CHORD" }),
			]),
		);
	});
});

function midiHit(input: {
	tick: number;
	piece: DrumHit["piece"];
	velocity?: number;
	trackIndex: number;
}): DrumHit {
	return {
		tick: input.tick,
		piece: input.piece,
		velocity: input.velocity ?? 100,
		durationTicks: 0,
		source: {
			midiNote: 36,
			trackIndex: input.trackIndex,
			trackName: `Track ${input.trackIndex}`,
			channel: 9,
		},
	};
}

function gpifHit(input: {
	tick: number;
	piece: DrumHit["piece"];
	trackIndex: number;
	rawArticulation?: string;
	articulationKey?: string;
}): DrumHit {
	return {
		tick: input.tick,
		piece: input.piece,
		velocity: 100,
		durationTicks: 0,
		source: {
			kind: "gpif",
			trackIndex: input.trackIndex,
			articulationKey: input.articulationKey,
			rawArticulation: input.rawArticulation,
		},
	};
}
