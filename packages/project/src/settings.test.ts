import { describe, expect, it } from "vitest";
import {
	DEFAULT_SETTINGS,
	validateSettings,
	validateRecents,
	type DesktopSettings,
	type RecentProject,
} from "./settings.js";

describe("settings", () => {
	describe("validateSettings", () => {
		it("returns null for non-object input", () => {
			expect(validateSettings("invalid")).toBeNull();
			expect(validateSettings(null)).toBeNull();
			expect(validateSettings([])).toBeNull();
		});

		it("returns null for missing schemaVersion", () => {
			expect(validateSettings({ theme: "dark", projectLocation: "/tmp" })).toBeNull();
		});

		it("returns null for invalid theme", () => {
			expect(validateSettings({ schemaVersion: 1, theme: "light", projectLocation: "/tmp" })).toBeNull();
		});

		it("returns null for missing projectLocation", () => {
			expect(validateSettings({ schemaVersion: 1, theme: "dark" })).toBeNull();
		});

		it("returns valid settings with defaults merged", () => {
			const input: DesktopSettings = {
				schemaVersion: 1,
				theme: "dark",
				projectLocation: "/tmp/projects",
				defaultCharter: "CHDG",
			};
			const result = validateSettings(input);
			expect(result).not.toBeNull();
			expect(result!.projectLocation).toBe("/tmp/projects");
			expect(result!.defaultCharter).toBe("CHDG");
			expect(result!.theme).toBe("dark");
		});
	});

	describe("validateRecents", () => {
		it("returns empty array for non-array input", () => {
			expect(validateRecents("invalid")).toEqual([]);
			expect(validateRecents(null)).toEqual([]);
		});

		it("filters out invalid entries", () => {
			const input = [
				{ path: "/tmp/a.chdg", name: "A", lastOpenedAt: "2024-01-01" },
				{ path: "/tmp/b.chdg", name: "B" },
				"invalid",
				null,
			];
			const result = validateRecents(input);
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe("A");
		});

		it("returns all valid entries", () => {
			const input: RecentProject[] = [
				{ path: "/tmp/a.chdg", name: "A", lastOpenedAt: "2024-01-01" },
				{ path: "/tmp/b.chdg", name: "B", lastOpenedAt: "2024-01-02" },
			];
			const result = validateRecents(input);
			expect(result).toHaveLength(2);
		});
	});
});
