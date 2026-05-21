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
	isOffsetDirty,
	nudgeOffsetMs,
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

	readonly savedOffsetMs = computed(() => this.generateState.state().offsetMs ?? 0);
	readonly offsetDirty = computed(() =>
		isOffsetDirty(this.previewOffsetMs(), this.savedOffsetMs()),
	);
	readonly offsetDeltaMs = computed(
		() => this.previewOffsetMs() - this.savedOffsetMs(),
	);
	readonly canApplyOffset = computed(
		() => Number.isFinite(this.previewOffsetMs()) && this.offsetDirty(),
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
		this.offsetStatus.set(null);
		if (this.offsetDirty()) {
			this.projectState.markDirty();
		}
	}

	setPreviewOffsetInput(value: string): void {
		this.offsetInputMs.set(value);
		const parsed = Number(value);
		if (!Number.isFinite(parsed)) {
			this.offsetStatus.set("Offset must be a finite number of milliseconds.");
			return;
		}
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
		this.offsetStatus.set(null);
	}

	async applyOffset(): Promise<void> {
		const offsetMs = this.previewOffsetMs();
		if (!Number.isFinite(offsetMs)) {
			this.offsetStatus.set("Offset must be a finite number of milliseconds.");
			return;
		}

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
				this.projectState.markGenerated();
			} else {
				this.projectState.markNeedsRegenerate();
			}
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

		this.offsetStatus.set("Chart offset saved to project and notes.chart.");
		this.previewOffsetMs.set(offsetMs);
		this.offsetInputMs.set(String(offsetMs));
	}
}
