import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
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
			timing: {
				hasAccurateTiming: true,
				summary: {
					label: "Timing: OK",
					warningCount: 0,
				},
			},
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

		expect(mocks.normalizeGpDrums).toHaveBeenNthCalledWith(
			1,
			"demo.gp",
			expect.objectContaining({ trackIndex: 3 }),
		);
		expect(mocks.normalizeGpDrums).toHaveBeenNthCalledWith(
			2,
			"demo.gp",
			expect.objectContaining({ trackIndex: 10 }),
		);
		expect(result.selectedTracks).toEqual([3, 10]);
		expect(result.hitCount).toBe(2);
		expect(result.mergeSummary?.duplicateHitCount).toBe(1);
		await expect(stat(join(outDir, "notes.chart"))).resolves.toMatchObject({});
	});

	it("writes all GPIF tempo map events into generated notes.chart", async () => {
		const outDir = join(tempDir, "gp-tempo-output");
		mocks.normalizeGpDrums.mockResolvedValue({
			trackIndex: 3,
			trackName: "Drums",
			resolution: 960,
			tempos: [
				{ tick: 0, bpm: 164 },
				{ tick: 184_320, bpm: 160 },
			],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [
				{ tick: 0, name: "Intro" },
				{ tick: 30_720, name: "Verse 1" },
				{ tick: 184_320, name: "Break" },
				{ tick: 353_280, name: "Solo" },
				{ tick: 414_720, name: "Bridge" },
			],
			hits: [],
			warnings: [],
			unhandled: [],
			unknownArticulations: [],
		});

		await generatePackage({
			sourcePath: "decode-like.gp",
			trackIndex: 3,
			outDir,
		});

		const chart = await readFile(join(outDir, "notes.chart"), "utf8");
		expect(chart).toContain("0 = B 164000");
		expect(chart).toContain("184320 = B 160000");
		expect(chart).toContain(`0 = E "section Intro"`);
		expect(chart).toContain(`30720 = E "section Verse 1"`);
		expect(chart).toContain(`184320 = E "section Break"`);
		expect(chart).toContain(`353280 = E "section Solo"`);
		expect(chart).toContain(`414720 = E "section Bridge"`);
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

	it("passes GPIF mapping overrides so candidate overrides can create generated hits", async () => {
		const outDir = join(tempDir, "output-gpif-candidate-override");
		const key = "gpif:3:pedal-hi-hat:44:no-input";
		mocks.normalizeGpDrums.mockImplementation(async (_sourcePath, options) => ({
			trackIndex: 3,
			trackName: "Drums",
			resolution: 960,
			tempos: [{ tick: 0, bpm: 120 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [],
			hits:
				options.mappingOverrides?.[key]?.target.kind === "piece"
					? [
							{
								tick: 0,
								piece: "hihat_closed",
								velocity: 90,
								durationTicks: 0,
								source: {
									kind: "gpif",
									trackIndex: 3,
									articulationKey: key,
									rawArticulation: "Pedal Hi-Hat",
								},
							},
						]
					: [],
			warnings: [],
			unhandled: [],
			unknownArticulations: [],
			mappingSources: [],
		}));

		const result = await generatePackage({
			sourcePath: "demo.gp",
			trackIndex: 3,
			outDir,
			mappingOverrides: {
				[key]: {
					sourceKind: "gpif",
					key,
					target: { kind: "piece", piece: "hihat_closed" },
				},
			},
		});

		expect(mocks.normalizeGpDrums).toHaveBeenCalledWith("demo.gp", {
			trackIndex: 3,
			mappingOverrides: {
				[key]: {
					sourceKind: "gpif",
					key,
					target: { kind: "piece", piece: "hihat_closed" },
				},
			},
		});
		expect(result.hitCount).toBe(1);
		expect(result.mappedNoteCount).toBe(1);
	});

	it("passes GPIF ignore overrides so mapped articulations can be skipped during generation", async () => {
		const outDir = join(tempDir, "output-gpif-ignore-override");
		const key = "gpif:3:kick:no-output:no-input";
		mocks.normalizeGpDrums.mockImplementation(async (_sourcePath, options) => ({
			trackIndex: 3,
			trackName: "Drums",
			resolution: 960,
			tempos: [{ tick: 0, bpm: 120 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [],
			hits:
				options.mappingOverrides?.[key]?.target.kind === "ignore"
					? []
					: [
							{
								tick: 0,
								piece: "kick",
								velocity: 90,
								durationTicks: 0,
								source: {
									kind: "gpif",
									trackIndex: 3,
									articulationKey: key,
									rawArticulation: "Kick",
								},
							},
						],
			warnings: [],
			unhandled: [],
			unknownArticulations: [],
			mappingSources: [],
		}));

		const result = await generatePackage({
			sourcePath: "demo.gp",
			trackIndex: 3,
			outDir,
			mappingOverrides: {
				[key]: {
					sourceKind: "gpif",
					key,
					target: { kind: "ignore" },
				},
			},
		});

		expect(result.hitCount).toBe(0);
		expect(result.mappedNoteCount).toBe(0);
	});

	it("suppresses unknown GPIF warnings when an ignore override exists for the stable key", async () => {
		const outDir = join(tempDir, "output-gpif-unknown-ignore");
		const key = "gpif:3:mystery-effect:no-output:no-input";
		mocks.normalizeGpDrums.mockResolvedValue({
			trackIndex: 3,
			trackName: "Drums",
			resolution: 960,
			tempos: [{ tick: 0, bpm: 120 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [],
			hits: [],
			warnings: [],
			unhandled: [],
			unknownArticulations: [{ key, rawArticulation: "Mystery Effect", count: 1 }],
			mappingSources: [],
		});

		const result = await generatePackage({
			sourcePath: "demo.gp",
			trackIndex: 3,
			outDir,
			mappingOverrides: {
				[key]: {
					sourceKind: "gpif",
					key,
					target: { kind: "ignore" },
				},
			},
		});

		expect(
			result.issues.find((issue) => issue.code === "UNKNOWN_GPIF_ARTICULATION"),
		).toBeUndefined();
	});
	it("copies JPG project cover to album.jpg during generation", async () => {
		const outDir = join(tempDir, "output-cover");
		const coverPath = join(tempDir, "cover.jpeg");
		await writeFile(coverPath, "jpeg-data", "utf8");
		mocks.normalizeDrumsFromFile.mockResolvedValue({
			track: { index: 53, name: "Drums" },
			resolution: 480,
			tempos: [{ tick: 0, bpm: 120 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [],
			hits: [],
			unknownNotes: [],
		});

		const result = await generatePackage({
			sourcePath: "demo.mid",
			trackIndex: 53,
			outDir,
			coverImagePath: coverPath,
		});

		expect(result.files.albumJpg).toBe(join(outDir, "album.jpg"));
		expect(await readFile(join(outDir, "album.jpg"), "utf8")).toBe("jpeg-data");
		expect(result.issues.find((issue) => issue.code.startsWith("COVER_OUTPUT"))).toBeUndefined();
	});

	it("keeps generation successful and warns when cover format is unsupported", async () => {
		const outDir = join(tempDir, "output-cover-warning");
		const coverPath = join(tempDir, "cover.png");
		await writeFile(coverPath, "png-data", "utf8");
		mocks.normalizeDrumsFromFile.mockResolvedValue({
			track: { index: 53, name: "Drums" },
			resolution: 480,
			tempos: [{ tick: 0, bpm: 120 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [],
			hits: [],
			unknownNotes: [],
		});

		const result = await generatePackage({
			sourcePath: "demo.mid",
			trackIndex: 53,
			outDir,
			coverImagePath: coverPath,
		});

		await expect(stat(join(outDir, "notes.chart"))).resolves.toMatchObject({});
		expect(result.files.albumJpg).toBeUndefined();
		expect(result.issues).toContainEqual(
			expect.objectContaining({
				severity: "warning",
				code: "COVER_OUTPUT_UNSUPPORTED_FORMAT",
			}),
		);
	});

});
