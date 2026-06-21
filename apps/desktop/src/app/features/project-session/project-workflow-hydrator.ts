import { Injectable, inject } from "@angular/core";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import type { ProjectStatePayload } from "../../services/desktop-bridge.service";

/**
 * Input shape accepted by {@link DesktopGenerateStateService.loadProjectState}.
 *
 * Kept as a type alias so the canonical workflow hydration mapping stays
 * aligned with the legacy generation state service without importing its
 * runtime value into the mapper.
 */
export type ProjectWorkflowStateInput = Parameters<
	DesktopGenerateStateService["loadProjectState"]
>[0];

/**
 * Canonical mapping from a persisted {@link ProjectStatePayload} into the
 * legacy generation workflow state input.
 *
 * This is the ONE place that translates a persisted project payload into the
 * shape consumed by `DesktopGenerateStateService.loadProjectState`. Callers
 * must not rebuild this mapping inline.
 *
 * Transitional: exists only while generation workflow state remains in the
 * legacy `DesktopGenerateStateService` (consolidated into the project-session
 * boundary in #76). See `docs/architecture/angular-refactor-follow-ups.md`.
 */
export function toGenerateWorkflowState(
	payload: ProjectStatePayload,
): ProjectWorkflowStateInput {
	return {
		sourcePath: payload.sourcePath,
		audioPath: payload.audioPath,
		outputDir: payload.outputDir,
		cover: payload.cover,
		sourceKind: payload.sourceKind,
		selectedTracks: payload.selectedTracks,
		metadata: payload.metadata,
		offsetMs: payload.offsetMs,
		lastGeneratedAt: payload.lastGeneratedAt,
		outputFiles: payload.outputFiles,
		mappingOverrides: payload.mappingOverrides,
		analysis: payload.analysis,
	};
}

/**
 * Hydrates the legacy generation workflow state from a persisted project
 * payload, using the canonical {@link toGenerateWorkflowState} mapping.
 *
 * Transitional service introduced by the #74 foundation to remove duplicated
 * open/create -> generation-state hydration sequences across the shell and
 * pages. It deliberately keeps the persistence boundary focused: persistence
 * hydrates `ProjectSessionStore`; this hydrator hydrates the generation
 * workflow. It is removed in #76 when generation becomes a feature and owns
 * its own hydration.
 */
@Injectable({ providedIn: "root" })
export class ProjectWorkflowHydrator {
	private readonly generateState: DesktopGenerateStateService;

	constructor(
		generateState: DesktopGenerateStateService = inject(
			DesktopGenerateStateService,
		),
	) {
		this.generateState = generateState;
	}

	/** Hydrates the generation workflow from a persisted project payload. */
	hydrate(payload: ProjectStatePayload): void {
		this.generateState.loadProjectState(toGenerateWorkflowState(payload));
	}
}
