import { Injectable, computed, signal } from "@angular/core";
import {
	DesktopBridgeService,
	type ChartPreviewData,
} from "./desktop-bridge.service";
import { DesktopGenerateStateService } from "./desktop-generate-state.service";
import {
	buildWaveformBars,
	deriveHighwayLimitations,
	deriveHighwayNotes,
	deriveTimelineNotes,
	formatTime,
} from "./desktop-preview-model";

@Injectable({ providedIn: "root" })
export class DesktopPreviewService {
	readonly audioSrc = signal<string | null>(null);
	readonly sourceKind = signal<"generated" | "selected-audio" | null>(null);
	readonly chartData = signal<ChartPreviewData | null>(null);
	readonly error = signal<string | null>(null);
	readonly currentTime = signal(0);
	readonly duration = signal(0);

	readonly waveformBars = computed(() => buildWaveformBars(this.duration()));
	readonly timelineNotes = computed(() =>
		deriveTimelineNotes(
			this.chartData(),
			this.generateState.state().normalizationPreview,
			this.duration(),
			this.currentTime(),
		),
	);
	readonly highwayNotes = computed(() =>
		deriveHighwayNotes(
			this.chartData(),
			this.generateState.state().normalizationPreview,
			this.currentTime(),
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
	) {}

	async load(): Promise<void> {
		this.error.set(null);
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
}
