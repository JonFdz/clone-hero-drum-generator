import { Injectable, inject } from "@angular/core";
import {
	DesktopGenerateStateService,
	type DesktopGenerateState,
} from "../app/services/desktop-generate-state.service";
import type { BrowserGenerationSeed } from "./browser-scenario";

export function buildBrowserGenerationState(
	current: DesktopGenerateState,
	seed: BrowserGenerationSeed,
): DesktopGenerateState {
	if (seed === "ready") {
		return {
			...current,
			status: "ready-to-generate",
			logs: ["[HARNESS] Deterministic project inputs are ready."],
			errorMessage: undefined,
		};
	}
	if (seed === "running") {
		return {
			...current,
			status: "generating",
			logs: [
				"[HARNESS] Validating deterministic project inputs.",
				"[HARNESS] Writing synthetic Clone Hero package.",
			],
			errorMessage: undefined,
		};
	}
	return {
		...current,
		status: "error",
		errorMessage:
			"Synthetic generation failure: output validation rejected notes.chart.",
		logs: [
			"[HARNESS] Validating deterministic project inputs.",
			"[HARNESS] Error: output validation rejected notes.chart.",
		],
	};
}

@Injectable()
export class BrowserHarnessGenerationSeeder {
	private readonly generateState = inject(DesktopGenerateStateService);

	seed(seed: BrowserGenerationSeed): void {
		this.generateState.state.set(
			buildBrowserGenerationState(this.generateState.state(), seed),
		);
	}
}
