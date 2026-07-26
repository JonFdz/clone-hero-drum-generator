import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("electron main payload validation regressions", () => {
	const source = readFileSync(
		join(process.cwd(), "apps/desktop/electron/main.ts"),
		"utf8",
	);

	it("preserves mappingOverrides in normalize input validation", () => {
		expect(source).toContain("function assertNormalizeInput(input: unknown): NormalizeSelectionInput {");
		expect(source).toContain(
			'mappingOverrides: optionalMappingOverrides(value["mappingOverrides"]),',
		);
	});

	it("retires managed package generation explicitly", () => {
		expect(source).toContain('"GENERATION_NOT_AVAILABLE"');
		expect(source).not.toContain("function assertGenerateInput(");
		expect(source).not.toMatch(/\bgeneratePackage\(/);
		expect(source).not.toContain("OVERWRITE_CONFIRMATION_REQUIRED");
	});

	it("uses validation helper for optional mapping overrides", () => {
		expect(source).toContain(
			"function optionalMappingOverrides(",
		);
		expect(source).toContain("return validateMappingOverrides(value);");
	});

	it("prefers canonical source timing and uses transient analysis only as a runtime fallback", () => {
		expect(source).toContain(
			'const sourceTiming = sourceTimingFromDocument(value["sourceTiming"]);',
		);
		expect(source).toContain(
			'const analysis = optionalAnalysisCache(value["analysis"]);',
		);
		expect(source).toContain(
			"sourceTiming ?? sourceTimingFromAnalysisCache(analysis)",
		);
	});

	it("retires name-only create and provisional save handlers explicitly", () => {
		expect(source).toContain('"PROJECT_CREATION_NOT_AVAILABLE"');
		expect(source).toContain('"PROJECT_SAVE_NOT_AVAILABLE"');
		expect(source).toContain('"PROJECT_SAVE_AS_NOT_AVAILABLE"');
		expect(source).toContain('"PROJECT_SAVE_PICKER_NOT_AVAILABLE"');
		expect(source).not.toContain("dialog.showSaveDialog");
		expect(source).not.toContain("buildProjectFileFromState");
	});
});
