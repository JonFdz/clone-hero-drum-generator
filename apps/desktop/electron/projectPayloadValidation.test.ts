import { describe, expect, it } from "vitest";
import {
	assertCreateProjectName,
	optionalSelectedTracks,
	DesktopInputValidationError,
} from "./projectPayloadValidation.js";

describe("projectPayloadValidation", () => {
	it("createProject invalid payload fails cleanly", () => {
		expect(() => assertCreateProjectName(null)).toThrow(DesktopInputValidationError);
		expect(() => assertCreateProjectName({})).toThrow(DesktopInputValidationError);
	});

	it("returns valid createProject name", () => {
		expect(assertCreateProjectName({ projectName: "Demo" })).toBe("Demo");
	});

	it("rejects invalid selectedTracks", () => {
		expect(() => optionalSelectedTracks("bad")).toThrow(DesktopInputValidationError);
		expect(() => optionalSelectedTracks([1, -1])).toThrow(DesktopInputValidationError);
		expect(() => optionalSelectedTracks([1, 1.5])).toThrow(DesktopInputValidationError);
	});

	it("dedupes and sorts selectedTracks", () => {
		expect(optionalSelectedTracks([3, 1, 3, 2])).toEqual([1, 2, 3]);
	});
});
