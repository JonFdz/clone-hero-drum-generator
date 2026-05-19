import { describe, expect, it } from "vitest";
import { DesktopPathSelectionError } from "./pathAllowlist.js";
import {
	addAllowedProjectFile,
	assertAllowedProjectFile,
	resolveAllowedOpenProjectFile,
} from "./projectFileAccess.js";

describe("projectFileAccess", () => {
	it("accepts selected or created project paths", () => {
		const allowed = new Set<string>();
		const selected = addAllowedProjectFile(allowed, "/tmp/demo.chdg");
		expect(
			assertAllowedProjectFile(
				allowed,
				"/tmp/demo.chdg",
				"PROJECT_FILE_NOT_SELECTED",
				"Select project",
			),
		).toBe(selected);
	});

	it("rejects arbitrary saveProjectAs path", () => {
		const allowed = new Set<string>();
		expect(() =>
			assertAllowedProjectFile(
				allowed,
				"/tmp/other.chdg",
				"PROJECT_SAVE_PATH_NOT_SELECTED",
				"Select project",
			),
		).toThrow(DesktopPathSelectionError);
	});

	it("accepts recent project path only when present in Electron-owned recents", async () => {
		const allowed = new Set<string>();
		const resolved = await resolveAllowedOpenProjectFile(
			allowed,
			"/tmp/recent.chdg",
			async () => [
				{ path: "/tmp/recent.chdg", name: "Recent", lastOpenedAt: "2024-01-01" },
			],
		);
		expect(resolved).toBe("/tmp/recent.chdg");
		expect(allowed.has("/tmp/recent.chdg")).toBe(true);
	});

	it("rejects arbitrary openProject path when not selected and not in recents", async () => {
		const allowed = new Set<string>();
		await expect(
			resolveAllowedOpenProjectFile(allowed, "/tmp/arbitrary.chdg", async () => []),
		).rejects.toMatchObject({
			code: "PROJECT_FILE_NOT_ALLOWED",
		});
	});
});
