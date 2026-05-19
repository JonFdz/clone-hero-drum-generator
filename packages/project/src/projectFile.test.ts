import { describe, expect, it } from "vitest";
import {
	createProjectFile,
	validateProjectFile,
	type ChdgProjectFile,
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
	});
});
