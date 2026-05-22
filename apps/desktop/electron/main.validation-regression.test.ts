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

	it("preserves mappingOverrides in generate input validation", () => {
		expect(source).toContain("function assertGenerateInput(input: unknown): DesktopGeneratePackageInput {");
		expect(source).toContain(
			'mappingOverrides: optionalMappingOverrides(value["mappingOverrides"]),',
		);
	});

	it("uses validation helper for optional mapping overrides", () => {
		expect(source).toContain(
			"function optionalMappingOverrides(",
		);
		expect(source).toContain("return validateMappingOverrides(value);");
	});
});
