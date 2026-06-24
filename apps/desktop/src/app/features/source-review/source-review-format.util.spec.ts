import { describe, expect, it } from "vitest";
import {
	MAPPING_PIECE_OPTIONS,
	compactFileName,
	confidenceLabel,
	isMappingIssue,
	issueGroupKey,
	issueLabel,
	mappingSourceKind,
	noteCountLabel,
	pieceLabel,
} from "./source-review-format.util";

describe("source-review-format.util", () => {
	it("formats piece labels with fallbacks", () => {
		expect(pieceLabel("kick")).toBe("Kick");
		expect(pieceLabel("hihat_closed")).toBe("Closed Hi-Hat");
		expect(pieceLabel("custom_thing")).toBe("Custom Thing");
	});

	it("builds piece options with labels", () => {
		expect(MAPPING_PIECE_OPTIONS[0]).toEqual({ value: "kick", label: "Kick" });
	});

	it("normalizes confidence labels", () => {
		expect(confidenceLabel("strong")).toBe("Strong");
		expect(confidenceLabel("unknown")).toBe("N/A");
	});

	it("compacts file names", () => {
		expect(compactFileName("/tmp/demo.mid")).toBe("demo.mid");
		expect(compactFileName(undefined)).toBe("");
	});

	it("formats note counts", () => {
		expect(noteCountLabel(1)).toBe("1 note");
		expect(noteCountLabel(2)).toBe("2 notes");
		expect(noteCountLabel(undefined)).toBe("n/a");
	});

	it("detects mapping issues but not info severity", () => {
		expect(
			isMappingIssue({
				severity: "warning",
				code: "UNKNOWN_MIDI_NOTE",
				message: "Unknown MIDI note 42",
			} as never),
		).toBe(true);
		expect(
			isMappingIssue({
				severity: "info",
				code: "UNKNOWN_MIDI_NOTE",
				message: "Unknown MIDI note 42",
			} as never),
		).toBe(false);
		expect(
			isMappingIssue({
				severity: "warning",
				code: "TEMPO_GAP",
				message: "Large tempo gap",
			} as never),
		).toBe(false);
	});

	it("groups info issues by normalizing digits", () => {
		expect(
			issueGroupKey({
				severity: "info",
				code: "UNKNOWN_MIDI_NOTE",
				message: "Unknown MIDI note 42",
			} as never),
		).toBe("info:UNKNOWN_MIDI_NOTE:Unknown MIDI note #");
	});

	it("issues display labels include the similar count", () => {
		expect(issueLabel({ severity: "warning", code: "X", count: 1 })).toBe(
			"warning · X",
		);
		expect(issueLabel({ severity: "error", code: "Y", count: 3 })).toBe(
			"error · Y · 3 similar",
		);
	});

	it("infers source kind from key prefix", () => {
		expect(mappingSourceKind({ key: "gpif:side stick" })).toBe("gpif");
		expect(mappingSourceKind({ key: "midi:36" })).toBe("midi");
	});
});
