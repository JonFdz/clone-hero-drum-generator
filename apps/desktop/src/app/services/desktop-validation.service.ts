import { Injectable, computed, inject } from "@angular/core";
import type { ValidationSummary } from "@chdg/project";
import { DesktopGenerateStateService } from "./desktop-generate-state.service";
import { DesktopProjectStateService } from "./desktop-project-state.service";
import { buildDesktopValidationSummary } from "./desktop-validation-model";

@Injectable({ providedIn: "root" })
export class DesktopValidationService {
	private readonly generateState = inject(DesktopGenerateStateService);
	private readonly projectState = inject(DesktopProjectStateService);

	readonly summary = computed(() =>
		buildDesktopValidationSummary(
			this.generateState.state(),
			this.projectState.state(),
		),
	);

	validateNow(): ValidationSummary {
		return buildDesktopValidationSummary(
			this.generateState.state(),
			this.projectState.state(),
		);
	}
}
