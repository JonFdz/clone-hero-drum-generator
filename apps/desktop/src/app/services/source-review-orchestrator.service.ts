import { Injectable, inject, signal } from "@angular/core";
import type {
	ChdgProjectAnalysisCache,
	ChdgSourceFingerprint,
	JsonEnvelope,
	NormalizationPreview,
	SourceInspectionResult,
} from "@chdg/project/browser";
import { DesktopBridgeService } from "./desktop-bridge.service";
import { DesktopGenerateStateService } from "./desktop-generate-state.service";
import { DesktopProjectStateService } from "./desktop-project-state.service";
import {
	createAnalysisCache,
	stableMappingFingerprint,
	strongestDefaultTrack,
	validateSourceReviewCache,
} from "./source-review-model";

export type SourceReviewStatus =
	| "idle"
	| "analyzing"
	| "updating"
	| "up-to-date"
	| "attention"
	| "failed";

@Injectable({ providedIn: "root" })
export class SourceReviewOrchestratorService {
	private readonly bridge = inject(DesktopBridgeService);
	private readonly generateState = inject(DesktopGenerateStateService);
	private readonly projectState = inject(DesktopProjectStateService);
	private runId = 0;
	private currentSourceKey = "";

	readonly status = signal<SourceReviewStatus>("idle");
	readonly autosaveWarning = signal<string | undefined>(undefined);

	async reviewCurrentSource(): Promise<void> {
		const sourcePath = this.generateState.state().sourcePath;
		if (!sourcePath) {
			this.status.set("idle");
			return;
		}
		const runId = ++this.runId;
		this.autosaveWarning.set(undefined);
		this.status.set("analyzing");
		try {
			const sourceFingerprint = await this.readSourceFingerprint(sourcePath);
			if (!this.isCurrentRun(runId)) return;
			const sourceKey = JSON.stringify(sourceFingerprint);
			if (sourceKey !== this.currentSourceKey) {
				this.currentSourceKey = sourceKey;
			}
			const current = this.generateState.state();
			const mappingFingerprint = stableMappingFingerprint(
				current.mappingOverrides,
			);
			const selectedTracks = current.selectedTracks;
			const cacheResult = validateSourceReviewCache({
				cache: current.analysisCache,
				sourceFingerprint,
				mappingFingerprint,
				selectedTracks,
			});
			if (cacheResult.valid) {
				this.generateState.applySourceReviewCache(current.analysisCache!);
				this.status.set("up-to-date");
				return;
			}

			let inspection = current.analysisCache?.inspection;
			if (cacheResult.reason === "source" || !inspection) {
				this.generateState.startInspecting();
				const envelope = await this.bridge.inspectSource({
					sourcePath,
					drumsOnly: true,
				});
				if (!this.isCurrentRun(runId)) return;
				if (!envelope.ok) {
					this.generateState.applyError(
						envelope.error.message,
						envelope.issues,
					);
					this.status.set("failed");
					return;
				}
				inspection = envelope.data;
				const tracksToSelect = current.selectedTracks.length > 0
					? current.selectedTracks
					: strongestDefaultTrack(inspection.tracks);
				this.generateState.applyInspectionWithSelection(
					envelope,
					tracksToSelect,
				);
			} else {
				this.generateState.applyCachedInspection(inspection);
			}

			const normalized = await this.normalizeAndCache({
				runId,
				sourceFingerprint,
				inspection,
				visibleStatus: "analyzing",
			});
			if (normalized) this.status.set("up-to-date");
		} catch (error) {
			if (!this.isCurrentRun(runId)) return;
			this.generateState.applyError(
				error instanceof Error ? error.message : "Source review failed.",
			);
			this.status.set("failed");
		}
	}

	async changeSelectedTracks(selectedTracks: number[]): Promise<void> {
		this.generateState.setSelectedTracks(selectedTracks);
		await this.renormalizeCurrent("updating");
	}

