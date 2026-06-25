import { CommonModule } from "@angular/common";
import {
	type AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	type ElementRef,
	type OnDestroy,
	signal,
	ViewChild,
} from "@angular/core";
import { DesktopPreviewService } from "../../services/desktop-preview.service";
import { PreviewChartStageComponent } from "./components/preview-chart-stage/preview-chart-stage.component";
import { PreviewHighwayComponent } from "./components/preview-highway/preview-highway.component";
import { PreviewOffsetPanelComponent } from "./components/preview-offset-panel/preview-offset-panel.component";
import { PreviewTransportCardComponent } from "./components/preview-transport-card/preview-transport-card.component";
import {
	HIGHWAY_SPEED_PRESETS,
	type HighwaySpeedPresetId,
} from "./highway/highway-model";
import { HIGHWAY_STAGE_VISUAL_PROFILE } from "./highway/highway-stage-visual-profile";

type PreviewVisualMode = "chart" | "highway";

@Component({
	selector: "chdg-preview-page",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule,
		PreviewChartStageComponent,
		PreviewHighwayComponent,
		PreviewOffsetPanelComponent,
		PreviewTransportCardComponent,
	],
	templateUrl: "./preview-page.component.html",
	styleUrl: "./preview-page.component.css",
})
export class PreviewPageComponent implements AfterViewInit, OnDestroy {
	@ViewChild("audio") private readonly audioRef?: ElementRef<HTMLAudioElement>;
	readonly isPlaying = signal(false);
	readonly visualMode = signal<PreviewVisualMode>("chart");
	readonly highwayPreset = signal<HighwaySpeedPresetId>("normal");
	readonly highwayHudEnabled = signal(HIGHWAY_STAGE_VISUAL_PROFILE.hud.enabledByDefault);
	readonly highwayPresets = HIGHWAY_SPEED_PRESETS;
	readonly previewSeekEpoch = signal(0);
	private animationFrameId: number | null = null;

	constructor(readonly preview: DesktopPreviewService) {}

	async ngAfterViewInit(): Promise<void> {
		await this.preview.load();
	}

	ngOnDestroy(): void {
		this.stopPlaybackAnimation();
	}

	async play(): Promise<void> {
		await this.audioRef?.nativeElement.play();
	}

	pause(): void {
		this.audioRef?.nativeElement.pause();
	}

	seek(value: number): void {
		if (!Number.isFinite(value)) return;
		if (this.audioRef?.nativeElement) {
			const duration =
				this.audioRef.nativeElement.duration || this.preview.duration();
			const clamped = this.clampTime(value, duration);
			this.audioRef.nativeElement.currentTime = clamped;
			this.preview.currentTime.set(clamped);
			this.previewSeekEpoch.update((epoch) => epoch + 1);
		}
	}

	onLoadedMetadata(): void {
		if (!this.audioRef?.nativeElement) return;
		this.preview.duration.set(this.audioRef.nativeElement.duration || 0);
	}

	onTimeUpdate(): void {
		this.syncCurrentTimeFromAudio();
	}

	onAudioPlay(): void {
		this.isPlaying.set(true);
		this.syncCurrentTimeFromAudio();
		this.startPlaybackAnimation();
	}

	onAudioPause(): void {
		this.stopPlaybackAnimation();
		this.syncCurrentTimeFromAudio();
		this.isPlaying.set(false);
	}

	onAudioEnded(): void {
		this.stopPlaybackAnimation();
		this.syncCurrentTimeFromAudio();
		this.isPlaying.set(false);
	}

	onAudioError(): void {
		this.stopPlaybackAnimation();
		this.isPlaying.set(false);
		this.preview.handleAudioRuntimeError("Audio failed to load.");
	}

	async applyOffset(): Promise<void> {
		await this.preview.applyOffset();
		await this.preview.load();
	}

	formatDiagnosticTime(seconds: number | undefined): string {
		if (seconds === undefined || !Number.isFinite(seconds) || seconds < 0) {
			return "Unavailable";
		}
		const minutes = Math.floor(seconds / 60);
		const remaining = seconds - minutes * 60;
		return `${String(minutes).padStart(2, "0")}:${remaining.toFixed(3).padStart(6, "0")}`;
	}

	formatOffsetMilliseconds(offsetSeconds: number): number {
		return Math.round(offsetSeconds * 1000);
	}

	setVisualMode(mode: PreviewVisualMode): void {
		this.visualMode.set(mode);
	}

	setHighwayPreset(preset: HighwaySpeedPresetId): void {
		this.highwayPreset.set(preset);
	}

	setHighwayHudEnabled(enabled: boolean): void {
		this.highwayHudEnabled.set(enabled);
	}

	private startPlaybackAnimation(): void {
		if (this.animationFrameId !== null) return;
		const tick = () => {
			const audio = this.audioRef?.nativeElement;
			if (!audio || audio.paused || audio.ended) {
				this.stopPlaybackAnimation();
				this.syncCurrentTimeFromAudio();
				return;
			}
			this.preview.currentTime.set(audio.currentTime || 0);
			this.animationFrameId = requestAnimationFrame(tick);
		};
		this.animationFrameId = requestAnimationFrame(tick);
	}

	private stopPlaybackAnimation(): void {
		if (this.animationFrameId === null) return;
		cancelAnimationFrame(this.animationFrameId);
		this.animationFrameId = null;
	}

	private syncCurrentTimeFromAudio(): void {
		if (!this.audioRef?.nativeElement) return;
		this.preview.currentTime.set(this.audioRef.nativeElement.currentTime || 0);
	}

	private clampTime(value: number, duration: number): number {
		if (!Number.isFinite(value)) return 0;
		if (!Number.isFinite(duration) || duration <= 0) return Math.max(0, value);
		return Math.min(Math.max(value, 0), duration);
	}
}
