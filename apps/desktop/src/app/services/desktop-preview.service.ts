import { Injectable, computed, signal } from "@angular/core";
import {
	DesktopBridgeService,
	type ChartPreviewData,
} from "./desktop-bridge.service";
import { DesktopGenerateStateService } from "./desktop-generate-state.service";
import {
	HIGHWAY_HIT_LINE_PERCENT,
	deriveHighwayLimitations,
	deriveHighwayNotes,
	deriveTimelineNotes,
	formatTime,
} from "./desktop-preview-model";
import {
	buildWaveformOverview,
	type WaveformOverview,
} from "./desktop-waveform-overview";
import {
	canApplyOffset,
	isOffsetDirty,
	isOffsetInputValid,
	nudgeOffsetMs,
	resetOffsetToSaved,
	runtimeOffsetStatusMessage,
} from "./offset-preview-state";
import {
	resolvePreviewAnalysisCache,
	stableMappingFingerprint,
} from "./source-review-model";

@Injectable({ providedIn: "root" })
export class DesktopPreviewService {
	readonly audioSrc = signal<string | null>(null);
	readonly sourceKind = signal<"generated" | null>(null);
	readonly chartData = signal<ChartPreviewData | null>(null);
	readonly error = signal<string | null>(null);
	readonly currentTime = signal(0);
	readonly duration = signal(0);
	readonly previewOffsetMs = signal(0);
	readonly offsetInputMs = signal("0");
	readonly offsetStatus = signal<string | null>(null);
	readonly offsetInputValid = signal(true);
	readonly waveformOverview = signal<WaveformOverview | null>(null);
	readonly waveformStatus = signal<
		"idle" | "loading" | "ready" | "error" | "empty"
	>("idle");
	readonly waveformError = signal<string | null>(null);

	readonly savedOffsetMs = signal(0);
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
	readonly audioSourceLabel = computed(() => {
		const sourceKind = this.sourceKind();
		if (sourceKind === "generated") return "generated song.ogg";
		return "unknown";
	});
	readonly previewTitle = computed(
		() =>
			this.generateState.state().metadata.name?.trim() || "Untitled Project",
	);
	readonly previewSubtitle = computed(() => {
		const artist =
			this.generateState.state().metadata.artist?.trim() || "Unknown artist";
		return `${artist} • Expert Pro Drums`;
	});
	readonly previewNoteCount = computed(() => {
		const chartEvents = this.chartData()?.noteEvents;
		if (chartEvents?.length) {
			return chartEvents.filter((event) => event.lane >= 0 && event.lane <= 4)
				.length;
		}
		return 0;
	});
	readonly previewStatus = computed(() => {
		if (this.error() || !this.chartData() || !this.audioSrc())
			return "Preview unavailable";
		if (this.waveformStatus() === "loading") return "Loading waveform";
		if (this.waveformStatus() === "error")
			return "Preview ready · waveform unavailable";
		return "Preview up to date";
	});
	readonly highwayHitLinePercent = HIGHWAY_HIT_LINE_PERCENT;
	readonly timelineNotes = computed(() =>
		deriveTimelineNotes(
			this.chartData(),
			this.currentTime(),
			this.previewOffsetMs(),
		),
	);
	readonly highwayNotes = computed(() =>
		deriveHighwayNotes(
			this.chartData(),
			this.currentTime(),
			this.previewOffsetMs(),
		),
	);
	readonly highwayLimitations = computed(() =>
		deriveHighwayLimitations(this.chartData()),
	);
	readonly currentTimeText = computed(() => formatTime(this.currentTime()));
	readonly durationText = computed(() => formatTime(this.duration()));

	constructor(
		private readonly bridge: DesktopBridgeService,
		private readonly generateState: DesktopGenerateStateService,
	) {}

