import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	inspectMidi: vi.fn(),
	inspectGpFile: vi.fn(),
}));

vi.mock("@chdg/midi", () => ({
	inspectMidi: mocks.inspectMidi,
}));

vi.mock("@chdg/guitarpro", () => ({
	inspectGpFile: mocks.inspectGpFile,
}));

import { inspectSource } from "./inspectSource.js";

describe("inspectSource", () => {
	it("returns structured MIDI inspection DTO", async () => {
		mocks.inspectMidi.mockResolvedValue({
			filePath: "demo.mid",
			resolution: 480,
			tracks: [{ index: 53, name: "Drums", channel: 9, noteCount: 10 }],
			strongDrumTracks: [53],
			weakDrumTracks: [],
			tempos: [{ tick: 0, bpm: 147 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [{ tick: 0, name: "Intro" }],
			unknownNotes: [31],
		});

		const result = await inspectSource({
			sourcePath: "demo.mid",
			trackIndex: 53,
		});

		expect(result.sourceKind).toBe("midi");
		expect(result.tracks[0]).toMatchObject({
			index: 53,
			role: "drums",
			strength: "strong",
		});
		expect(result.issues).toEqual([
			expect.objectContaining({
				code: "UNKNOWN_MIDI_NOTES",
				severity: "warning",
			}),
		]);
	});

	it("returns structured GPIF inspection DTO", async () => {
		mocks.inspectGpFile.mockResolvedValue({
			filePath: "demo.gp",
			tracks: [
				{
					index: 3,
					name: "Drums",
					channel: 10,
					isDrumCandidate: true,
					drumCandidateReasons: [
						"name/instrument indicates drums or percussion",
					],
				},
			],
			tempos: [{ tick: 0, bpm: 147 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [{ tick: 0, name: "Verse" }],
			warnings: ["Synthetic warning"],
			unhandled: ["Synthetic unhandled"],
		});

		const result = await inspectSource({ sourcePath: "demo.gp" });

		expect(result.sourceKind).toBe("gpif");
		expect(result.tracks[0]).toMatchObject({
			index: 3,
			role: "drums",
			strength: "strong",
		});
		expect(result.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ code: "GPIF_WARNING" }),
				expect.objectContaining({ code: "GPIF_UNHANDLED" }),
			]),
		);
	});
});
