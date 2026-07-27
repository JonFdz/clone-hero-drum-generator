import { mkdirSync, mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { parseProjectFile, type ChdgProjectFile } from "@chdg/project";

import {
	readProjectFile,
	writeProjectFile,
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
		it("writes a canonical project file through the shared serializer", async () => {
			const filePath = join(tempDir, "project.chdg");
			const project = canonicalProject();
			const result = await writeProjectFile(filePath, project);
			expect(result.ok).toBe(true);
			const text = readFileSync(filePath, "utf8");
			const parsed = parseProjectFile(text);
			expect(parsed.ok).toBe(true);
			expect(text.endsWith("\n")).toBe(true);
			expect(text).toContain('"projectId": "project-demo"');
			expect(text).not.toContain('"paths"');
			expect(text).not.toContain('"generation"');
		});

		it("rejects a noncanonical project filename without writing it", async () => {
			const filePath = join(tempDir, "test.chdg");

			const result = await writeProjectFile(filePath, canonicalProject());

			expect(result).toEqual({
				ok: false,
				code: "INVALID_PROJECT_FILE_NAME",
				message:
					"A canonical project must be opened through its project.chdg file.",
			});
			expect(() => readFileSync(filePath, "utf8")).toThrow();
		});
	});

	describe("readProjectFile", () => {
		it("reads a valid canonical project file and resolves owned assets", async () => {
			const filePath = join(tempDir, "project.chdg");
			const project = canonicalProject();
			mkdirSync(join(tempDir, "assets"), { recursive: true });
			writeFileSync(join(tempDir, "assets", "source.mid"), "midi");
			writeFileSync(join(tempDir, "assets", "song.ogg"), "audio");
			await writeProjectFile(filePath, project);
			const result = await readProjectFile(filePath);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.project.project.projectId).toBe("project-demo");
				expect(result.missingPaths).toEqual([]);
			}
		});

		it("returns error for missing file", async () => {
			const result = await readProjectFile(
				join(tempDir, "missing-project", "project.chdg"),
			);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.code).toBe("PROJECT_FILE_NOT_FOUND");
			}
		});

		it("returns error for invalid JSON", async () => {
			const filePath = join(tempDir, "project.chdg");
			writeFileSync(filePath, "not json", "utf8");
			const result = await readProjectFile(filePath);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.code).toBe("INVALID_PROJECT_JSON");
			}
		});

		it("returns error for unsupported schema version", async () => {
			const filePath = join(tempDir, "project.chdg");
			writeFileSync(filePath, JSON.stringify({ schemaVersion: 99 }), "utf8");
			const result = await readProjectFile(filePath);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.code).toBe("UNSUPPORTED_PROJECT_VERSION");
			}
		});

		it("reports missing required owned assets without weakening parsing", async () => {
			const filePath = join(tempDir, "project.chdg");
			writeFileSync(filePath, JSON.stringify(canonicalProject()), "utf8");
			const result = await readProjectFile(filePath);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.missingPaths).toEqual(["sourcePath", "audioPath"]);
			}
		});

		it("reports missing managed preview files for a current export", async () => {
			const filePath = join(tempDir, "project.chdg");
			const outputDir = join(tempDir, "clone-hero-output");
			const project = currentExportProject(outputDir);
			project.assets.cover = {
				relativePath: "assets/album.jpg",
				sha256: "4".repeat(64),
			};
			mkdirSync(join(tempDir, "assets"), { recursive: true });
			mkdirSync(outputDir, { recursive: true });
			writeFileSync(join(tempDir, "assets", "source.mid"), "midi");
			writeFileSync(join(tempDir, "assets", "song.ogg"), "audio");
			writeFileSync(join(tempDir, "assets", "album.jpg"), "cover");
			await writeProjectFile(filePath, project);

			const result = await readProjectFile(filePath);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.project.export.status).toBe("current");
				expect(result.missingPaths).toEqual([
					"outputChartPath",
					"outputAudioPath",
				]);
			}
		});

		it("accepts a current export whose manifested preview files exist", async () => {
			const filePath = join(tempDir, "project.chdg");
			const outputDir = join(tempDir, "clone-hero-output");
			const project = currentExportProject(outputDir);
			project.assets.cover = {
				relativePath: "assets/album.jpg",
				sha256: "4".repeat(64),
			};
			mkdirSync(join(tempDir, "assets"), { recursive: true });
			mkdirSync(outputDir, { recursive: true });
			writeFileSync(join(tempDir, "assets", "source.mid"), "midi");
			writeFileSync(join(tempDir, "assets", "song.ogg"), "audio");
			writeFileSync(join(tempDir, "assets", "album.jpg"), "cover");
			writeFileSync(join(outputDir, "notes.chart"), "chart");
			writeFileSync(join(outputDir, "song.ogg"), "managed audio");
			await writeProjectFile(filePath, project);

			const result = await readProjectFile(filePath);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.missingPaths).toEqual([]);
			}
		});

		it("rejects the provisional pre-release shape", async () => {
			const filePath = join(tempDir, "project.chdg");
			writeFileSync(
				filePath,
				JSON.stringify({
					schemaVersion: 1,
					project: { name: "Demo" },
					paths: {},
					selection: { selectedTracks: [] },
					metadata: {},
					generation: { status: "not-generated" },
				}),
				"utf8",
			);

			const result = await readProjectFile(filePath);

			expect(result).toEqual({
				ok: false,
				code: "UNSUPPORTED_PROVISIONAL_FORMAT",
				message: "Provisional pre-release project formats are not supported.",
			});
		});

		it("preserves meaningful canonical validation errors", async () => {
			const filePath = join(tempDir, "project.chdg");
			const invalid = canonicalProject() as unknown as Record<string, unknown>;
			invalid["project"] = {
				...(invalid["project"] as Record<string, unknown>),
				artist: "",
			};
			writeFileSync(filePath, JSON.stringify(invalid), "utf8");

			const result = await readProjectFile(filePath);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.code).toBe("INVALID_PROJECT_IDENTITY");
				expect(result.message).toContain("artist");
			}
		});

		it.each(["test.chdg", "Artist - Song - Project.chdg"])(
			"rejects the noncanonical active filename %s",
			async (fileName) => {
				const filePath = join(tempDir, fileName);
				writeFileSync(filePath, JSON.stringify(canonicalProject()), "utf8");

				await expect(readProjectFile(filePath)).resolves.toEqual({
					ok: false,
					code: "INVALID_PROJECT_FILE_NAME",
					message:
						"A canonical project must be opened through its project.chdg file.",
				});
			},
		);

		it("rejects recovery/previous.chdg as an active project", async () => {
			const recoveryDirectory = join(tempDir, "recovery");
			mkdirSync(recoveryDirectory);
			const filePath = join(recoveryDirectory, "previous.chdg");
			writeFileSync(filePath, JSON.stringify(canonicalProject()), "utf8");

			await expect(readProjectFile(filePath)).resolves.toMatchObject({
				ok: false,
				code: "INVALID_PROJECT_FILE_NAME",
			});
		});

		it.each([
			{ asset: "source", warning: "sourcePath" },
			{ asset: "audio", warning: "audioPath" },
		] as const)(
			"reports a directory at the owned $asset path as invalid",
			async ({ asset, warning }) => {
				const filePath = join(tempDir, "project.chdg");
				const project = canonicalProject();
				mkdirSync(join(tempDir, "assets"), { recursive: true });
				const sourcePath = join(tempDir, project.assets.source.relativePath);
				const audioPath = join(tempDir, project.assets.audio.relativePath);
				if (asset === "source") {
					mkdirSync(sourcePath);
					writeFileSync(audioPath, "audio");
				} else {
					writeFileSync(sourcePath, "source");
					mkdirSync(audioPath);
				}
				await writeProjectFile(filePath, project);

				const result = await readProjectFile(filePath);

				expect(result.ok).toBe(true);
				if (result.ok) expect(result.missingPaths).toEqual([warning]);
			},
		);

		it("reports a directory at the owned cover path as invalid", async () => {
			const filePath = join(tempDir, "project.chdg");
			const project = canonicalProject();
			project.assets.cover = {
				relativePath: "assets/album.jpg",
				sha256: "4".repeat(64),
			};
			mkdirSync(join(tempDir, "assets", "album.jpg"), { recursive: true });
			writeFileSync(join(tempDir, "assets", "source.mid"), "source");
			writeFileSync(join(tempDir, "assets", "song.ogg"), "audio");
			await writeProjectFile(filePath, project);

			const result = await readProjectFile(filePath);

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.missingPaths).toEqual(["coverImagePath"]);
		});

		it("reports a regular file at the export target as an invalid outputDir", async () => {
			const filePath = join(tempDir, "project.chdg");
			const outputDir = join(tempDir, "not-a-directory");
			const project = currentExportProject(outputDir);
			mkdirSync(join(tempDir, "assets"), { recursive: true });
			writeFileSync(join(tempDir, "assets", "source.mid"), "source");
			writeFileSync(join(tempDir, "assets", "song.ogg"), "audio");
			writeFileSync(outputDir, "file");
			await writeProjectFile(filePath, project);

			const result = await readProjectFile(filePath);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.missingPaths).toContain("outputDir");
			}
		});

		it.each([
			{ fileName: "notes.chart", warning: "outputChartPath" },
			{ fileName: "song.ogg", warning: "outputAudioPath" },
		] as const)(
			"reports a directory at managed $fileName as invalid",
			async ({ fileName, warning }) => {
				const filePath = join(tempDir, "project.chdg");
				const outputDir = join(tempDir, "clone-hero-output");
				const project = currentExportProject(outputDir);
				mkdirSync(join(tempDir, "assets"), { recursive: true });
				mkdirSync(outputDir);
				writeFileSync(join(tempDir, "assets", "source.mid"), "source");
				writeFileSync(join(tempDir, "assets", "song.ogg"), "audio");
				const otherFile =
					fileName === "notes.chart" ? "song.ogg" : "notes.chart";
				mkdirSync(join(outputDir, fileName));
				writeFileSync(join(outputDir, otherFile), "managed");
				await writeProjectFile(filePath, project);

				const result = await readProjectFile(filePath);

				expect(result.ok).toBe(true);
				if (result.ok) expect(result.missingPaths).toEqual([warning]);
			},
		);
	});

	describe("retired legacy project target helpers", () => {
		it("keeps project creation and rename behavior out of the canonical IO service", () => {
			const source = readFileSync(
				new URL("./projectFileService.ts", import.meta.url),
				"utf8",
			);
			expect(source).not.toContain("resolveUniqueProjectTarget");
			expect(source).not.toContain("renameManagedProjectTarget");
			expect(source).not.toContain("getDefaultProjectFilePath");
			expect(source).not.toContain("rename(");
		});
	});
});

