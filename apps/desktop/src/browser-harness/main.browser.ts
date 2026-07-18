import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { AppComponent } from "../app/app.component";
import { routes } from "../app/app.routes";
import { DesktopValidationService } from "../app/services/desktop-validation.service";
import { parseBrowserHarnessQuery } from "./browser-harness-query";
import { attachBrowserHarnessChrome } from "./browser-harness-chrome";
import { BrowserHarnessGenerationSeeder } from "./browser-generation-seeder";
import { BrowserHarnessValidationAdapter } from "./browser-validation-adapter";
import { provideBrowserScenarioInitializer } from "./browser-scenario-initializer";
import { installBrowserBridge } from "./install-browser-bridge";
import { resolveBrowserScenario } from "./scenario-registry";

const query = parseBrowserHarnessQuery(new URLSearchParams(window.location.search));
const scenario = resolveBrowserScenario(query.scenario);
installBrowserBridge(window, scenario);

bootstrapApplication(AppComponent, {
	providers: [
		provideRouter(routes, withComponentInputBinding()),
		BrowserHarnessGenerationSeeder,
		{
			provide: DesktopValidationService,
			useClass: BrowserHarnessValidationAdapter,
		},
		provideBrowserScenarioInitializer(scenario),
	],
})
	.then(() => attachBrowserHarnessChrome(document, scenario.id, query.harnessUi))
	.catch((error: unknown) => console.error(error));
