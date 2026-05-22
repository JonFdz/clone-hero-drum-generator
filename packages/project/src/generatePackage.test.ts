import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

import { generatePackage } from "./generatePackage.js";

describe("generatePackage", () => {
	let tempDir: string;

	beforeEach(async () => {
		tempDir = await mkdtemp(join(tmpdir(), "chdg-project-generate-"));
		vi.clearAllMocks();
	});

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true });
	});

	it("generates chart package DTO for MIDI", async () => {
		const outDir = join(tempDir, "output");
		mocks.normalizeDrumsFromFile.mockResolvedValue({
			track: { index: 53, name: "Drums" },
			resolution: 480,
			tempos: [{ tick: 0, bpm: 120 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [{ tick: 0, name: "Intro" }],
			hits: [
				{
					tick: 0,
					piece: "kick",
					velocity: 100,
					durationTicks: 0,
					source: {
						midiNote: 36,
						trackIndex: 53,
						trackName: "Drums",
						channel: 9,
					},
				},
			],
			unknownNotes: [],
		});

		const result = await generatePackage({
			sourcePath: "demo.mid",
			trackIndex: 53,
			outDir,
			name: "Demo",
			artist: "Artist",
		});

		expect(result).toMatchObject({
			sourceKind: "midi",
			selectedTrack: 53,
			selectedTracks: [53],
			outputDir: outDir,
			hitCount: 1,
		});
		await expect(stat(join(outDir, "notes.chart"))).resolves.toMatchObject({});
		await expect(stat(join(outDir, "song.ini"))).resolves.toMatchObject({});
		expect(await readFile(join(outDir, "song.ini"), "utf8")).toContain(
			"name = Demo",
		);
	});

	it("generates GPIF multi-track package from merged hits", async () => {
		const outDir = join(tempDir, "gp-multi-output");
		mocks.normalizeGpDrums
			.mockResolvedValueOnce({
				trackIndex: 3,
				trackName: "Drums",
				resolution: 960,
				tempos: [{ tick: 0, bpm: 120 }],
				timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
				sections: [],
				hits: [
					{
						tick: 0,
						piece: "kick",
						velocity: 80,
						durationTicks: 0,
						source: { kind: "gpif", trackIndex: 3 },
					},
				],
				warnings: [],
				unhandled: [],
				unknownArticulations: [],
			})
			.mockResolvedValueOnce({
				trackIndex: 10,
				trackName: "Percussion",
				resolution: 960,
				tempos: [{ tick: 0, bpm: 120 }],
				timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
				sections: [],
				hits: [
					{
						tick: 0,
						piece: "kick",
						velocity: 110,
						durationTicks: 0,
						source: { kind: "gpif", trackIndex: 10 },
					},
					{
						tick: 120,
						piece: "snare",
						velocity: 100,
						durationTicks: 0,
						source: { kind: "gpif", trackIndex: 10 },
					},
				],
				warnings: [],
				unhandled: [],
				unknownArticulations: [],
			});

		const result = await generatePackage({
			sourcePath: "demo.gp",
			trackIndexes: [3, 10],
			outDir,
		});

		expect(mocks.normalizeGpDrums).toHaveBeenNthCalledWith(1, "demo.gp", {
			trackIndex: 3,
		});
		expect(mocks.normalizeGpDrums).toHaveBeenNthCalledWith(2, "demo.gp", {
			trackIndex: 10,
		});
		expect(result.selectedTracks).toEqual([3, 10]);
		expect(result.hitCount).toBe(2);
		expect(result.mergeSummary?.duplicateHitCount).toBe(1);
		await expect(stat(join(outDir, "notes.chart"))).resolves.toMatchObject({});
	});

	it("requires --track for GPIF generation", async () => {
		await expect(
			generatePackage({
				sourcePath: "demo.gp",
				outDir: join(tempDir, "gp-output"),
			}),
		).rejects.toThrow(/missing required --track/i);
	});

	it("applies ignore override during generation", async () => {
		const outDir = join(tempDir, "output-ignore");
		mocks.normalizeDrumsFromFile.mockResolvedValue({
			track: { index: 53, name: "Drums" },
			resolution: 480,
			tempos: [{ tick: 0, bpm: 120 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [{ tick: 0, name: "Intro" }],
			hits: [
				{
					tick: 0,
					piece: "snare",
					velocity: 100,
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

		const result = await generatePackage({
			sourcePath: "demo.mid",
			trackIndex: 53,
			outDir,
			mappingOverrides: {
				"midi:37": {
					sourceKind: "midi",
					key: "midi:37",
					target: { kind: "ignore" },
				},
			},
		});

		expect(result.hitCount).toBe(0);
		expect(result.mappedNoteCount).toBe(0);
	});

	it("does not report unknown midi note as skipped when piece override exists", async () => {
		const outDir = join(tempDir, "output-midi-warning");
		mocks.normalizeDrumsFromFile.mockResolvedValue({
			track: { index: 53, name: "Drums" },
			resolution: 480,
			tempos: [{ tick: 0, bpm: 120 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [{ tick: 0, name: "Intro" }],
			hits: [
				{
					tick: 0,
					piece: "unknown",
					velocity: 100,
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
		const result = await generatePackage({
			sourcePath: "demo.mid",
			trackIndex: 53,
			outDir,
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

	it("does not report unknown gpif articulation when piece override exists", async () => {
		const outDir = join(tempDir, "output-gpif-warning");
		mocks.normalizeGpDrums.mockResolvedValue({
			trackIndex: 3,
			trackName: "Drums",
			resolution: 960,
			tempos: [{ tick: 0, bpm: 120 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [],
			hits: [
				{
					tick: 0,
					piece: "unknown",
					velocity: 90,
					durationTicks: 0,
					source: { kind: "gpif", trackIndex: 3, rawArticulation: "Mystery" },
				},
			],
			warnings: [],
			unhandled: [],
			unknownArticulations: [{ rawArticulation: "Mystery", count: 1 }],
		});
		const result = await generatePackage({
			sourcePath: "demo.gp",
			trackIndex: 3,
			outDir,
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
});
