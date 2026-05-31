import { mkdirSync, mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

vi.mock("electron", () => ({
	app: {
		getPath: (name: string) => {
			if (name === "documents") return tmpdir() + "/chdg-documents";
			return tmpdir() + "/chdg-" + name;
		},
	},
}));
import {
	readProjectFile,
	writeProjectFile,
	buildProjectFileFromState,
	getDefaultProjectFilePath,
	getDefaultOutputDir,
	resolveUniqueProjectTarget,
	renameManagedProjectTarget,
} from "./projectFileService.js";

describe("projectFileService", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "chdg-test-"));
	});

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true });
	});

	describe("writeProjectFile", () => {
		it("writes a valid project file", async () => {
			const filePath = join(tempDir, "test.chdg");
			const project = buildProjectFileFromState("Demo", "0.1.0", {
				selectedTracks: [1],
				metadata: { name: "Song" },
				generationStatus: "not-generated",
			});
			const result = await writeProjectFile(filePath, project);
			expect(result.ok).toBe(true);
			const text = readFileSync(filePath, "utf8");
			const parsed = JSON.parse(text);
			expect(parsed.project.name).toBe("Demo");
			expect(parsed.project.updatedAt).toBeTypeOf("string");
		});
	});

	describe("readProjectFile", () => {
		it("reads a valid project file", async () => {
			const filePath = join(tempDir, "test.chdg");
			const project = buildProjectFileFromState("Demo", "0.1.0", {
				selectedTracks: [1],
				metadata: {},
				generationStatus: "generated",
			});
			await writeProjectFile(filePath, project);
			const result = await readProjectFile(filePath);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.project.project.name).toBe("Demo");
				expect(result.missingPaths).toEqual([]);
			}
		});

		it("returns error for missing file", async () => {
			const result = await readProjectFile(join(tempDir, "missing.chdg"));
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.code).toBe("PROJECT_FILE_NOT_FOUND");
			}
		});

		it("returns error for invalid JSON", async () => {
			const filePath = join(tempDir, "bad.chdg");
			writeFileSync(filePath, "not json", "utf8");
			const result = await readProjectFile(filePath);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.code).toBe("INVALID_PROJECT_JSON");
			}
		});

		it("returns error for unsupported schema version", async () => {
			const filePath = join(tempDir, "old.chdg");
			writeFileSync(filePath, JSON.stringify({ schemaVersion: 99 }), "utf8");
			const result = await readProjectFile(filePath);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.code).toBe("UNSUPPORTED_PROJECT_VERSION");
			}
		});

		it("saves and opens cover image path", async () => {
			const filePath = join(tempDir, "cover.chdg");
			const coverPath = join(tempDir, "cover.png");
			writeFileSync(coverPath, "image", "utf8");
			const project = buildProjectFileFromState("Demo", "0.1.0", {
				selectedTracks: [],
				metadata: {},
				generationStatus: "not-generated",
				cover: { imagePath: coverPath },
			});
			await writeProjectFile(filePath, project);
			const result = await readProjectFile(filePath);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.project.cover?.imagePath).toBe(coverPath);
				expect(result.missingPaths).toEqual([]);
			}
		});

		it("reports missing cover without blocking project open", async () => {
			const filePath = join(tempDir, "missing-cover.chdg");
			const project = buildProjectFileFromState("Demo", "0.1.0", {
				selectedTracks: [],
				metadata: {},
				generationStatus: "not-generated",
				cover: { imagePath: join(tempDir, "missing.png") },
			});
			await writeProjectFile(filePath, project);
			const result = await readProjectFile(filePath);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.missingPaths).toContain("coverImagePath");
			}
		});

		it("omits cover when cover image path is cleared", () => {
			const project = buildProjectFileFromState("Demo", "0.1.0", {
				selectedTracks: [],
				metadata: {},
				generationStatus: "not-generated",
				cover: undefined,
			});
			expect(project.cover).toBeUndefined();
		});

		it("detects missing paths", async () => {
			const filePath = join(tempDir, "test.chdg");
			const project = buildProjectFileFromState("Demo", "0.1.0", {
				selectedTracks: [],
				metadata: {},
				generationStatus: "not-generated",
				outputDir: join(tempDir, "missing-output"),
			});
			await writeProjectFile(filePath, project);
			const result = await readProjectFile(filePath);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.missingPaths).toContain("outputDir");
			}
		});
	});

	describe("resolveUniqueProjectTarget", () => {
		it("adds a unique suffix when the requested project file exists", async () => {
			const requestedName = "Untitled 2026-05-24 13-32-10";
			const existingFolder = join(tempDir, requestedName);
			const existingFile = join(existingFolder, `${requestedName}.chdg`);
			mkdirSync(existingFolder, { recursive: true });
			writeFileSync(existingFile, "original", { encoding: "utf8", flag: "wx" });

			const target = await resolveUniqueProjectTarget(tempDir, requestedName);

			expect(target.name).toBe("Untitled 2026-05-24 13-32-10 2");
			expect(target.filePath).toContain("Untitled 2026-05-24 13-32-10 2.chdg");
			expect(readFileSync(existingFile, "utf8")).toBe("original");
		});
	});

	describe("renameManagedProjectTarget", () => {
		it("renames auto-created project folder, file, and default output dir", async () => {
			const oldFolder = join(tempDir, "Old Name");
			const oldFile = join(oldFolder, "Old Name.chdg");
			mkdirSync(oldFolder, { recursive: true });
			writeFileSync(oldFile, "{}", "utf8");

			const result = await renameManagedProjectTarget({
				currentFilePath: oldFile,
				oldProjectName: "Old Name",
				newProjectName: "New Name",
				projectLocation: tempDir,
				outputDir: join(oldFolder, "output"),
			});

			expect(result).toMatchObject({
				filePath: join(tempDir, "New Name", "New Name.chdg"),
				outputDir: join(tempDir, "New Name", "output"),
				renamed: true,
			});
			expect(readFileSync(result.filePath, "utf8")).toBe("{}");
		});

		it("does not rename custom project paths", async () => {
			const customFolder = join(tempDir, "custom");
			const customFile = join(customFolder, "project.chdg");
			mkdirSync(customFolder, { recursive: true });
			writeFileSync(customFile, "{}", "utf8");

			const result = await renameManagedProjectTarget({
				currentFilePath: customFile,
				oldProjectName: "Old Name",
				newProjectName: "New Name",
				projectLocation: tempDir,
				outputDir: join(customFolder, "output"),
			});

			expect(result).toEqual({
				filePath: customFile,
				outputDir: join(customFolder, "output"),
				renamed: false,
			});
			expect(readFileSync(customFile, "utf8")).toBe("{}");
		});
	});

	describe("getDefaultProjectFilePath", () => {
		it("includes project name and extension", () => {
			const path = getDefaultProjectFilePath("My Song");
			expect(path).toContain("My Song");
			expect(path).toContain("My Song.chdg");
		});
	});

	describe("getDefaultOutputDir", () => {
		it("returns output folder inside project directory", () => {
			const out = getDefaultOutputDir("/projects/My Song/My Song.chdg");
			expect(out).toContain("output");
		});
	});
});
