import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import { describe, expect, it } from "vitest";

const __appRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), ".");

const routesSource = () =>
	readFileSync(join(__appRoot, "app.routes.ts"), "utf8");

// Note: a behavioral test that imports `routes` requires the Angular test
// platform (JIT compiler + TestBed), which is not configured for the Vitest
// node environment in this foundation PR. The routing contract is therefore
// asserted structurally against the route source. A behavioral routes test is
// recorded in the architecture follow-up register.
describe("app routes source", () => {
	it("keeps Home eagerly loaded with a direct component reference", () => {
		const src = routesSource();
		expect(src).toMatch(/path:\s*"home",\s*component:\s*HomePageComponent/);
		// Home must not be lazy-loaded.
		expect(src).not.toMatch(/path:\s*"home"[^}]*loadComponent/);
	});

	it("lazy-loads every feature route via loadComponent and keeps only Home static", () => {
		const src = routesSource();
		const featurePaths = [
			"projects",
			"projects/details",
			"source-review",
			"generate",
			"preview",
			"settings",
		];
		for (const path of featurePaths) {
			expect(src).toContain(`path: "${path}"`);
		}
		const loadComponentCount = (src.match(/loadComponent:/g) ?? []).length;
		expect(loadComponentCount).toBe(featurePaths.length);
		// Only Home may use a static `component:` reference.
		const staticComponentCount = (src.match(/\bcomponent:\s*\w+/g) ?? []).length;
		expect(staticComponentCount).toBe(1);
		expect(src).toContain("component: HomePageComponent");
	});

	it("redirects legacy New Project to Project Details", () => {
		expect(routesSource()).toContain(
			'path: "new-project", redirectTo: "projects/details"',
		);
	});

	it("redirects legacy source-review steps to Source Review", () => {
		const src = routesSource();
		expect(src).toContain('path: "inspect-source", redirectTo: "source-review"');
		expect(src).toContain('path: "track-selection", redirectTo: "source-review"');
		expect(src).toContain('path: "mapping", redirectTo: "source-review"');
	});

	it("redirects legacy Validation to Generate", () => {
		expect(routesSource()).toContain('path: "validation", redirectTo: "generate"');
	});

	it("redirects unknown and empty paths to Home", () => {
		const src = routesSource();
		expect(src).toContain('path: "**", redirectTo: "home"');
		expect(src).toContain('path: "", pathMatch: "full", redirectTo: "home"');
	});
});
