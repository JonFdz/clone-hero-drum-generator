import { Injectable, inject, signal } from "@angular/core";
import type { ValidationSummary } from "@chdg/project/browser";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import {
	DesktopGenerateStateService,
	type DesktopGenerateState,
} from "../../services/desktop-generate-state.service";
import {
	DesktopProjectStateService,
	type DesktopProjectState,
} from "../../services/desktop-project-state.service";
import { DesktopValidationService } from "../../services/desktop-validation.service";

export type GenerationReadiness = {
	canStart: boolean;
	canOpenOutput: boolean;
	canOpenPreview: boolean;
	label: string;
};

export type GenerationOutcome = { ok: false; error: string };

export type OutputFolderOutcome = { ok: true } | { ok: false; error: string };

export const GENERATION_UNAVAILABLE_MESSAGE =
	"Managed package generation is not available in this legacy workflow.";

export function canOpenCanonicalPreview(
	state: Pick<DesktopGenerateState, "outputFiles">,
	project: Pick<DesktopProjectState, "outputStatus" | "missingPaths">,
): boolean {
	if (project.outputStatus !== "generated") return false;
	if (!state.outputFiles?.chart || !state.outputFiles.songOgg) return false;
	return !project.missingPaths.some(
		(warning) =>
			warning.kind === "outputDir" ||
			warning.kind === "outputChartPath" ||
			warning.kind === "outputAudioPath",
	);
}

/**
 * Generation orchestration service.
 * Owns all bridge interaction for generation so the page/component never
 * imports DesktopBridgeService. Returns typed outcomes; does not navigate.
 */
@Injectable({ providedIn: "root" })
export class GenerationService {
	private readonly bridge = inject(DesktopBridgeService);
	private readonly generateState = inject(DesktopGenerateStateService);
	private readonly projectState = inject(DesktopProjectStateService);
	private readonly validationService = inject(DesktopValidationService);

	readonly autosaveWarning = signal<string | null>(null);

	refreshValidation(): ValidationSummary {
		return this.validationService.validateNow();
	}

	validateNow(): ValidationSummary {
		return this.validationService.validateNow();
	}

	readiness(): GenerationReadiness {
		const state = this.generateState.state();
		return {
			canStart: false,
			canOpenOutput: Boolean(
				state.generationResult?.outputDir ?? state.outputDir,
			),
			canOpenPreview: canOpenCanonicalPreview(
				state,
				this.projectState.state(),
			),
			label: "Generation Unavailable",
		};
	}

	generate(overwriteKnownFiles: boolean): Promise<GenerationOutcome> {
		void overwriteKnownFiles;
		this.autosaveWarning.set(GENERATION_UNAVAILABLE_MESSAGE);
		return Promise.resolve({
			ok: false,
			error: GENERATION_UNAVAILABLE_MESSAGE,
		});
	}

	async openOutputFolder(): Promise<OutputFolderOutcome> {
		const outputDir =
			this.generateState.state().generationResult?.outputDir ??
			this.generateState.state().outputDir;
		if (!outputDir) return { ok: false, error: "No output directory." };
		try {
			const envelope = await this.bridge.openOutputFolder(outputDir);
			if (!envelope.ok) {
				this.generateState.applyError(envelope.error.message, envelope.issues);
				return { ok: false, error: envelope.error.message };
			}
			return { ok: true };
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Open output folder failed.";
			this.generateState.applyError(message);
			return { ok: false, error: message };
		}
	}

}
