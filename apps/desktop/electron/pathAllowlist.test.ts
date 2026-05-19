import path from "node:path";
import { describe, expect, it } from "vitest";
import {
	addAllowedPath,
	assertAllowedPath,
	DesktopPathSelectionError,
} from "./pathAllowlist";

describe("desktop path allowlist", () => {
	it("accepts a path selected through a picker", () => {
		const allowed = new Set<string>();
		const selected = addAllowedPath(allowed, "samples/demo.mid");

		expect(selected).toBe(path.resolve("samples/demo.mid"));
		expect(
			assertAllowedPath(
				allowed,
				"samples/demo.mid",
				"SOURCE_FILE_NOT_SELECTED",
				"Select source",
			),
		).toBe(selected);
	});

	it("rejects a source path that was not selected", () => {
		const allowed = new Set<string>();
		addAllowedPath(allowed, "samples/demo.mid");

		expect(() =>
			assertAllowedPath(
				allowed,
				"samples/other.mid",
				"SOURCE_FILE_NOT_SELECTED",
				"Select source",
			),
		).toThrow(DesktopPathSelectionError);
		try {
			assertAllowedPath(
				allowed,
				"samples/other.mid",
				"SOURCE_FILE_NOT_SELECTED",
				"Select source",
			);
		} catch (error) {
			expect(error).toMatchObject({
				code: "SOURCE_FILE_NOT_SELECTED",
				message: "Select source",
			});
		}
	});

	it("rejects an audio path that was not selected", () => {
		const allowed = new Set<string>();
		addAllowedPath(allowed, "samples/demo.wav");

		expect(() =>
			assertAllowedPath(
				allowed,
				"samples/other.wav",
				"AUDIO_FILE_NOT_SELECTED",
				"Select audio",
			),
		).toThrow(DesktopPathSelectionError);
	});

	it("keeps output folder behavior scoped to selected folders", () => {
		const allowed = new Set<string>();
		const selected = addAllowedPath(allowed, "output/demo");

		expect(
			assertAllowedPath(
				allowed,
				"output/demo",
				"OUTPUT_FOLDER_NOT_SELECTED",
				"Select output",
			),
		).toBe(selected);
		expect(() =>
			assertAllowedPath(
				allowed,
				"output/other",
				"OUTPUT_FOLDER_NOT_SELECTED",
				"Select output",
			),
		).toThrow(DesktopPathSelectionError);
	});
});
