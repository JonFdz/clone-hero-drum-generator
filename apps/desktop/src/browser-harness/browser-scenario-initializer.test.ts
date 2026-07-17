import { describe, expect, it, vi } from "vitest";
import { seedBrowserScenario } from "./browser-scenario-initializer";
import { resolveBrowserScenario } from "./scenario-registry";

function createContext() {
	return {
		session: { applyHydration: vi.fn() },
		workflowHydrator: { hydrate: vi.fn() },
		generationSeeder: { seed: vi.fn() },
	};
}

describe("browser scenario application-state seeding", () => {
	it("leaves active-project state untouched for the empty scenario", () => {
		const context = createContext();
		seedBrowserScenario(resolveBrowserScenario("empty"), context);
		expect(context.session.applyHydration).not.toHaveBeenCalled();
		expect(context.workflowHydrator.hydrate).not.toHaveBeenCalled();
	});

	it("hydrates project identity and workflow through public APIs", () => {
		const context = createContext();
		const scenario = resolveBrowserScenario("project-loaded");
		seedBrowserScenario(scenario, context);
		expect(context.session.applyHydration).toHaveBeenCalledWith(scenario.project);
		expect(context.workflowHydrator.hydrate).toHaveBeenCalledWith(
			scenario.project,
		);
	});

	it("uses narrow public generation transitions for running and failed states", () => {
		const running = createContext();
		seedBrowserScenario(resolveBrowserScenario("generate-running"), running);
		expect(running.generationSeeder.seed).toHaveBeenCalledWith("running");

		const failed = createContext();
		seedBrowserScenario(resolveBrowserScenario("generate-failed"), failed);
		expect(failed.generationSeeder.seed).toHaveBeenCalledWith("failed");
	});
});
