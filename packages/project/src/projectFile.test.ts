import { describe, expect, it } from "vitest";
import {
	createProjectFile,
	validateProjectFile,
} from "./projectFile.js";

describe("projectFile", () => {
	describe("createProjectFile", () => {
		it("creates a valid project file with defaults", () => {
			const file = createProjectFile("Demo", "0.1.0");
			expect(file.schemaVersion).toBe(1);
			expect(file.project.name).toBe("Demo");
			expect(file.project.createdAt).toBeTypeOf("string");
			expect(file.project.updatedAt).toBeTypeOf("string");
			expect(file.paths).toEqual({});
			expect(file.selection.selectedTracks).toEqual([]);
			expect(file.metadata).toEqual({});
			expect(file.generation.status).toBe("not-generated");
		});

		it("applies overrides", () => {
			const file = createProjectFile("Demo", "0.1.0", {
				paths: { sourcePath: "/tmp/demo.mid" },
			});
			expect(file.paths.sourcePath).toBe("/tmp/demo.mid");
		});
	});

	describe("validateProjectFile", () => {
		it("accepts a valid project file", () => {
			const file = createProjectFile("Demo", "0.1.0");
			const result = validateProjectFile(file);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.project.project.name).toBe("Demo");
			}
		});

		it("preserves valid optional fields", () => {
			const result = validateProjectFile({
				schemaVersion: 1,
				appVersion: "0.1.0",
				project: {
					name: "Demo",
					createdAt: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
				paths: {
					sourcePath: "/tmp/demo.mid",
					audioPath: "/tmp/demo.wav",
					outputDir: "/tmp/out",
				},
				source: {
					sourceKind: "midi",
					inspectionSummary: { tracks: 3 },
				},
				selection: { selectedTracks: [1, 2] },
				metadata: {
					name: "Song",
					artist: "Artist",
					album: "Album",
					year: "2026",
					genre: "Rock",
					charter: "CHDG",
				},
				cover: { imagePath: "/tmp/cover.png" },
				generation: {
					status: "generated",
					offsetMs: 900,
					lastGeneratedAt: "2026-01-01T00:00:00.000Z",
					outputFiles: {
						chart: "/tmp/out/notes.chart",
						songIni: "/tmp/out/song.ini",
						songOgg: "/tmp/out/song.ogg",
					},
					lastResultSummary: { ok: true },
				},
				mappingOverrides: {
					"midi:37": {
						sourceKind: "midi",
						key: "midi:37",
						target: { kind: "piece", piece: "snare" },
					},
				},
			});
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.project.appVersion).toBe("0.1.0");
				expect(result.project.paths.sourcePath).toBe("/tmp/demo.mid");
				expect(result.project.source?.sourceKind).toBe("midi");
				expect(result.project.cover?.imagePath).toBe("/tmp/cover.png");
				expect(result.project.metadata.name).toBe("Song");
				expect(result.project.generation.offsetMs).toBe(900);
				expect(result.project.generation.outputFiles?.chart).toBe(
					"/tmp/out/notes.chart",
				);
				expect(result.project.mappingOverrides).toBeDefined();
			}
		});

		it("loads old project without mappingOverrides", () => {
			const result = validateProjectFile(baseProject({}));
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.project.mappingOverrides).toBeUndefined();
			}
		});

		it("loads old project without cover", () => {
			const result = validateProjectFile(baseProject({}));
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.project.cover).toBeUndefined();
			}
		});

		it("rejects invalid cover image path", () => {
			const result = validateProjectFile(baseProject({
				cover: { imagePath: 123 },
			}));
			expectInvalid(result, "INVALID_COVER_IMAGE_PATH");
		});

		it("rejects non-object input", () => {
			const result = validateProjectFile("invalid");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.code).toBe("INVALID_PROJECT_FILE");
			}
		});

		it("rejects missing schemaVersion", () => {
			const result = validateProjectFile({});
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.code).toBe("MISSING_SCHEMA_VERSION");
			}
		});

		it("rejects unsupported schema version", () => {
			const result = validateProjectFile({ schemaVersion: 99 });
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.code).toBe("UNSUPPORTED_PROJECT_VERSION");
			}
		});

		it("rejects missing project name", () => {
			const result = validateProjectFile({
				schemaVersion: 1,
				project: { name: "", createdAt: "", updatedAt: "" },
				paths: {},
				selection: { selectedTracks: [] },
				metadata: {},
				generation: { status: "not-generated" },
			});
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.code).toBe("INVALID_PROJECT_NAME");
			}
		});

		it("rejects invalid selectedTracks", () => {
			const result = validateProjectFile({
				schemaVersion: 1,
				project: { name: "Demo", createdAt: "", updatedAt: "" },
				paths: {},
				selection: { selectedTracks: ["bad"] },
				metadata: {},
				generation: { status: "not-generated" },
			});
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.code).toBe("INVALID_SELECTED_TRACKS");
			}
		});

		it("rejects invalid generation status", () => {
			const result = validateProjectFile({
				schemaVersion: 1,
				project: { name: "Demo", createdAt: "", updatedAt: "" },
				paths: {},
				selection: { selectedTracks: [] },
				metadata: {},
				generation: { status: "unknown" },
			});
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.code).toBe("INVALID_GENERATION_STATUS");
			}
		});

		it("rejects object sourcePath", () => {
			const result = validateProjectFile(baseProject({
				paths: { sourcePath: { bad: true } },
			}));
			expectInvalid(result, "INVALID_PROJECT_PATH");
		});

		it("rejects numeric audioPath", () => {
			const result = validateProjectFile(baseProject({
				paths: { audioPath: 123 },
			}));
			expectInvalid(result, "INVALID_PROJECT_PATH");
		});

		it("rejects array outputDir", () => {
			const result = validateProjectFile(baseProject({
				paths: { outputDir: [] },
			}));
			expectInvalid(result, "INVALID_PROJECT_PATH");
		});

		it("rejects numeric metadata.name", () => {
			const result = validateProjectFile(baseProject({
				metadata: { name: 123 },
			}));
			expectInvalid(result, "INVALID_METADATA_FIELD");
		});

		it("rejects object metadata.artist", () => {
			const result = validateProjectFile(baseProject({
				metadata: { artist: { bad: true } },
			}));
			expectInvalid(result, "INVALID_METADATA_FIELD");
		});

		it("rejects invalid source.sourceKind", () => {
			const result = validateProjectFile(baseProject({
				source: { sourceKind: "bad" },
			}));
			expectInvalid(result, "INVALID_SOURCE_KIND");
		});

		it("rejects string generation.offsetMs", () => {
			const result = validateProjectFile(baseProject({
				generation: { status: "not-generated", offsetMs: "900" },
			}));
			expectInvalid(result, "INVALID_GENERATION_OFFSET");
		});

		it("rejects NaN generation.offsetMs", () => {
			const result = validateProjectFile(baseProject({
				generation: { status: "not-generated", offsetMs: Number.NaN },
			}));
			expectInvalid(result, "INVALID_GENERATION_OFFSET");
		});

		it("rejects Infinity generation.offsetMs", () => {
			const result = validateProjectFile(baseProject({
				generation: { status: "not-generated", offsetMs: Number.POSITIVE_INFINITY },
			}));
			expectInvalid(result, "INVALID_GENERATION_OFFSET");
		});

		it("rejects object generation.lastGeneratedAt", () => {
			const result = validateProjectFile(baseProject({
				generation: {
					status: "generated",
					lastGeneratedAt: { bad: true },
				},
			}));
			expectInvalid(result, "INVALID_GENERATION_TIMESTAMP");
		});

		it("rejects numeric generation.outputFiles.chart", () => {
			const result = validateProjectFile(baseProject({
				generation: {
					status: "generated",
					outputFiles: { chart: 123 },
				},
			}));
			expectInvalid(result, "INVALID_OUTPUT_FILE");
		});

		it("rejects object generation.outputFiles.songIni", () => {
			const result = validateProjectFile(baseProject({
				generation: {
					status: "generated",
					outputFiles: { songIni: { bad: true } },
				},
			}));
			expectInvalid(result, "INVALID_OUTPUT_FILE");
		});

		it("rejects array generation.outputFiles.songOgg", () => {
			const result = validateProjectFile(baseProject({
				generation: {
					status: "generated",
					outputFiles: { songOgg: [] },
				},
			}));
			expectInvalid(result, "INVALID_OUTPUT_FILE");
		});
	});
});

function baseProject(overrides: Record<string, unknown>) {
	return {
		schemaVersion: 1,
		project: {
			name: "Demo",
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-01T00:00:00.000Z",
		},
		paths: {},
		selection: { selectedTracks: [] },
		metadata: {},
		generation: { status: "not-generated" },
		...overrides,
	};
}

function expectInvalid(
	result: ReturnType<typeof validateProjectFile>,
	code: string,
) {
	expect(result.ok).toBe(false);
	if (!result.ok) {
		expect(result.code).toBe(code);
	}
}
