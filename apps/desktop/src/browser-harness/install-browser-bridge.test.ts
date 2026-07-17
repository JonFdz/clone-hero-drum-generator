import { describe, expect, it } from "vitest";
import { createBrowserBridge, installBrowserBridge } from "./install-browser-bridge";
import { resolveBrowserScenario } from "./scenario-registry";

describe("browser bridge installation", () => {
	it("installs a complete bridge with deterministic startup responses", async () => {
		const target: { chdg?: Window["chdg"] } = {};
		const scenario = resolveBrowserScenario("empty");
		const bridge = installBrowserBridge(target, scenario);

		expect(target.chdg).toBe(bridge);
		expect(await bridge.getAppInfo()).toMatchObject({ mode: "browser-harness" });
		expect(await bridge.getHealth()).toMatchObject({ ok: true, mode: "browser-harness" });
		expect(await bridge.readSettings()).toMatchObject({ ok: true });
		expect(await bridge.readRecentProjects()).toEqual({ ok: true, data: [], issues: [] });
	});

	it("refuses to overwrite an existing bridge", () => {
		const target = { chdg: createBrowserBridge(resolveBrowserScenario("empty")) };
		expect(() =>
			installBrowserBridge(target, resolveBrowserScenario("project-loaded")),
		).toThrow('bridge installation: window.chdg is already defined');
	});

	it("rejects unsupported operations with the operation and scenario", async () => {
		const bridge = createBrowserBridge(resolveBrowserScenario("preview-ready"));
		await expect(bridge.pickSourceFile()).rejects.toThrow(
			'operation "pickSourceFile" is unsupported in scenario "preview-ready"',
		);
		await expect(bridge.generatePackage({} as never)).rejects.toThrow(
			'operation "generatePackage" is unsupported in scenario "preview-ready"',
		);
	});

	it("returns scenario-owned source data without reading its synthetic path", async () => {
		const bridge = createBrowserBridge(
			resolveBrowserScenario("source-review-ready"),
		);
		const fingerprint = await bridge.getSourceFingerprint(
			"C:\\CHDG-Harness\\Sources\\demo.mid",
		);
		expect(fingerprint).toMatchObject({
			ok: true,
			data: { path: "C:\\CHDG-Harness\\Sources\\demo.mid" },
		});
	});

	it("supports source-review autosave as a documented in-memory no-op", async () => {
		const scenario = resolveBrowserScenario("source-review-ready");
		const bridge = createBrowserBridge(scenario);
		const saved = await bridge.saveProject(scenario.project!);
		expect(saved).toMatchObject({
			ok: true,
			data: { filePath: scenario.project!.projectFilePath },
		});
	});
});