function canonicalProject(): ChdgProjectFile {
	const timestamp = "2026-07-26T10:00:00.000Z";
	return {
		schemaVersion: 1,
		appVersion: "0.1.0",
		project: {
			projectId: "project-demo",
			artist: "Artist",
			songName: "Song",
			projectName: "Project",
			createdAt: timestamp,
			updatedAt: timestamp,
		},
		import: {
			selectedTrackIds: [0],
			sourceMappings: {
				"midi:36": {
					key: "midi:36",
					sourceKind: "midi",
					sourceLabel: "MIDI note 36",
					detectedPiece: "kick",
					defaultTarget: { lane: "kick", cymbal: false },
					count: 1,
					confidence: "high",
					status: "mapped",
				},
			},
			importedAt: timestamp,
			importerVersion: "0.1.0",
		},
		assets: {
			source: {
				relativePath: "assets/source.mid",
				originalFileName: "source.mid",
				sourceKind: "midi",
				sha256: "a".repeat(64),
				importedAt: timestamp,
			},
			audio: {
				relativePath: "assets/song.ogg",
				sha256: "b".repeat(64),
			},
		},
		sourceDocument: {
			resolution: 960,
			tempos: [{ tick: 0, bpm: 120 }],
			timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
			sections: [],
			hits: [
				{
					id: "midi:0:9:0:36:0",
					tick: 0,
					detectedPiece: "kick",
					velocity: 100,
					durationTicks: 0,
					sourceMappingKey: "midi:36",
					sourceIdentity: {
						kind: "midi",
						trackIndex: 0,
						channel: 9,
						tick: 0,
						midiNote: 36,
						occurrenceIndex: 0,
					},
					source: {
						midiNote: 36,
						trackIndex: 0,
						trackName: "Drums",
						channel: 9,
					},
				},
			],
		},
		mappings: {
			interpretationOverrides: {},
			targetOverrides: {},
		},
		corrections: {},
		editor: { offsetMs: 125 },
		export: { status: "never-exported" },
	};
}

function currentExportProject(outputDir: string): ChdgProjectFile {
	const project = canonicalProject();
	const writtenAt = "2026-07-26T10:00:00.000Z";
	return {
		...project,
		export: {
			status: "current",
			targetDirectory: outputDir,
			lastSuccessfulAt: writtenAt,
			fingerprints: {
				sourceDocument: "e".repeat(64),
				mappings: "f".repeat(64),
				corrections: "1".repeat(64),
				metadata: "2".repeat(64),
				audio: "3".repeat(64),
			},
			managedFiles: {
				"notes.chart": {
					sha256: "c".repeat(64),
					sizeBytes: 5,
					writtenAt,
				},
				"song.ogg": {
					sha256: "d".repeat(64),
					sizeBytes: 13,
					writtenAt,
				},
			},
		},
	};
}
