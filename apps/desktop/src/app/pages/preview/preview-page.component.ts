import { CommonModule } from "@angular/common";
import {
	type AfterViewInit,
	Component,
	type ElementRef,
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
				<h1>Review chart sync and fine-tune offset before export.</h1>
				<p>Integrated 2D chart review with real waveform context and existing offset controls.</p>
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
					(play)="isPlaying.set(true)"
					(pause)="isPlaying.set(false)"
					(ended)="isPlaying.set(false)"
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
							[previewStatus]="preview.previewStatus()"
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
			.preview-header { align-items: start; display: flex; gap: 1rem; justify-content: space-between; }
			.preview-header h1 { max-width: 48rem; }
			.status-pill { align-items: center; background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.25); border-radius: 999px; color: #22f06f; display: inline-flex; font-weight: 800; gap: 0.45rem; padding: 0.8rem 1rem; white-space: nowrap; }
			.status-pill.warning { background: rgba(246, 180, 80, 0.12); border-color: rgba(246, 180, 80, 0.3); color: #f6b450; }
			audio { display: none; }
			.preview-layout { align-items: start; display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr) minmax(18rem, 24rem); }
			.preview-main { display: grid; gap: 1rem; min-width: 0; }
			@media (max-width: 1180px) { .preview-layout { grid-template-columns: 1fr; } }
			@media (max-width: 760px) { .preview-header { display: grid; } }
		`,
	],
})
export class PreviewPageComponent implements AfterViewInit {
	@ViewChild("audio") private readonly audioRef?: ElementRef<HTMLAudioElement>;
	readonly isPlaying = signal(false);

	constructor(readonly preview: DesktopPreviewService) {}

	async ngAfterViewInit(): Promise<void> {
		await this.preview.load();
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
			this.audioRef.nativeElement.currentTime = value;
			this.preview.currentTime.set(value);
		}
	}

	onLoadedMetadata(): void {
		if (!this.audioRef?.nativeElement) return;
		this.preview.duration.set(this.audioRef.nativeElement.duration || 0);
	}

	onTimeUpdate(): void {
		if (!this.audioRef?.nativeElement) return;
		this.preview.currentTime.set(this.audioRef.nativeElement.currentTime || 0);
	}

	onAudioError(): void {
		this.preview.error.set("Audio failed to load.");
	}

	async applyOffset(): Promise<void> {
		await this.preview.applyOffset();
		await this.preview.load();
	}
}
