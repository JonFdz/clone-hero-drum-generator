import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("AppComponent source", () => {
	it("does not include the no-op self-assignment anti-pattern", () => {
		const source = readFileSync(
			join(process.cwd(), "apps/desktop/src/app/app.component.ts"),
			"utf8",
		);
		expect(source).not.toContain("this.generateState.applyError = this.generateState.applyError");
	});

	it("does not keep the empty saved branch in saveProjectAs", () => {
		const source = readFileSync(
			join(process.cwd(), "apps/desktop/src/app/app.component.ts"),
			"utf8",
		);
		expect(source).not.toContain("const saved = await this.projectState.saveProjectAs");
		expect(source).not.toContain("if (saved)");
	});

	it("does not expose New Project as a top-level navigation item", () => {
		const source = readFileSync(
			join(process.cwd(), "apps/desktop/src/app/app.component.ts"),
			"utf8",
		);
		expect(source).not.toContain('label: "New Project"');
		expect(source).toContain('path: "/projects"');
	});
});
