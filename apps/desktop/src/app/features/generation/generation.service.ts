import { Injectable, inject, signal } from "@angular/core";
import type {
	GeneratePackageResult,
	ValidationSummary,
} from "@chdg/project/browser";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { DesktopProjectStateService } from "../../services/desktop-project-state.service";
import { DesktopValidationService } from "../../services/desktop-validation.service";

export type GenerationReadiness = {
	canStart: boolean;
	canOpenOutput: boolean;
	canOpenPreview: boolean;
	label: string;
};

export type GenerationOutcome =
	| { ok: true; result: GeneratePackageResult }
	| { ok: false; error: string }
	| { ok: false; needsOverwriteConfirmation: true; message: string };

export type OutputFolderOutcome = { ok: true } | { ok: false; error: string };

/**
 * Generation orchestration service.
 * Owns all bridge interaction for generation so the page/component never
 * imports DesktopBridgeService. Returns typed outcomes; does not navigate.
 */
@Injectable({ providedIn: "root" })
export class GenerationService {
	private readonly bridge = inject(DesktopBridgeService);
	private readonly generateState = inject(DesktopGenerateStateService);
	private readonly validationService = inject(DesktopValidationService);
	private readonly projectState = inject(DesktopProjectStateService);

	readonly autosaveWarning = signal<string | null>(null);

	refreshValidation(): ValidationSummary {
		return this.validationService.validateNow();
	}

	validateNow(): ValidationSummary {
		return this.validationService.validateNow();
	}

	readiness(): GenerationReadiness {
		const state = this.generateState.state();
		const summary = this.validationService.validateNow();
		return {
			canStart: state.status !== "generating" && summary.canGenerate,
			canOpenOutput: Boolean(
				state.generationResult?.outputDir ?? state.outputDir,
			),
			canOpenPreview: Boolean(state.generationResult),
			label: state.generationResult ? "Regenerate" : "Start Generate",
		};
	}

	async generate(overwriteKnownFiles: boolean): Promise<GenerationOutcome> {
		this.autosaveWarning.set(null);
		const summary = this.validateNow();
		if (!summary.canGenerate) {
			return {
				ok: false,
				error: summary.items
					.filter((item) => item.blocking)
					.map((item) => item.message)
					.join(" "),
			};
		}

		const input = this.generateState.buildGenerateInput(overwriteKnownFiles);
		if (!input) {
			return { ok: false, error: "Generation input is incomplete." };
		}

		this.generateState.startGenerating();
		try {
			const envelope = await this.bridge.generatePackage(input);
			if (
				!envelope.ok &&
				envelope.error.code === "OVERWRITE_CONFIRMATION_REQUIRED" &&
				!overwriteKnownFiles
			) {
				return {
					ok: false,
					needsOverwriteConfirmation: true,
					message: envelope.error.message,
				};
			}
			this.generateState.applyGeneration(envelope);
			if (envelope.ok) {
				await this.autosaveGenerationResult();
			}
			if (envelope.ok) {
				return { ok: true, result: envelope.data };
			}
			return { ok: false, error: envelope.error.message };
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Generation failed.";
			this.generateState.applyError(message);
			return { ok: false, error: message };
		}
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

	private async autosaveGenerationResult(): Promise<void> {
		const project = this.projectState.state();
		if (!project.projectFilePath) return;

		const payload = this.generateState.buildProjectStatePayload(
			project.projectName,
			project.projectFilePath,
		);
		const saved = await this.projectState.saveProject(payload);
		if (!saved) {
			this.autosaveWarning.set(
				"Generation completed, but CHDG could not autosave the project file. Use Save to persist the generated output status.",
			);
		}
	}
}