	async toggleTrack(trackIndex: number): Promise<void> {
		const current = this.generateState.state().selectedTracks;
		const selectedTracks = current.includes(trackIndex)
			? current.filter((index) => index !== trackIndex)
			: [...current, trackIndex].sort((a, b) => a - b);
		await this.changeSelectedTracks(selectedTracks);
	}

	async mappingChanged(): Promise<void> {
		await this.renormalizeCurrent("updating");
	}

	private async renormalizeCurrent(status: SourceReviewStatus): Promise<void> {
		const runId = ++this.runId;
		const state = this.generateState.state();
		if (
			!state.sourcePath ||
			!state.inspection ||
			state.selectedTracks.length === 0
		) {
			return;
		}
		this.status.set(status);
		try {
			const sourceFingerprint = await this.readSourceFingerprint(
				state.sourcePath,
			);
			if (!this.isCurrentRun(runId)) return;
			const normalized = await this.normalizeAndCache({
				runId,
				sourceFingerprint,
				inspection: state.inspection,
				visibleStatus: status,
			});
			if (normalized) this.status.set("up-to-date");
		} catch (error) {
			if (!this.isCurrentRun(runId)) return;
			this.generateState.applyError(
				error instanceof Error ? error.message : "Source review update failed.",
			);
			this.status.set("failed");
		}
	}

	private async normalizeAndCache(input: {
		runId: number;
		sourceFingerprint: ChdgSourceFingerprint;
		inspection: SourceInspectionResult;
		visibleStatus: SourceReviewStatus;
	}): Promise<boolean> {
		const state = this.generateState.state();
		if (!state.sourcePath || state.selectedTracks.length === 0) {
			this.generateState.setAnalysisCache(
				createAnalysisCache({
					sourceFingerprint: input.sourceFingerprint,
					mappingFingerprint: stableMappingFingerprint(state.mappingOverrides),
					selectedTracks: [],
					inspection: input.inspection,
				}),
			);
			return false;
		}
		this.generateState.startNormalizing();
		const normalizeInput = this.generateState.buildNormalizeInput();
		if (!normalizeInput) return false;
		const envelope = await this.bridge.normalizeSelection(normalizeInput);
		if (!this.isCurrentRun(input.runId)) return false;
		if (!envelope.ok) {
			this.generateState.applyError(envelope.error.message, envelope.issues);
			this.status.set("failed");
			return false;
		}
		this.generateState.applyNormalization(envelope);
		this.persistAnalysisCache(
			input.sourceFingerprint,
			input.inspection,
			envelope,
		);
		return true;
	}

	private persistAnalysisCache(
		sourceFingerprint: ChdgSourceFingerprint,
		inspection: SourceInspectionResult,
		envelope: JsonEnvelope<NormalizationPreview>,
	): void {
		if (!envelope.ok) return;
		const state = this.generateState.state();
		const now = new Date().toISOString();
		const cache = createAnalysisCache({
			sourceFingerprint,
			mappingFingerprint: stableMappingFingerprint(state.mappingOverrides),
			selectedTracks: state.selectedTracks,
			inspection,
			normalizationPreview: envelope.data,
			inspectedAt: state.analysisCache?.inspectedAt ?? now,
			normalizedAt: now,
		});
		this.generateState.setAnalysisCache(cache);
		void this.autosaveAnalysis(cache);
	}

	private async autosaveAnalysis(
		_cache: ChdgProjectAnalysisCache,
	): Promise<void> {
		const project = this.projectState.state();
		if (!project.projectFilePath) return;
		const payload = this.generateState.buildProjectStatePayload(
			project.projectName,
			project.projectFilePath,
		);
		const saved = await this.projectState.saveProject(payload);
		if (!saved) {
			this.autosaveWarning.set("Analysis updated, but autosave failed.");
		}
	}

	private async readSourceFingerprint(
		sourcePath: string,
	): Promise<ChdgSourceFingerprint> {
		const envelope = await this.bridge.getSourceFingerprint(sourcePath);
		if (!envelope.ok) {
			return { path: sourcePath };
		}
		return envelope.data;
	}

	private isCurrentRun(runId: number): boolean {
		return runId === this.runId;
	}
}
