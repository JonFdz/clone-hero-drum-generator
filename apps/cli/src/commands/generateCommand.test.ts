import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	normalizeDrumsFromFile: vi.fn(),
	normalizeGpDrums: vi.fn(),
	prepareAudio: vi.fn(),
}));

vi.mock("@chdg/midi", () => ({
	normalizeDrumsFromFile: mocks.normalizeDrumsFromFile,
}));

vi.mock("@chdg/guitarpro", () => ({
	normalizeGpDrums: mocks.normalizeGpDrums,
}));

vi.mock("@chdg/audio", () => ({
	prepareAudio: mocks.prepareAudio,
}));

import {
	detectGenerateSourceKind,
	runGenerateCommand,
} from "./generateCommand.js";

describe("detectGenerateSourceKind", () => {
	it("dispatches supported source extensions deterministically", () => {
		expect(detectGenerateSourceKind("song.mid")).toBe("midi");
		expect(detectGenerateSourceKind("song.MIDI")).toBe("midi");
		expect(detectGenerateSourceKind("song.gp")).toBe("gpif");
	});

	it("fails clearly for unsupported source extensions", () => {
		expect(() => detectGenerateSourceKind("song.txt")).toThrow(
			/unsupported source type/i,
		);
	});
});

describe("runGenerateCommand", () => {
	let tempDir: string;
	let logSpy: ReturnType<typeof vi.spyOn>;
	let warnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(async () => {
		tempDir = await mkdtemp(join(tmpdir(), "chdg-generate-"));
		vi.clearAllMocks();
		logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
		mocks.prepareAudio.mockImplementation(
			async ({ outputDir, outputFileName = "song.ogg" }) => {
				await writeFile(join(outputDir, outputFileName), "synthetic ogg");
				return {
					sourcePath: "source.mp3",
					outputPath: join(outputDir, outputFileName),
					outputFileName,
					action: "converted",
				};
			},
		);
	});

	afterEach(async () => {
		logSpy.mockRestore();
		warnSpy.mockRestore();
		await rm(tempDir, { recursive: true, force: true });
	});

	it("generates notes.chart, song.ini, and song.ogg from a GPIF source", async () => {
		const outDir = join(tempDir, "gp-output");
		mocks.normalizeGpDrums.mockResolvedValue({
			filePath: "song.gp",
			trackIndex: 3,
			trackName: "Drums",
			resolution: 960,
			tempos: [{ tick: 0, bpm: 147 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [],
			hits: [
				{
					tick: 0,
					piece: "kick",
					velocity: 95,
					durationTicks: 0,
					source: { kind: "gpif", trackIndex: 3 },
				},
				{
					tick: 960,
					piece: "hihat_open",
					velocity: 95,
					durationTicks: 0,
					source: { kind: "gpif", trackIndex: 3 },
				},
				{
					tick: 1920,
					piece: "crash",
					velocity: 115,
					durationTicks: 0,
					source: { kind: "gpif", trackIndex: 3 },
				},
			],
			warnings: ["Synthetic warning"],
			unhandled: [],
			unknownArticulations: [{ rawArticulation: "Mystery Splash", count: 2 }],
		});

		await runGenerateCommand([
			"song.gp",
			"--track",
			"3",
			"--audio-source",
			"song.mp3",
			"--out",
			outDir,
		]);

		expect(mocks.normalizeGpDrums).toHaveBeenCalledWith("song.gp", {
			trackIndex: 3,
		});
		expect(mocks.normalizeDrumsFromFile).not.toHaveBeenCalled();
		expect(await readFile(join(outDir, "song.ini"), "utf8")).toContain(
			"song = song.ogg",
		);
		const chart = await readFile(join(outDir, "notes.chart"), "utf8");
		expect(chart).toContain("[ExpertDrums]");
		expect(chart).toContain("  960 = N 66 0");
		expect(chart).toContain("  960 = N 35 0");
		expect(chart).toContain("  1920 = N 68 0");
		await expect(stat(join(outDir, "song.ogg"))).resolves.toMatchObject({});
		expect(warnSpy).toHaveBeenCalledWith("Warning: Synthetic warning");
		expect(logSpy).toHaveBeenCalledWith(
			"GPIF Unknown Articulations: Mystery Splash (2)",
		);
	});

	it("preserves MIDI generation dispatch", async () => {
		const outDir = join(tempDir, "midi-output");
		mocks.normalizeDrumsFromFile.mockResolvedValue({
			track: { index: 53, name: "MIDI Drums" },
			resolution: 480,
			tempos: [{ tick: 0, bpm: 120 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [{ tick: 0, name: "Intro" }],
			hits: [
				{
					tick: 0,
					piece: "snare",
					velocity: 95,
					durationTicks: 0,
					source: {
						midiNote: 38,
						trackIndex: 53,
						trackName: "MIDI Drums",
						channel: 9,
					},
				},
			],
			unknownNotes: [31],
		});

		await runGenerateCommand(["song.mid", "--track", "53", "--out", outDir]);

		expect(mocks.normalizeDrumsFromFile).toHaveBeenCalledOnce();
		expect(mocks.normalizeGpDrums).not.toHaveBeenCalled();
		expect(await readFile(join(outDir, "notes.chart"), "utf8")).toContain(
			"section Intro",
		);
		expect(warnSpy).toHaveBeenCalledWith(
			"Warning: Unknown MIDI notes skipped: 31",
		);
	});

	it("does not write output for unsupported source types", async () => {
		const outDir = join(tempDir, "txt-output");

		await expect(
			runGenerateCommand(["song.txt", "--track", "3", "--out", outDir]),
		).rejects.toThrow(/unsupported source type/i);

		expect(mocks.normalizeGpDrums).not.toHaveBeenCalled();
		expect(mocks.normalizeDrumsFromFile).not.toHaveBeenCalled();
		await expect(stat(outDir)).rejects.toMatchObject({ code: "ENOENT" });
	});

	it("does not write output when GPIF track validation fails", async () => {
		const outDir = join(tempDir, "invalid-track-output");
		mocks.normalizeGpDrums.mockRejectedValue(
			new Error("Invalid GPIF track index 99. Available track indexes: 0, 1."),
		);

		await expect(
			runGenerateCommand(["song.gp", "--track", "99", "--out", outDir]),
		).rejects.toThrow(/invalid gpif track index/i);

		await expect(stat(outDir)).rejects.toMatchObject({ code: "ENOENT" });
	});
});
