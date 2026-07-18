import { describe, expect, it } from "vitest";
import {
	PROJECT_SESSION_PUBLIC_KEY,
	extractImports,
	findAllViolations,
	findBrowserHarnessImportViolations,
	findCrossFeatureViolations,
	resolveImportKey,
	featureNameOf,
} from "./check-architecture.lib.mjs";

describe("browser harness production boundary", () => {
	const SRC_ROOT = "/fake/src";
	const sourceEntry = (rel, source) => ({ file: `${SRC_ROOT}/${rel}`, source });

	it("rejects resolved relative imports from production main and nested app files", () => {
		expect(
			findBrowserHarnessImportViolations(
				[
					sourceEntry(
						"main.ts",
						'import { installBrowserBridge } from "./browser-harness/install-browser-bridge";',
					),
					sourceEntry(
						"app/features/home/home.service.ts",
						'import { fixture } from "../../../browser-harness/fixture-builders";',
					),
				],
				SRC_ROOT,
			),
		).toEqual([
			{
				file: "main.ts",
				rule: "browser-harness-production-import",
				spec: "./browser-harness/install-browser-bridge",
			},
			{
				file: "app/features/home/home.service.ts",
				rule: "browser-harness-production-import",
				spec: "../../../browser-harness/fixture-builders",
			},
		]);
	});

	it("ignores comments, ordinary strings, and imports outside the harness tree", () => {
		expect(
			findBrowserHarnessImportViolations(
				[
					sourceEntry(
						"app/home.ts",
						[
							'// import "../browser-harness/fixture-builders";',
							'const diagnostic = "browser-harness";',
							'import { routes } from "./app.routes";',
							'import { helper } from "browser-harness-helper";',
						].join("\n"),
					),
				],
				SRC_ROOT,
			),
		).toEqual([]);
	});
});

// The helpers operate on in-memory entries with absolute paths under a fake
// app root, so the cross-feature resolution logic can be exercised without
// reading the real source tree.
const APP_ROOT = "/fake/app";
const f = (rel) => `${APP_ROOT}/${rel}`;
const entry = (rel, source) => ({ file: f(rel), source });

const onPushComponent = (rel, extra = "") =>
	entry(rel, [
		'import { ChangeDetectionStrategy, Component } from "@angular/core";',
		"@Component({ selector: 'chdg-x', templateUrl: './x.html', styleUrl: './x.css', changeDetection: ChangeDetectionStrategy.OnPush })",
		"export class X {}",
		extra,
	].join("\n"));

describe("resolveImportKey", () => {
	it("resolves a relative import from the importing file's directory", () => {
		expect(
			resolveImportKey("../settings/settings.service", f("features/projects/projects-page.component.ts"), APP_ROOT),
		).toBe("features/settings/settings.service");
	});

	it("resolves a /features/-style non-relative import", () => {
		expect(
			resolveImportKey("app/features/settings/settings.service", f("features/projects/x.ts"), APP_ROOT),
		).toBe("features/settings/settings.service");
	});

	it("returns null for non-relative imports without /features/", () => {
		expect(
			resolveImportKey("@angular/core", f("features/projects/x.ts"), APP_ROOT),
		).toBeNull();
	});

	it("returns null for relative imports that escape the app tree", () => {
		expect(
			resolveImportKey("../../../../node_modules/x", f("features/projects/x.ts"), APP_ROOT),
		).toBeNull();
	});
});

describe("check:architecture cross-feature rules", () => {
	it("1. rejects a normal relative projects -> settings import", () => {
		const violations = findCrossFeatureViolations(
			[
				entry(
					"features/projects/projects-page.component.ts",
					'import { SettingsService } from "../settings/settings.service";',
				),
			],
			APP_ROOT,
		);
		expect(violations).toHaveLength(1);
		expect(violations[0].from).toBe("projects");
		expect(violations[0].to).toBe("settings");
		expect(violations[0].resolvedKey).toBe("features/settings/settings.service");
	});

	it("2. rejects a side-effect-only relative cross-feature import", () => {
		const violations = findCrossFeatureViolations(
			[entry("features/projects/projects-page.component.ts", 'import "../settings/settings.service";')],
			APP_ROOT,
		);
		expect(violations).toHaveLength(1);
		expect(violations[0].to).toBe("settings");
	});

	it("3. rejects a dynamic relative cross-feature import", () => {
		const violations = findCrossFeatureViolations(
			[entry("features/projects/projects-page.component.ts", 'const settings = await import("../settings/settings.service");')],
			APP_ROOT,
		);
		expect(violations).toHaveLength(1);
		expect(violations[0].to).toBe("settings");
	});

	it("4. rejects a cross-feature re-export", () => {
		const violations = findCrossFeatureViolations(
			[entry("features/projects/public-api.ts", 'export { SettingsService } from "../settings/settings.service";')],
			APP_ROOT,
		);
		expect(violations).toHaveLength(1);
		expect(violations[0].to).toBe("settings");
	});

	it("rejects a /features/-style cross-feature import", () => {
		const violations = findCrossFeatureViolations(
			[
				entry(
					"features/projects/projects-page.component.ts",
					'import { SettingsService } from "app/features/settings/settings.service";',
				),
			],
			APP_ROOT,
		);
		expect(violations).toHaveLength(1);
		expect(violations[0].to).toBe("settings");
	});

	it("6. allows the explicit project-session public API", () => {
		const violations = findCrossFeatureViolations(
			[
				entry(
					"features/projects/projects-page.component.ts",
					`import { ProjectWorkflowHydrator } from "../project-session/public-api";`,
				),
			],
			APP_ROOT,
		);
		expect(violations).toHaveLength(0);
	});

	it("allows another feature's explicit public API", () => {
		const violations = findCrossFeatureViolations(
			[entry("features/home/home-page.component.ts", 'import { ProjectLibraryService } from "../projects/public-api";')],
			APP_ROOT,
		);
		expect(violations).toHaveLength(0);
	});

	it("5. rejects direct access to a project-session internal file", () => {
		const violations = findCrossFeatureViolations(
			[
				entry(
					"features/projects/projects-page.component.ts",
					'import { ProjectSessionStore } from "../project-session/project-session.store";',
				),
			],
			APP_ROOT,
		);
		expect(violations).toHaveLength(1);
		expect(violations[0].to).toBe("project-session");
		expect(violations[0].resolvedKey).toBe("features/project-session/project-session.store");
	});

	it("allows same-feature internal imports", () => {
		const violations = findCrossFeatureViolations(
			[
				entry(
					"features/project-session/project-persistence.service.ts",
					'import { ProjectSessionStore } from "./project-session.store";',
				),
			],
			APP_ROOT,
		);
		expect(violations).toHaveLength(0);
	});

	it("does not flag imports from non-feature areas (core/services)", () => {
		const violations = findCrossFeatureViolations(
			[
				entry(
					"features/projects/project-library.service.ts",
					'import { DesktopBridgeService } from "../../services/desktop-bridge.service";',
				),
			],
			APP_ROOT,
		);
		expect(violations).toHaveLength(0);
	});
});

