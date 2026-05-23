import { CommonModule } from "@angular/common";
import {
	type AfterViewInit,
	Component,
	type ElementRef,
	ViewChild,
} from "@angular/core";
import { DesktopPreviewService } from "../../services/desktop-preview.service";
import type { HighwayLane, TimelineNote } from "../../services/desktop-preview-model";
import type { WaveformBucket } from "../../services/desktop-waveform-overview";

@Component({
	selector: "chdg-preview-page",
	standalone: true,
	imports: [CommonModule],
	template: `
    <header class="page-header">
      <p class="eyebrow">Preview</p>
      <h1>Audio + timeline + highway preview</h1>
      <p>Chart Offset adjusts notes.chart [Song] Offset. Notes are not moved; audio is not modified.</p>
    </header>

    <section class="card" *ngIf="preview.error(); else loaded">
      <h2>Preview unavailable</h2>
      <p>{{ preview.error() }}</p>
    </section>

    <ng-template #loaded>
      <section class="card" *ngIf="preview.audioSrc(); else missingAudio">
        <div class="split-row">
          <h2>Audio Preview</h2>
          <span class="pill">Audio source: {{ preview.audioSourceLabel() }}</span>
        </div>
        <audio #audio [src]="preview.audioSrc()!" (loadedmetadata)="onLoadedMetadata()" (timeupdate)="onTimeUpdate()" (error)="onAudioError()"></audio>

        <div class="controls">
          <button class="button secondary" type="button" (click)="play()">Play</button>
          <button class="button ghost" type="button" (click)="pause()">Pause</button>
          <input type="range" min="0" [max]="preview.duration() || 0" [value]="preview.currentTime()" (input)="seek($event)" />
          <span>{{ preview.currentTimeText() }} / {{ preview.durationText() }}</span>
        </div>

        <h3>Waveform overview</h3>
        <p class="field-hint">Real waveform from {{ preview.audioSourceLabel() }}.</p>
        <p *ngIf="preview.waveformStatus() === 'loading'">Loading waveform preview…</p>
        <p *ngIf="preview.waveformStatus() === 'error'">Could not decode waveform preview. Audio playback/generation may still work.</p>
        <p *ngIf="preview.waveformStatus() === 'empty'">No audio available for waveform preview.</p>
        <div class="waveform-shell" *ngIf="preview.waveformStatus() === 'ready' && preview.waveformOverview() as overview">
          <svg class="waveform-svg" viewBox="0 0 1000 120" preserveAspectRatio="none" role="img" aria-label="Audio waveform preview">
            <path [attr.d]="waveformPath(overview.buckets)" class="waveform-fill" />
          </svg>
          <span class="waveform-playhead" [style.left.%]="(preview.currentTime() / (preview.duration() || 1)) * 100"></span>
        </div>
      </section>

      <section class="card timeline">
        <h2>Timeline Notes</h2>
        <p *ngIf="preview.chartData()?.limitations?.length">{{ preview.chartData()?.limitations?.join(" ") }}</p>
        <div class="timeline-grid" *ngIf="preview.timelineNotes().length > 0; else noNotes">
          <span
            *ngFor="let note of preview.timelineNotes()"
            class="note"
            [class.active]="note.highlighted"
            [style.left.%]="timelineLeftPercent(note)"
            [attr.title]="note.lane"
          ></span>
          <span class="playhead" [style.left.%]="(preview.currentTime() / (preview.duration() || 1)) * 100"></span>
        </div>
        <ng-template #noNotes><p>No chart/hit timeline data available yet.</p></ng-template>
      </section>

      <section class="card highway">
        <h2>Clone Hero Highway (Preview)</h2>
        <p class="field-hint" *ngFor="let limitation of preview.highwayLimitations()">{{ limitation }}</p>
        <div class="highway-grid" *ngIf="preview.highwayNotes().length > 0; else noHighwayNotes">
          <div class="lane-markers">
            <span>Kick</span><span>Red</span><span>Yellow</span><span>Blue</span><span>Green</span>
          </div>
          <span class="highway-hit-line" [style.bottom.%]="preview.highwayHitLinePercent"></span>
          <span
            *ngFor="let note of preview.highwayNotes()"
            class="highway-note"
            [class.cymbal]="note.cymbal"
            [class.open]="note.open"
            [class.accent]="note.accent"
            [class.ghost]="note.ghost"
            [style.left.%]="laneLeftPercent(note.lane)"
            [style.bottom.%]="note.yPercent"
            [attr.title]="note.lane"
          ></span>
        </div>
        <ng-template #noHighwayNotes><p>No highway notes available for the current preview data.</p></ng-template>
      </section>

      <section class="card">
        <h2>Chart Offset</h2>
        <p class="field-hint">Adjusts notes.chart [Song] Offset. Notes are not moved; audio is not modified.</p>
        <p>Saved: <strong>{{ preview.savedOffsetMs() }} ms</strong></p>
        <p>Preview: <strong>{{ preview.previewOffsetMs() }} ms</strong></p>
        <p>Delta: <strong>{{ preview.offsetDeltaMs() }} ms</strong></p>

        <div class="controls">
          <button class="button ghost" type="button" (click)="preview.nudgeOffset(-100)">-100 ms</button>
          <button class="button ghost" type="button" (click)="preview.nudgeOffset(-50)">-50 ms</button>
          <button class="button ghost" type="button" (click)="preview.nudgeOffset(-10)">-10 ms</button>
          <button class="button ghost" type="button" (click)="preview.nudgeOffset(10)">+10 ms</button>
          <button class="button ghost" type="button" (click)="preview.nudgeOffset(50)">+50 ms</button>
          <button class="button ghost" type="button" (click)="preview.nudgeOffset(100)">+100 ms</button>
        </div>

        <label>Offset (ms)
          <input type="number" [value]="preview.offsetInputMs()" (input)="onOffsetInput($event)" />
        </label>

        <div class="controls">
          <button class="button secondary" type="button" (click)="preview.resetPreviewOffset()">Reset to saved</button>
          <button class="button" type="button" [disabled]="!preview.canApplyOffset()" (click)="applyOffset()">Apply & Save</button>
        </div>
        <p *ngIf="preview.offsetStatus()" class="field-hint">{{ preview.offsetStatus() }}</p>
      </section>
    </ng-template>

    <ng-template #missingAudio>
      <section class="card">
        <h2>No preview audio</h2>
        <p>No audio available for waveform preview.</p>
      </section>
    </ng-template>
  `,
	styles: [
		`
      .controls { display: flex; gap: 12px; align-items: center; margin: 12px 0; }
      .controls input[type="range"] { flex: 1; }
      .waveform-shell { position: relative; height: 120px; border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; background: rgba(255,255,255,0.02); }
      .waveform-svg { width: 100%; height: 100%; display: block; }
      .waveform-fill { fill: rgba(155, 109, 255, 0.4); stroke: #9b6dff; stroke-width: 1; }
      .waveform-playhead { position: absolute; top: 0; bottom: 0; width: 2px; background: #c084ff; }
      .timeline-grid { position: relative; height: 110px; border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
      .note { position: absolute; top: 38px; width: 6px; height: 32px; background: #6ea8ff; border-radius: 4px; opacity: 0.8; }
      .note.active { background: #f6b450; height: 40px; top: 34px; }
      .playhead { position: absolute; top: 0; bottom: 0; width: 2px; background: #c084ff; }
      .highway-grid { position: relative; height: 280px; border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; background: linear-gradient(to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); }
      .lane-markers { position: absolute; inset: 0 0 auto 0; display: grid; grid-template-columns: repeat(5, 1fr); padding: 8px 12px; color: #b9bfd0; font-size: 12px; }
      .highway-hit-line { position: absolute; left: 0; right: 0; height: 2px; background: #c084ff; opacity: 0.9; }
      .highway-note { position: absolute; width: 14px; height: 14px; transform: translateX(-50%); border-radius: 50%; background: #6ea8ff; border: 2px solid rgba(0,0,0,0.3); }
      .highway-note.cymbal { border-style: dashed; }
      .highway-note.open { box-shadow: 0 0 0 2px #d9f99d inset; }
      .highway-note.accent { box-shadow: 0 0 0 2px #facc15 inset; }
      .highway-note.ghost { opacity: 0.45; }
    `,
	],
})
export class PreviewPageComponent implements AfterViewInit {
	@ViewChild("audio") private readonly audioRef?: ElementRef<HTMLAudioElement>;

