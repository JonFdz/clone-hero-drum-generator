import { Injectable, computed, signal } from "@angular/core";
import {
	DesktopBridgeService,
	type ChartPreviewData,
} from "./desktop-bridge.service";
import { DesktopGenerateStateService } from "./desktop-generate-state.service";
import { DesktopProjectStateService } from "./desktop-project-state.service";
import {
	HIGHWAY_HIT_LINE_PERCENT,
	buildWaveformBars,
	deriveHighwayLimitations,
	deriveHighwayNotes,
	deriveTimelineNotes,
	formatTime,
} from "./desktop-preview-model";
import {
	canApplyOffset,
	isOffsetDirty,
	isOffsetInputValid,
	nudgeOffsetMs,
	offsetApplyStatusMessage,
	resetOffsetToSaved,
} from "./offset-preview-state";

@Injectable({ providedIn: "root" })
export class DesktopPreviewService {
	readonly audioSrc = signal<string | null>(null);
	readonly sourceKind = signal<"generated" | "selected-audio" | null>(null);
	readonly chartData = signal<ChartPreviewData | null>(null);
	readonly error = signal<string | null>(null);
	readonly currentTime = signal(0);
	readonly duration = signal(0);
	readonly previewOffsetMs = signal(0);
	readonly offsetInputMs = signal("0");
	readonly offsetStatus = signal<string | null>(null);
	readonly offsetInputValid = signal(true);

	readonly savedOffsetMs = computed(() => this.generateState.state().offsetMs ?? 0);
	readonly offsetDirty = computed(() =>
		isOffsetDirty(this.previewOffsetMs(), this.savedOffsetMs()),
	);
	readonly offsetDeltaMs = computed(
		() => this.previewOffsetMs() - this.savedOffsetMs(),
	);
	readonly canApplyOffset = computed(() =>
		canApplyOffset({
			inputValid: this.offsetInputValid(),
			previewOffsetMs: this.previewOffsetMs(),
			savedOffsetMs: this.savedOffsetMs(),
		}),
	);
	readonly waveformBars = computed(() => buildWaveformBars(this.duration()));
	readonly highwayHitLinePercent = HIGHWAY_HIT_LINE_PERCENT;
	readonly timelineNotes = computed(() =>
		deriveTimelineNotes(
			this.chartData(),
			this.generateState.state().normalizationPreview,
			this.duration(),
			this.currentTime(),
			this.previewOffsetMs(),
		),
	);
	readonly highwayNotes = computed(() =>
		deriveHighwayNotes(
			this.chartData(),
			this.generateState.state().normalizationPreview,
			this.currentTime(),
			this.duration(),
			this.previewOffsetMs(),
		),
	);
	readonly highwayLimitations = computed(() =>
		deriveHighwayLimitations(
			this.chartData(),
			this.generateState.state().normalizationPreview,
		),
	);
	readonly currentTimeText = computed(() => formatTime(this.currentTime()));
	readonly durationText = computed(() => formatTime(this.duration()));

	constructor(
		private readonly bridge: DesktopBridgeService,
		private readonly generateState: DesktopGenerateStateService,
		private readonly projectState: DesktopProjectStateService,
	) {}

	async load(): Promise<void> {
		this.error.set(null);
		this.previewOffsetMs.set(this.savedOffsetMs());
		this.offsetInputMs.set(String(this.savedOffsetMs()));
		this.offsetStatus.set(null);
		this.offsetInputValid.set(true);
		const state = this.generateState.state();
		const audio = await this.bridge.getAudioPreviewSource({
			outputDir: state.outputDir,
			generatedSongOggPath: state.outputFiles?.songOgg,
			selectedAudioPath: state.audioPath,
		});
		if (!audio.ok) {
			this.audioSrc.set(null);
			this.sourceKind.set(null);
			this.error.set(audio.error.message);
			return;
		}
		this.audioSrc.set(audio.data.src);
		this.sourceKind.set(audio.data.sourceKind);

		const chart = await this.bridge.getChartPreviewData({
			outputDir: state.outputDir,
			chartPath: state.outputFiles?.chart,
		});
		if (chart.ok) {
			this.chartData.set(chart.data);
		} else {
			this.chartData.set(null);
		}
	}

	nudgeOffset(deltaMs: number): void {
		const next = nudgeOffsetMs(this.previewOffsetMs(), deltaMs);
		this.previewOffsetMs.set(next);
		this.offsetInputMs.set(String(next));
		this.offsetInputValid.set(true);
		this.offsetStatus.set(null);
		if (this.offsetDirty()) {
			this.projectState.markDirty();
		}
	}

	setPreviewOffsetInput(value: string): void {
		this.offsetInputMs.set(value);
		const parsed = Number(value);
		if (!isOffsetInputValid(value) || !Number.isFinite(parsed)) {
			this.offsetInputValid.set(false);
			this.offsetStatus.set("Offset must be a finite number of milliseconds.");
			return;
		}
		this.offsetInputValid.set(true);
		this.previewOffsetMs.set(parsed);
		this.offsetStatus.set(null);
		if (this.offsetDirty()) {
			this.projectState.markDirty();
		}
	}

	resetPreviewOffset(): void {
		const saved = resetOffsetToSaved(this.savedOffsetMs());
		this.previewOffsetMs.set(saved);
		this.offsetInputMs.set(String(saved));
		this.offsetInputValid.set(true);
		this.offsetStatus.set(null);
	}

	async applyOffset(): Promise<void> {
		if (!this.offsetInputValid()) {
			this.offsetStatus.set("Offset must be a finite number of milliseconds.");
			return;
		}

		const offsetMs = this.previewOffsetMs();
		if (!Number.isFinite(offsetMs)) {
			this.offsetStatus.set("Offset must be a finite number of milliseconds.");
			return;
		}

		let chartUpdated = false;
		let chartMissing = false;
		let outputMissing = false;

		this.generateState.setOffsetMsInput(String(offsetMs));
		const state = this.generateState.state();
		if (state.outputDir) {
			if (state.outputFiles?.chart) {
				const chartUpdate = await this.bridge.applyChartOffset({
					outputDir: state.outputDir,
					chartPath: state.outputFiles.chart,
					offsetMs,
				});
				if (!chartUpdate.ok) {
					this.offsetStatus.set(`Failed to update notes.chart Offset: ${chartUpdate.error.message}`);
					this.projectState.markFailed();
					return;
				}
				chartUpdated = true;
				this.projectState.markGenerated();
			} else {
				chartMissing = true;
				this.projectState.markNeedsRegenerate();
			}
		} else {
			outputMissing = true;
			this.projectState.markNeedsRegenerate();
		}

		const project = this.projectState.state();
		const payload = this.generateState.buildProjectStatePayload(
			project.projectName,
			project.projectFilePath,
		);
		const savedPath = await this.projectState.saveProject(payload);
		if (!savedPath) {
			this.offsetStatus.set("Offset applied in state but project save failed.");
			return;
		}

		if (chartUpdated) {
			this.offsetStatus.set(offsetApplyStatusMessage("project-and-chart"));
		} else if (chartMissing) {
			this.offsetStatus.set(
				offsetApplyStatusMessage("project-only-chart-missing"),
			);
		} else if (outputMissing) {
			this.offsetStatus.set(
				offsetApplyStatusMessage("project-only-output-missing"),
			);
		} else {
			this.offsetStatus.set(offsetApplyStatusMessage("project-only"));
		}
		this.previewOffsetMs.set(offsetMs);
		this.offsetInputMs.set(String(offsetMs));
		this.offsetInputValid.set(true);
	}
}
