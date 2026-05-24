import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("app routes source", () => {
	it("routes Project Details under Projects and redirects legacy New Project", () => {
		const source = readFileSync(
			join(process.cwd(), "apps/desktop/src/app/app.routes.ts"),
			"utf8",
		);
		expect(source).toContain('path: "projects/details"');
		expect(source).toContain('path: "new-project", redirectTo: "projects/details"');
	});
});
