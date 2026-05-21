import { describe, expect, it } from "vitest";
import {
	canApplyOffset,
	isOffsetDirty,
	isOffsetInputValid,
	nudgeOffsetMs,
	offsetApplyStatusMessage,
	resetOffsetToSaved,
} from "./offset-preview-state";

describe("offset-preview-state", () => {
	it("applies quick nudges", () => {
		expect(nudgeOffsetMs(0, 50)).toBe(50);
		expect(nudgeOffsetMs(50, -100)).toBe(-50);
	});

	it("resets to saved offset", () => {
		expect(resetOffsetToSaved(100)).toBe(100);
	});

	it("computes dirty state", () => {
		expect(isOffsetDirty(250, 100)).toBe(true);
		expect(isOffsetDirty(100, 100)).toBe(false);
	});

	it("validates input and apply-state", () => {
		expect(isOffsetInputValid("abc")).toBe(false);
		expect(isOffsetInputValid("50")).toBe(true);
		expect(
			canApplyOffset({ inputValid: false, previewOffsetMs: 50, savedOffsetMs: 0 }),
		).toBe(false);
		expect(
			canApplyOffset({ inputValid: true, previewOffsetMs: 50, savedOffsetMs: 0 }),
		).toBe(true);
		expect(
			canApplyOffset({ inputValid: true, previewOffsetMs: 0, savedOffsetMs: 0 }),
		).toBe(false);
	});

	it("returns truthful apply status messages", () => {
		expect(offsetApplyStatusMessage("project-and-chart")).toBe(
			"Chart offset saved to project and notes.chart.",
		);
		expect(offsetApplyStatusMessage("project-only-chart-missing")).toBe(
			"Chart offset saved to project. Regenerate to write notes.chart.",
		);
		expect(offsetApplyStatusMessage("project-only-output-missing")).toBe(
			"Chart offset saved to project. Select an output folder and generate to write notes.chart.",
		);
		expect(offsetApplyStatusMessage("project-only")).toBe(
			"Chart offset saved to project.",
		);
	});
});