	async load(): Promise<void> {
		this.error.set(null);
		const initialOffsetMs = this.generateState.state().offsetMs ?? 0;
		this.savedOffsetMs.set(initialOffsetMs);
		this.previewOffsetMs.set(initialOffsetMs);
		this.offsetInputMs.set(String(initialOffsetMs));
		this.offsetStatus.set(null);
		this.offsetInputValid.set(true);
		const state = this.generateState.state();
		if (
			state.status === "idle" ||
			!state.outputFiles?.chart ||
			!state.outputFiles.songOgg
		) {
			this.setUnavailable(
				"Existing managed preview output is unavailable. The canonical export manifest must include both notes.chart and song.ogg.",
			);
			return;
		}

		let analysis = undefined;
		if (state.sourcePath && state.analysisCache) {
			const sourceFingerprint = await this.bridge.getSourceFingerprint(
				state.sourcePath,
			);
			if (sourceFingerprint.ok) {
				analysis = resolvePreviewAnalysisCache({
					cache: state.analysisCache,
					sourceFingerprint: sourceFingerprint.data,
					mappingFingerprint: stableMappingFingerprint(
						state.mappingOverrides,
					),
					selectedTracks: state.selectedTracks,
				});
			}
		}

		const chart = await this.bridge.getChartPreviewData({
			chartPath: state.outputFiles.chart,
			sourceTiming: state.sourceTiming,
			analysis,
		});
		if (!chart.ok) {
			this.setUnavailable(`Generated notes.chart unavailable: ${chart.error.message}`);
			return;
		}
		this.chartData.set(chart.data);

		const audio = await this.bridge.getAudioPreviewSource({
			generatedSongOggPath: state.outputFiles.songOgg,
		});
		if (!audio.ok) {
			this.setUnavailable(
				`Generated song.ogg unavailable: ${audio.error.message}`,
			);
			return;
		}
		this.audioSrc.set(audio.data.src);
		this.sourceKind.set(audio.data.sourceKind);
		await this.loadWaveform(audio.data.src);

	}

	handleAudioRuntimeError(message: string): void {
		this.setUnavailable(`Preview audio failed at runtime: ${message}`);
	}

	private setUnavailable(message: string): void {
		this.audioSrc.set(null);
		this.sourceKind.set(null);
		this.chartData.set(null);
		this.waveformOverview.set(null);
		this.waveformStatus.set("empty");
		this.waveformError.set(null);
		this.currentTime.set(0);
		this.duration.set(0);
		this.error.set(message);
	}

	nudgeOffset(deltaMs: number): void {
		const next = nudgeOffsetMs(this.previewOffsetMs(), deltaMs);
		this.previewOffsetMs.set(next);
		this.offsetInputMs.set(String(next));
		this.offsetInputValid.set(true);
		this.offsetStatus.set(null);
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

		this.savedOffsetMs.set(offsetMs);
		this.offsetStatus.set(runtimeOffsetStatusMessage());
		this.previewOffsetMs.set(offsetMs);
		this.offsetInputMs.set(String(offsetMs));
		this.offsetInputValid.set(true);
	}

	private async loadWaveform(audioSrc: string): Promise<void> {
		this.waveformStatus.set("loading");
		this.waveformError.set(null);
		this.waveformOverview.set(null);
		try {
			const response = await fetch(audioSrc);
			if (!response.ok) {
				throw new Error(`Waveform request failed (${response.status}).`);
			}
			const data = await response.arrayBuffer();
			const audioContext = new AudioContext();
			try {
				const audioBuffer = await audioContext.decodeAudioData(data);
				const channels: Float32Array[] = [];
				for (let index = 0; index < audioBuffer.numberOfChannels; index += 1) {
					channels.push(audioBuffer.getChannelData(index));
				}
				const overview = buildWaveformOverview({
					channels,
					durationSeconds: audioBuffer.duration,
					sampleRate: audioBuffer.sampleRate,
					bucketCount: 900,
				});
				this.waveformOverview.set(overview);
				if (!Number.isFinite(this.duration()) || this.duration() <= 0) {
					this.duration.set(overview.durationSeconds);
				}
				this.waveformStatus.set(
					overview.buckets.length > 0 ? "ready" : "empty",
				);
			} finally {
				await audioContext.close();
			}
		} catch (error) {
			this.waveformStatus.set("error");
			this.waveformError.set(
				error instanceof Error
					? error.message
					: "Could not decode waveform preview.",
			);
		}
	}
}
