import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("DesktopProjectStateService source", () => {
	it("returns the createProject payload instead of a boolean", () => {
		const source = readFileSync(
			join(
				process.cwd(),
				"apps/desktop/src/app/services/desktop-project-state.service.ts",
			),
			"utf8",
		);
		expect(source).toContain(
			"async createProject(name: string): Promise<ProjectStatePayload | null>",
		);
		expect(source).toContain("return envelope.data");
		expect(source).not.toContain(
			"async createProject(name: string): Promise<boolean>",
		);
	});
});
