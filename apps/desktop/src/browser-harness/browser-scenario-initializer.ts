import {
	inject,
	provideAppInitializer,
	type EnvironmentProviders,
} from "@angular/core";
import {
	ProjectSessionStore,
	ProjectWorkflowHydrator,
} from "../app/features/project-session/public-api";
import type { BrowserHarnessScenario } from "./browser-scenario";
import { BrowserHarnessGenerationSeeder } from "./browser-generation-seeder";

export interface BrowserHarnessSeedContext {
	session: Pick<ProjectSessionStore, "applyHydration">;
	workflowHydrator: Pick<ProjectWorkflowHydrator, "hydrate">;
	generationSeeder: Pick<BrowserHarnessGenerationSeeder, "seed">;
}

export function seedBrowserScenario(
	scenario: BrowserHarnessScenario,
	context: BrowserHarnessSeedContext,
): void {
	if (scenario.project) {
		context.session.applyHydration(scenario.project);
		context.workflowHydrator.hydrate(scenario.project);
	}
	if (scenario.generationSeed) {
		context.generationSeeder.seed(scenario.generationSeed);
	}
}

export function provideBrowserScenarioInitializer(
	scenario: BrowserHarnessScenario,
): EnvironmentProviders {
	return provideAppInitializer(() => {
		seedBrowserScenario(scenario, {
			session: inject(ProjectSessionStore),
			workflowHydrator: inject(ProjectWorkflowHydrator),
			generationSeeder: inject(BrowserHarnessGenerationSeeder),
		});
	});
}
