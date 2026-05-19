import { mkdtempSync, rmSync, accessSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
	readSettings,
	writeSettings,
	readRecentProjects,
	addRecentProject,
	removeRecentProject,
	pathExists,
} from "./settingsService.js";

vi.mock("electron", () => ({
	app: {
		getPath: () => tmpdir() + "/chdg-settings-test",
	},
}));

describe("settingsService", () => {
	beforeEach(() => {
		// Ensure clean state
		try {
			const dir = tmpdir() + "/chdg-settings-test";
			rmSync(dir, { recursive: true, force: true });
		} catch {
			// ignore
		}
	});

	afterEach(() => {
		try {
			const dir = tmpdir() + "/chdg-settings-test";
			rmSync(dir, { recursive: true, force: true });
		} catch {
			// ignore
		}
	});

	describe("readSettings", () => {
		it("returns defaults when no settings exist", async () => {
			const settings = await readSettings();
			expect(settings.schemaVersion).toBe(1);
			expect(settings.theme).toBe("dark");
			expect(settings.projectLocation).toBeTypeOf("string");
		});
	});

	describe("writeSettings", () => {
		it("persists and reads settings", async () => {
			const settings = {
				schemaVersion: 1,
				theme: "dark" as const,
				projectLocation: "/tmp/chdg-projects",
				defaultCharter: "CHDG",
				defaultOffsetMs: 0,
				ffmpegPath: "/usr/bin/ffmpeg",
			};
			await writeSettings(settings);
			const read = await readSettings();
			expect(read.projectLocation).toBe("/tmp/chdg-projects");
			expect(read.defaultCharter).toBe("CHDG");
			expect(read.ffmpegPath).toBe("/usr/bin/ffmpeg");
		});
	});

	describe("readRecentProjects", () => {
		it("returns empty array when no recents exist", async () => {
			const recents = await readRecentProjects();
			expect(recents).toEqual([]);
		});
	});

	describe("addRecentProject", () => {
		it("adds a recent project and deduplicates", async () => {
			await addRecentProject({ path: "/tmp/a.chdg", name: "A", lastOpenedAt: "2024-01-01" });
			await addRecentProject({ path: "/tmp/b.chdg", name: "B", lastOpenedAt: "2024-01-02" });
			await addRecentProject({ path: "/tmp/a.chdg", name: "A", lastOpenedAt: "2024-01-03" });
			const recents = await readRecentProjects();
			expect(recents).toHaveLength(2);
			expect(recents[0].lastOpenedAt).toBe("2024-01-03");
		});
	});

	describe("removeRecentProject", () => {
		it("removes a recent project by path", async () => {
			await addRecentProject({ path: "/tmp/a.chdg", name: "A", lastOpenedAt: "2024-01-01" });
			await removeRecentProject("/tmp/a.chdg");
			const recents = await readRecentProjects();
			expect(recents).toHaveLength(0);
		});
	});

	describe("pathExists", () => {
		it("returns true for existing path", async () => {
			const dir = mkdtempSync(join(tmpdir(), "chdg-test-"));
			const result = await pathExists(dir);
			expect(result).toBe(true);
			rmSync(dir, { recursive: true, force: true });
		});

		it("returns false for missing path", async () => {
			const result = await pathExists("/tmp/chdg-does-not-exist-12345");
			expect(result).toBe(false);
		});
	});
});
