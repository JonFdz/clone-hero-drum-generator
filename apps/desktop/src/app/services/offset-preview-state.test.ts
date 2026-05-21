import { describe, expect, it } from "vitest";
import {
	isOffsetDirty,
	nudgeOffsetMs,
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
});