	constructor(readonly preview: DesktopPreviewService) {}

	async ngAfterViewInit(): Promise<void> {
		await this.preview.load();
	}

	play(): void {
		void this.audioRef?.nativeElement.play();
	}

	pause(): void {
		this.audioRef?.nativeElement.pause();
	}

	seek(event: Event): void {
		const input = event.target as HTMLInputElement;
		const value = Number(input.value);
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

	onOffsetInput(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.preview.setPreviewOffsetInput(input.value);
	}

	async applyOffset(): Promise<void> {
		await this.preview.applyOffset();
		await this.preview.load();
	}

	waveformPath(buckets: WaveformBucket[]): string {
		if (buckets.length === 0) return "";
		const maxPoints: string[] = [];
		const minPoints: string[] = [];
		const size = Math.max(1, buckets.length - 1);
		for (let index = 0; index < buckets.length; index += 1) {
			const x = (index / size) * 1000;
			const maxY = 60 - buckets[index].max * 55;
			const minY = 60 - buckets[index].min * 55;
			maxPoints.push(`${x},${maxY}`);
			minPoints.push(`${x},${minY}`);
		}
		return `M ${maxPoints.join(" L ")} L ${minPoints.reverse().join(" L ")} Z`;
	}

	timelineLeftPercent(note: TimelineNote): number {
		const overviewDuration = this.preview.waveformOverview()?.durationSeconds;
		const duration = overviewDuration && overviewDuration > 0 ? overviewDuration : this.preview.duration() || 1;
		return (note.atSeconds / duration) * 100;
	}

	laneLeftPercent(lane: HighwayLane): number {
		switch (lane) {
			case "kick":
				return 10;
			case "red":
				return 30;
			case "yellow":
				return 50;
			case "blue":
				return 70;
			case "green":
				return 90;
		}
	}
}
