import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const desktopRoot = fileURLToPath(new URL("../../", import.meta.url));

function readJson(path: string): unknown {
	return JSON.parse(readFileSync(resolve(desktopRoot, path), "utf8"));
}

describe("browser harness build boundary", () => {
	it("uses a dedicated browser entry and loopback-only serve target", () => {
		const angular = readJson("angular.json") as {
			cli?: { cache?: { enabled?: boolean } };
			projects: {
				desktop: {
					architect: {
						build: {
							options: { outputPath: string; browser: string };
							configurations: Record<
								string,
								{
									baseHref?: string;
									browser?: string;
									outputPath?: string;
									tsConfig?: string;
								}
							>;
						};
						serve: { configurations: Record<string, { buildTarget?: string }> };
					};
				};
			};
		};
		const pkg = readJson("package.json") as { scripts: Record<string, string> };
		const build = angular.projects.desktop.architect.build;

		expect(
			build.configurations["browser-harness"].browser,
		).toBe("src/browser-harness/main.browser.ts");
		expect(
			build.configurations["browser-harness"].tsConfig,
		).toBe("tsconfig.browser-harness.json");
		expect(
			build.configurations["browser-harness"].baseHref,
		).toBe("/");
		expect(build.options.outputPath).toBe("dist/renderer");
		expect(build.configurations["browser-harness"].outputPath).toBe(
			"dist/browser-harness",
		);
		expect(build.configurations["browser-harness"].outputPath).not.toBe(
			build.options.outputPath,
		);
		expect(angular.cli?.cache?.enabled).not.toBe(false);
		expect(
			angular.projects.desktop.architect.serve.configurations["browser-harness"]
				.buildTarget,
		).toBe("desktop:build:browser-harness");
		expect(pkg.scripts["dev:browser"]).toContain("--host 127.0.0.1");
		expect(pkg.scripts["dev:browser"]).toContain("--port 4200");
		expect(pkg.scripts["build:browser"]).toBe(
			"CI=1 ng build --configuration browser-harness",
		);
		expect(pkg.scripts["build:renderer"]).toBe(
			"CI=1 ng build --configuration production",
		);
		expect(pkg.scripts["typecheck"]).toContain(
			"CI=1 ng build --configuration development",
		);
		expect(pkg.scripts["dev:browser"]).toMatch(/^CI=1 ng serve /);
	});

	it("keeps the production entry isolated from browser-harness imports", () => {
		const angular = readJson("angular.json") as {
			projects: {
				desktop: { architect: { build: { options: { browser: string } } } };
			};
		};
		const productionMain = readFileSync(resolve(desktopRoot, "src/main.ts"), "utf8");

		expect(angular.projects.desktop.architect.build.options.browser).toBe(
			"src/main.ts",
		);
		expect(productionMain).not.toContain("browser-harness");

		const electronMain = readFileSync(
			resolve(desktopRoot, "electron/main.ts"),
			"utf8",
		);
		expect(electronMain).toContain(
			'path.join(__dirname, "../renderer/browser/index.html")',
		);
		expect(electronMain).not.toContain("browser-harness/browser/index.html");
	});

	it("installs the browser bridge before Angular starts", () => {
		const browserMain = readFileSync(
			resolve(desktopRoot, "src/browser-harness/main.browser.ts"),
			"utf8",
		);
		const bridgeInstallIndex = browserMain.indexOf(
			"installBrowserBridge(window, scenario);",
		);
		const angularBootstrapIndex = browserMain.indexOf(
			"bootstrapApplication(AppComponent",
		);

		expect(bridgeInstallIndex).toBeGreaterThan(-1);
		expect(angularBootstrapIndex).toBeGreaterThan(-1);
		expect(bridgeInstallIndex).toBeLessThan(angularBootstrapIndex);
	});
});