describe("check:architecture existing violations still fail", () => {
	it("flags an inline template", () => {
		const violations = findAllViolations(
			[entry("features/x/x.component.ts", 'template: "<p>hi</p>"')],
			APP_ROOT,
		);
		expect(violations.some((v) => v.rule === "inline-template")).toBe(true);
	});

	it("flags inline styles", () => {
		const violations = findAllViolations(
			[entry("features/x/x.component.ts", "styles: [\":host { display: block; }\"]")],
			APP_ROOT,
		);
		expect(violations.some((v) => v.rule === "inline-styles")).toBe(true);
	});

	it("flags a component missing OnPush", () => {
		const violations = findAllViolations(
			[
				entry(
					"features/x/x.component.ts",
					'@Component({ selector: "chdg-x", templateUrl: "./x.html", styleUrl: "./x.css" }) export class X {}',
				),
			],
			APP_ROOT,
		);
		expect(violations.some((v) => v.rule === "missing-onpush")).toBe(true);
	});

	it("does not flag OnPush components", () => {
		const violations = findAllViolations(
			[onPushComponent("features/x/x.component.ts")],
			APP_ROOT,
		);
		expect(violations.some((v) => v.rule === "missing-onpush")).toBe(false);
	});

	it("flags a component importing DesktopBridgeService", () => {
		const violations = findAllViolations(
			[
				entry(
					"features/x/x.component.ts",
					'import { DesktopBridgeService } from "../../services/desktop-bridge.service";',
				),
			],
			APP_ROOT,
		);
		expect(violations.some((v) => v.rule === "component-bridge-import")).toBe(true);
	});

	it("flags window.confirm and window.prompt", () => {
		const violations = findAllViolations(
			[
				entry("features/x/x.component.ts", "const ok = window.confirm(\"sure?\");"),
				entry("features/y/y.component.ts", "const name = window.prompt(\"name?\");"),
			],
			APP_ROOT,
		);
		expect(violations.some((v) => v.rule === "window.confirm")).toBe(true);
		expect(violations.some((v) => v.rule === "window.prompt")).toBe(true);
	});

	it("honors documented OnPush exceptions", () => {
		const rel = "features/x/x.component.ts";
		const violations = findAllViolations(
			[entry(rel, '@Component({ selector: "chdg-x" }) export class X {}')],
			APP_ROOT,
			{ onPushExceptions: new Set([rel]) },
		);
		expect(violations.some((v) => v.rule === "missing-onpush")).toBe(false);
	});
});

describe("extractImports", () => {
	it("extracts imports, re-exports, and literal dynamic imports through the TypeScript AST", () => {
		const specs = extractImports(
			[
				'import { A } from "a";',
				"import {",
				"  B,",
				'} from "b";',
				'import type { C } from "c";',
				'const d = import("d");',
				'import "e";',
				'export { F } from "f";',
				'export * from "g";',
				"const ignored = import(variable);",
			].join("\n"),
		);
		expect(specs).toEqual(["a", "b", "c", "d", "e", "f", "g"]);
	});
});

describe("featureNameOf", () => {
	it("returns the feature for files under features/<name>", () => {
		expect(featureNameOf(f("features/projects/x.ts"), APP_ROOT)).toBe("projects");
		expect(featureNameOf(f("features/project-session/y.ts"), APP_ROOT)).toBe("project-session");
	});
	it("returns null for non-feature files", () => {
		expect(featureNameOf(f("core/z.ts"), APP_ROOT)).toBeNull();
		expect(featureNameOf(f("app.component.ts"), APP_ROOT)).toBeNull();
	});
});
