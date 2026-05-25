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

	it("routes Source Review and redirects old source review steps", () => {
		const source = readFileSync(
			join(process.cwd(), "apps/desktop/src/app/app.routes.ts"),
			"utf8",
		);
		expect(source).toContain('path: "source-review"');
		expect(source).toContain('path: "inspect-source", redirectTo: "source-review"');
		expect(source).toContain('path: "track-selection", redirectTo: "source-review"');
		expect(source).toContain('path: "mapping", redirectTo: "source-review"');
	});

	it("keeps Generate canonical and redirects legacy Validation", () => {
		const source = readFileSync(
			join(process.cwd(), "apps/desktop/src/app/app.routes.ts"),
			"utf8",
		);

		expect(source).toContain('path: "generate", component: GeneratePageComponent');
		expect(source).toContain('path: "validation", redirectTo: "generate"');
		expect(source).not.toContain("ValidationPageComponent");
		expect(source).not.toContain('path: "validation", component');
	});
});
