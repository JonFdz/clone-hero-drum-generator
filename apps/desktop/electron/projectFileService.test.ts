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
			const filePath = join(tempDir, "test.chdg");
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
	});

	describe("readProjectFile", () => {
		it("reads a valid canonical project file and resolves owned assets", async () => {
			const filePath = join(tempDir, "test.chdg");
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

		it("reports missing required owned assets without weakening parsing", async () => {
			const filePath = join(tempDir, "test.chdg");
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
			mkdirSync(join(tempDir, "assets"), { recursive: true });
			mkdirSync(outputDir, { recursive: true });
			writeFileSync(join(tempDir, "assets", "source.mid"), "midi");
			writeFileSync(join(tempDir, "assets", "song.ogg"), "audio");
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
			mkdirSync(join(tempDir, "assets"), { recursive: true });
			mkdirSync(outputDir, { recursive: true });
			writeFileSync(join(tempDir, "assets", "source.mid"), "midi");
			writeFileSync(join(tempDir, "assets", "song.ogg"), "audio");
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
			const filePath = join(tempDir, "provisional.chdg");
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
			const filePath = join(tempDir, "invalid.chdg");
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
