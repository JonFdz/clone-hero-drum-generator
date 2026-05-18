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
			outputDir: outDir,
			hitCount: 1,
		});
		await expect(stat(join(outDir, "notes.chart"))).resolves.toMatchObject({});
		await expect(stat(join(outDir, "song.ini"))).resolves.toMatchObject({});
		expect(await readFile(join(outDir, "song.ini"), "utf8")).toContain(
			"name = Demo",
		);
	});

	it("requires --track for GPIF generation", async () => {
		await expect(
			generatePackage({
				sourcePath: "demo.gp",
				outDir: join(tempDir, "gp-output"),
			}),
		).rejects.toThrow(/missing required --track/i);
	});
});
