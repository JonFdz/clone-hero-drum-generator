import { CommonModule } from "@angular/common";
import {
	type AfterViewInit,
	Component,
	type ElementRef,
	type OnDestroy,
	signal,
	ViewChild,
} from "@angular/core";
import { DesktopPreviewService } from "../../services/desktop-preview.service";
import { PreviewChartStageComponent } from "./components/preview-chart-stage.component";
import { PreviewOffsetPanelComponent } from "./components/preview-offset-panel.component";
import { PreviewTransportCardComponent } from "./components/preview-transport-card.component";

@Component({
	selector: "chdg-preview-page",
	standalone: true,
	imports: [
		CommonModule,
		PreviewChartStageComponent,
		PreviewOffsetPanelComponent,
		PreviewTransportCardComponent,
	],
	template: `
		<header class="page-header preview-header">
			<div>
				<p class="eyebrow">Preview</p>
				<h1>Preview & Offset</h1>
				<p>Review generated notes against the audio waveform before export.</p>
			</div>
			<span class="status-pill" [class.warning]="preview.waveformStatus() === 'error'">
				● {{ preview.previewStatus() }}
			</span>
		</header>

		<section class="card message danger" *ngIf="preview.error(); else loaded">
			<h2>Preview unavailable</h2>
			<p>{{ preview.error() }}</p>
		</section>

		<ng-template #loaded>
			<ng-container *ngIf="preview.audioSrc(); else missingAudio">
				<audio
					#audio
					[src]="preview.audioSrc()!"
					(loadedmetadata)="onLoadedMetadata()"
					(timeupdate)="onTimeUpdate()"
					(play)="onAudioPlay()"
					(pause)="onAudioPause()"
					(ended)="onAudioEnded()"
					(error)="onAudioError()"
				></audio>

				<div class="preview-layout">
					<div class="preview-main">
						<chdg-preview-transport-card
							[title]="preview.previewTitle()"
							[subtitle]="preview.previewSubtitle()"
							[currentTime]="preview.currentTime()"
							[duration]="preview.duration()"
							[audioSourceLabel]="preview.audioSourceLabel()"
							[isPlaying]="isPlaying()"
							(play)="play()"
							(pause)="pause()"
							(seek)="seek($event)"
						/>

						<chdg-preview-chart-stage
							[waveformOverview]="preview.waveformOverview()"
							[chartData]="preview.chartData()"
							[normalizationPreview]="preview.normalizationPreview()"
							[currentTime]="preview.currentTime()"
							[duration]="preview.duration()"
							[previewOffsetMs]="preview.previewOffsetMs()"
							[audioSourceLabel]="preview.audioSourceLabel()"
							[noteCount]="preview.previewNoteCount()"
							[waveformStatus]="preview.waveformStatus()"
							[waveformError]="preview.waveformError()"
							(seek)="seek($event)"
						/>
					</div>

					<chdg-preview-offset-panel
						[previewOffsetMs]="preview.previewOffsetMs()"
						[savedOffsetMs]="preview.savedOffsetMs()"
						[offsetDeltaMs]="preview.offsetDeltaMs()"
						[offsetInputMs]="preview.offsetInputMs()"
						[offsetInputValid]="preview.offsetInputValid()"
						[offsetStatus]="preview.offsetStatus()"
						[canApplyOffset]="preview.canApplyOffset()"
						(nudge)="preview.nudgeOffset($event)"
						(inputOffset)="preview.setPreviewOffsetInput($event)"
						(resetPreview)="preview.resetPreviewOffset()"
						(resetToZero)="preview.setPreviewOffsetInput('0')"
						(apply)="applyOffset()"
					/>
				</div>
			</ng-container>
		</ng-template>

		<ng-template #missingAudio>
			<section class="card">
				<h2>No preview audio</h2>
				<p>No audio available for waveform preview. Generate output or choose project audio before opening Preview.</p>
			</section>
		</ng-template>
	`,
	styles: [
		`
			.preview-header { align-items: start; display: flex; gap: 1rem; justify-content: space-between; margin-bottom: 1rem; }
			.preview-header .eyebrow { margin-bottom: 0.35rem; }
			.preview-header h1 { font-size: clamp(1.45rem, 2vw, 2rem); margin-bottom: 0.35rem; max-width: 28rem; }
			.preview-header p { font-size: 0.95rem; margin-bottom: 0; }
			.status-pill { align-items: center; background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.25); border-radius: 999px; color: #22f06f; display: inline-flex; font-weight: 800; gap: 0.45rem; padding: 0.65rem 0.9rem; white-space: nowrap; }
			.status-pill.warning { background: rgba(246, 180, 80, 0.12); border-color: rgba(246, 180, 80, 0.3); color: #f6b450; }
			audio { display: none; }
			.preview-layout { align-items: start; display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr) minmax(18rem, 24rem); min-width: 0; }
			.preview-main { display: grid; gap: 1rem; min-width: 0; }
			chdg-preview-offset-panel { min-width: 0; }
			@media (max-width: 1500px) { .preview-layout { grid-template-columns: 1fr; } }
			@media (max-width: 760px) { .preview-header { display: grid; } }
		`,
	],
})
export class PreviewPageComponent implements AfterViewInit, OnDestroy {
	@ViewChild("audio") private readonly audioRef?: ElementRef<HTMLAudioElement>;
	readonly isPlaying = signal(false);
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
			const duration = this.audioRef.nativeElement.duration || this.preview.duration();
			const clamped = this.clampTime(value, duration);
			this.audioRef.nativeElement.currentTime = clamped;
			this.preview.currentTime.set(clamped);
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
		this.preview.error.set("Audio failed to load.");
	}

	async applyOffset(): Promise<void> {
		await this.preview.applyOffset();
		await this.preview.load();
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
