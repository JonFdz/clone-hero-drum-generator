import { CommonModule } from "@angular/common";
import {
	type AfterViewInit,
	Component,
	type ElementRef,
	ViewChild,
} from "@angular/core";
import { DesktopPreviewService } from "../../services/desktop-preview.service";
import type { HighwayLane } from "../../services/desktop-preview-model";

@Component({
	selector: "chdg-preview-page",
	standalone: true,
	imports: [CommonModule],
	template: `
    <header class="page-header">
      <p class="eyebrow">Preview</p>
      <h1>Audio + timeline + highway preview</h1>
      <p>Read-only local preview. No note editing or persisted offset adjustments in Phase 14B.</p>
    </header>

    <section class="card" *ngIf="preview.error(); else loaded">
      <h2>Preview unavailable</h2>
      <p>{{ preview.error() }}</p>
    </section>

    <ng-template #loaded>
      <section class="card" *ngIf="preview.audioSrc(); else missingAudio">
        <div class="split-row">
          <h2>Audio Preview</h2>
          <span class="pill">Source: {{ preview.sourceKind() || "unknown" }}</span>
        </div>
        <audio #audio [src]="preview.audioSrc()!" (loadedmetadata)="onLoadedMetadata()" (timeupdate)="onTimeUpdate()" (error)="onAudioError()"></audio>

        <div class="controls">
          <button class="button secondary" type="button" (click)="play()">Play</button>
          <button class="button ghost" type="button" (click)="pause()">Pause</button>
          <input type="range" min="0" [max]="preview.duration() || 0" [value]="preview.currentTime()" (input)="seek($event)" />
          <span>{{ preview.currentTimeText() }} / {{ preview.durationText() }}</span>
        </div>

        <h3>Waveform-like overview</h3>
        <p class="field-hint">Lightweight preview overview (not decoded audio waveform yet).</p>
        <div class="waveform" *ngIf="preview.waveformBars().length > 0; else noWaveform">
          <span *ngFor="let bar of preview.waveformBars()" class="bar" [style.height.%]="bar * 100"></span>
        </div>
        <ng-template #noWaveform><p>Waveform unavailable.</p></ng-template>
      </section>

      <section class="card timeline">
        <h2>Timeline Notes</h2>
        <p *ngIf="preview.chartData()?.limitations?.length">{{ preview.chartData()?.limitations?.join(" ") }}</p>
        <div class="timeline-grid" *ngIf="preview.timelineNotes().length > 0; else noNotes">
          <span
            *ngFor="let note of preview.timelineNotes()"
            class="note"
            [class.active]="note.highlighted"
            [style.left.%]="(note.atSeconds / (preview.duration() || 1)) * 100"
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
          <span class="highway-hit-line"></span>
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
    </ng-template>

    <ng-template #missingAudio>
      <section class="card">
        <h2>No preview audio</h2>
        <p>Generated song.ogg and selected project audio are unavailable.</p>
      </section>
    </ng-template>
  `,
	styles: [
		`
      .controls { display: flex; gap: 12px; align-items: center; margin: 12px 0; }
      .controls input[type="range"] { flex: 1; }
      .waveform { height: 72px; display: flex; align-items: end; gap: 2px; border: 1px solid var(--color-border); padding: 8px; border-radius: var(--radius-md); }
      .bar { display: inline-block; width: 4px; background: #9b6dff; border-radius: 2px; opacity: 0.85; }
      .timeline-grid { position: relative; height: 110px; border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
      .note { position: absolute; top: 38px; width: 6px; height: 32px; background: #6ea8ff; border-radius: 4px; opacity: 0.8; }
      .note.active { background: #f6b450; height: 40px; top: 34px; }
      .playhead { position: absolute; top: 0; bottom: 0; width: 2px; background: #c084ff; }
      .highway-grid { position: relative; height: 280px; border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; background: linear-gradient(to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); }
      .lane-markers { position: absolute; inset: 0 0 auto 0; display: grid; grid-template-columns: repeat(5, 1fr); padding: 8px 12px; color: #b9bfd0; font-size: 12px; }
      .highway-hit-line { position: absolute; left: 0; right: 0; bottom: 18%; height: 2px; background: #c084ff; opacity: 0.9; }
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
