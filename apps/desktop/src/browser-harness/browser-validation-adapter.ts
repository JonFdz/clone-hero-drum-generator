import { Injectable, computed, inject } from "@angular/core";
import type { ValidationSummary } from "@chdg/project/browser";
import type { DesktopGenerateState } from "../app/services/desktop-generate-state.service";
import { DesktopGenerateStateService } from "../app/services/desktop-generate-state.service";
import type { DesktopProjectState } from "../app/services/desktop-project-state.service";
import { DesktopProjectStateService } from "../app/services/desktop-project-state.service";
import { buildDesktopValidationSummary } from "../app/services/desktop-validation-model";
import { HARNESS_TIMESTAMPS } from "./fixture-builders";

export function buildBrowserValidationSummary(
	generate: DesktopGenerateState,
	project: DesktopProjectState,
): ValidationSummary {
	return buildDesktopValidationSummary(
		generate,
		project,
		HARNESS_TIMESTAMPS.VALIDATED_AT,
	);
}

@Injectable()
export class BrowserHarnessValidationAdapter {
	private readonly generateState = inject(DesktopGenerateStateService);
	private readonly projectState = inject(DesktopProjectStateService);

	readonly summary = computed(() => this.buildSummary());

	validateNow(): ValidationSummary {
		return this.buildSummary();
	}

	private buildSummary(): ValidationSummary {
		return buildBrowserValidationSummary(
			this.generateState.state(),
			this.projectState.state(),
		);
	}
}
