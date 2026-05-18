import { describe, expect, it, vi } from "vitest";

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

import { normalizeSelection } from "./normalizeSelection.js";

describe("normalizeSelection", () => {
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
});
