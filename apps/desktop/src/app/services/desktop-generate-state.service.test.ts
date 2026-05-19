import { describe, expect, it } from "vitest";
import type { DesktopGenerateState } from "./desktop-generate-state.service";
import {
	chooseDefaultTracks,
	detectDesktopSourceKind,
	validateGenerateState,
} from "./desktop-generate-model";

function state(
	overrides: Partial<DesktopGenerateState> = {},
): DesktopGenerateState {
	return {
		metadata: {},
		selectedTracks: [],
		issues: [],
		logs: [],
		status: "idle",
		...overrides,
	};
}

describe("desktop generate state helpers", () => {
	it("detects supported source types", () => {
		expect(detectDesktopSourceKind("song.mid")).toBe("midi");
		expect(detectDesktopSourceKind("song.MIDI")).toBe("midi");
		expect(detectDesktopSourceKind("song.gp")).toBe("gpif");
		expect(detectDesktopSourceKind("song.gp5")).toBeUndefined();
	});

	it("blocks generation without required audio", () => {
		const result = validateGenerateState(
			state({
				sourcePath: "demo.mid",
				outputDir: "/tmp/out",
				selectedTracks: [1],
			}),
		);

		expect(result.ok).toBe(false);
		expect(result.errors).toContain(
			"Audio file is required for Desktop Generate MVP.",
		);
	});

	it("blocks generation without source or output", () => {
		const result = validateGenerateState(
			state({ audioPath: "demo.mp3", selectedTracks: [1] }),
		);

		expect(result.ok).toBe(false);
		expect(result.errors).toContain("Source file is required.");
		expect(result.errors).toContain("Output folder is required.");
	});

	it("supports single and multiple selected tracks", () => {
		expect(
			validateGenerateState(
				state({
					sourcePath: "demo.gp",
					audioPath: "demo.wav",
					outputDir: "/tmp/out",
					selectedTracks: [3],
				}),
			).ok,
		).toBe(true);
		expect(
			validateGenerateState(
				state({
					sourcePath: "demo.gp",
					audioPath: "demo.wav",
					outputDir: "/tmp/out",
					selectedTracks: [3, 10],
				}),
			).ok,
		).toBe(true);
	});

	it("chooses the first strong drum candidate by default", () => {
		expect(
			chooseDefaultTracks([
				{ index: 1, noteCount: 0, strength: "unknown", role: "unknown" },
				{ index: 3, noteCount: 10, strength: "strong", role: "drums" },
				{ index: 10, noteCount: 8, strength: "strong", role: "drums" },
			]),
		).toEqual([3]);
	});
});
