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
			<span class="status-pill" [class.warning]="preview.waveformStatus() === 'error' || (!!preview.chartData() && !preview.audioSrc())">
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
							[isPlaying]="isPlaying()"
							(play)="play()"
							(pause)="pause()"
							(seek)="seek($event)"
						/>

						<chdg-preview-chart-stage
							[waveformOverview]="preview.waveformOverview()"
							[chartData]="preview.chartData()"
							[currentTime]="preview.currentTime()"
							[duration]="preview.duration()"
							[previewOffsetMs]="preview.previewOffsetMs()"
							[audioSourceLabel]="preview.audioSourceLabel()"
							[noteCount]="preview.previewNoteCount()"
							[waveformStatus]="preview.waveformStatus()"
							[waveformError]="preview.waveformError()"
							(seek)="seek($event)"
						/>

						<section class="card timing-card" *ngIf="preview.chartData()?.timing as timing">
							<div class="timing-heading">
								<div>
									<p class="eyebrow">Generated notes.chart</p>
									<h2>Timing Diagnostics</h2>
								</div>
								<span class="timing-status" [class.warning]="timing.summary.warningCount > 0" [class.danger]="timing.summary.errorCount > 0">
									{{ timing.summary.label }}
								</span>
							</div>

							<div class="timing-facts">
								<div><span>Resolution</span><strong>{{ timing.resolution }}</strong></div>
								<div><span>Offset adjustment</span><strong>{{ formatOffsetMilliseconds(timing.offsetSeconds) }} ms</strong></div>
								<div><span>Tempo events</span><strong>{{ timing.tempos.length }}</strong></div>
								<div><span>Time signatures</span><strong>{{ timing.timeSignatures.length }}</strong></div>
							</div>

							<h3>Diagnostics</h3>
							<p class="empty-diagnostics" *ngIf="timing.diagnostics.length === 0">No timing diagnostics were reported.</p>
							<ul class="diagnostic-list">
								<li *ngFor="let diagnostic of timing.diagnostics" [class.warning]="diagnostic.severity === 'warning'" [class.danger]="diagnostic.severity === 'error'">
									<strong>{{ diagnostic.code }}</strong>
									<span>{{ diagnostic.message }}</span>
									<small *ngIf="diagnostic.code === 'SOURCE_COMPARISON_UNAVAILABLE'">Cached source analysis was not recalculated by Preview.</small>
								</li>
							</ul>

							<div class="timing-tables">
								<section>
									<h3>Tempo Events</h3>
									<div class="timing-row header"><span>Tick</span><span>Time</span><span>BPM</span></div>
									<div class="timing-row" *ngFor="let tempo of timing.tempos">
										<span>{{ tempo.tick }}</span><span>{{ formatDiagnosticTime(tempo.seconds) }}</span><span>{{ tempo.bpm }}</span>
									</div>
								</section>
								<section>
									<h3>Time Signatures</h3>
									<div class="timing-row header"><span>Tick</span><span>Time</span><span>Signature</span></div>
									<div class="timing-row" *ngFor="let signature of timing.timeSignatures">
										<span>{{ signature.tick }}</span><span>{{ formatDiagnosticTime(signature.seconds) }}</span><span>{{ signature.numerator }}/{{ signature.denominator }}</span>
									</div>
								</section>
								<section>
									<h3>Generated Sections</h3>
									<div class="timing-row header"><span>Tick</span><span>Time</span><span>Name</span></div>
									<div class="timing-row" *ngFor="let section of timing.sections">
										<span>{{ section.tick }}</span><span>{{ formatDiagnosticTime(section.seconds) }}</span><span>{{ section.name }}</span>
									</div>
								</section>
								<section>
									<h3>Generated Notes</h3>
									<div class="note-summary">
										<span>Count <strong>{{ timing.notes.count }}</strong></span>
										<span>First <strong>{{ timing.notes.firstTick ?? '—' }} · {{ formatDiagnosticTime(timing.notes.firstSeconds) }}</strong></span>
										<span>Last <strong>{{ timing.notes.lastTick ?? '—' }} · {{ formatDiagnosticTime(timing.notes.lastSeconds) }}</strong></span>
									</div>
								</section>
							</div>
						</section>
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
			<section class="card message">
				<h2>No preview audio</h2>
				<p>Audio and waveform are unavailable. Timing diagnostics from notes.chart remain available.</p>
			</section>

			<section class="card timing-card" *ngIf="preview.chartData()?.timing as timing">
				<div class="timing-heading">
					<div>
						<p class="eyebrow">Generated notes.chart</p>
						<h2>Timing Diagnostics</h2>
					</div>
					<span class="timing-status" [class.warning]="timing.summary.warningCount > 0" [class.danger]="timing.summary.errorCount > 0">
						{{ timing.summary.label }}
					</span>
				</div>

				<div class="timing-facts">
					<div><span>Resolution</span><strong>{{ timing.resolution }}</strong></div>
					<div><span>Offset adjustment</span><strong>{{ formatOffsetMilliseconds(timing.offsetSeconds) }} ms</strong></div>
					<div><span>Tempo events</span><strong>{{ timing.tempos.length }}</strong></div>
					<div><span>Time signatures</span><strong>{{ timing.timeSignatures.length }}</strong></div>
				</div>

				<h3>Diagnostics</h3>
				<p class="empty-diagnostics" *ngIf="timing.diagnostics.length === 0">No timing diagnostics were reported.</p>
				<ul class="diagnostic-list">
					<li *ngFor="let diagnostic of timing.diagnostics" [class.warning]="diagnostic.severity === 'warning'" [class.danger]="diagnostic.severity === 'error'">
						<strong>{{ diagnostic.code }}</strong>
						<span>{{ diagnostic.message }}</span>
						<small *ngIf="diagnostic.code === 'SOURCE_COMPARISON_UNAVAILABLE'">Cached source analysis was not recalculated by Preview.</small>
					</li>
				</ul>

				<div class="timing-tables">
					<section>
						<h3>Tempo Events</h3>
						<div class="timing-row header"><span>Tick</span><span>Time</span><span>BPM</span></div>
						<div class="timing-row" *ngFor="let tempo of timing.tempos">
							<span>{{ tempo.tick }}</span><span>{{ formatDiagnosticTime(tempo.seconds) }}</span><span>{{ tempo.bpm }}</span>
						</div>
					</section>
					<section>
						<h3>Time Signatures</h3>
						<div class="timing-row header"><span>Tick</span><span>Time</span><span>Signature</span></div>
						<div class="timing-row" *ngFor="let signature of timing.timeSignatures">
							<span>{{ signature.tick }}</span><span>{{ formatDiagnosticTime(signature.seconds) }}</span><span>{{ signature.numerator }}/{{ signature.denominator }}</span>
						</div>
					</section>
					<section>
						<h3>Generated Sections</h3>
						<div class="timing-row header"><span>Tick</span><span>Time</span><span>Name</span></div>
						<div class="timing-row" *ngFor="let section of timing.sections">
							<span>{{ section.tick }}</span><span>{{ formatDiagnosticTime(section.seconds) }}</span><span>{{ section.name }}</span>
						</div>
					</section>
					<section>
						<h3>Generated Notes</h3>
						<div class="note-summary">
							<span>Count <strong>{{ timing.notes.count }}</strong></span>
							<span>First <strong>{{ timing.notes.firstTick ?? '—' }} · {{ formatDiagnosticTime(timing.notes.firstSeconds) }}</strong></span>
							<span>Last <strong>{{ timing.notes.lastTick ?? '—' }} · {{ formatDiagnosticTime(timing.notes.lastSeconds) }}</strong></span>
						</div>
					</section>
				</div>
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
			.timing-card { display: grid; gap: 1rem; }
			.timing-heading { align-items: start; display: flex; gap: 1rem; justify-content: space-between; }
			.timing-heading h2, .timing-heading p, .timing-card h3 { margin-bottom: 0; }
			.timing-status { border: 1px solid rgba(69, 181, 255, 0.35); border-radius: 999px; color: #45b5ff; font-weight: 800; padding: 0.45rem 0.7rem; }
			.timing-status.warning, .diagnostic-list li.warning { border-color: rgba(246, 180, 80, 0.4); color: var(--color-warning); }
			.timing-status.danger, .diagnostic-list li.danger { border-color: rgba(255, 107, 122, 0.4); color: var(--color-danger); }
			.timing-facts { display: grid; gap: 0.75rem; grid-template-columns: repeat(4, minmax(0, 1fr)); }
			.timing-facts div { background: rgba(255, 255, 255, 0.03); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: grid; gap: 0.25rem; padding: 0.75rem; }
			.timing-facts span, .diagnostic-list small, .empty-diagnostics { color: var(--color-muted); }
			.diagnostic-list { display: grid; gap: 0.5rem; list-style: none; margin: 0; padding: 0; }
			.diagnostic-list li { border: 1px solid var(--color-border); border-radius: var(--radius-md); display: grid; gap: 0.25rem; padding: 0.7rem; }
			.diagnostic-list li strong { font-size: 0.78rem; }
			.timing-tables { display: grid; gap: 1rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
			.timing-tables section { border: 1px solid var(--color-border); border-radius: var(--radius-md); min-width: 0; overflow: hidden; padding: 0.75rem; }
			.timing-row { display: grid; gap: 0.5rem; grid-template-columns: repeat(3, minmax(0, 1fr)); padding: 0.4rem 0; }
			.timing-row.header { border-bottom: 1px solid var(--color-border); color: var(--color-muted); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
			.note-summary { display: grid; gap: 0.5rem; }
			.note-summary span { display: flex; justify-content: space-between; }
			@media (max-width: 1500px) { .preview-layout { grid-template-columns: 1fr; } }
			@media (max-width: 760px) { .preview-header, .timing-heading { display: grid; } .timing-facts, .timing-tables { grid-template-columns: 1fr; } }
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
