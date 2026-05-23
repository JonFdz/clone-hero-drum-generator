import { describe, expect, it } from "vitest";
import { formatTrackNoteCount } from "./track-note-count";

describe("formatTrackNoteCount", () => {
	it("formats known counts", () => {
		expect(formatTrackNoteCount(0)).toBe("0 notes");
		expect(formatTrackNoteCount(1)).toBe("1 note");
		expect(formatTrackNoteCount(12)).toBe("12 notes");
	});

	it("keeps unknown/unavailable distinct from zero", () => {
		expect(formatTrackNoteCount(undefined)).toBe("n/a");
		expect(formatTrackNoteCount(null)).toBe("n/a");
		expect(formatTrackNoteCount(Number.NaN)).toBe("n/a");
	});
});
