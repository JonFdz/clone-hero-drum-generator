import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
	selector: "chdg-preview-offset-panel",
	standalone: true,
	imports: [CommonModule],
	template: `
		<section class="offset-panel">
			<h2>Offset Adjustment</h2>
			<p>Fine-tune the audio offset to improve note timing and sync.</p>

			<div class="offset-readout">
				<span>Current Offset</span>
				<strong>{{ signedOffset(previewOffsetMs) }} ms</strong>
				<small>{{ directionText() }}</small>
			</div>

			<div class="panel-group">
				<h3>Nudge Offset</h3>
				<div class="nudge-grid">
					<button type="button" class="button ghost" (click)="nudge.emit(-100)">-100 ms</button>
					<button type="button" class="button ghost" (click)="nudge.emit(-50)">-50 ms</button>
					<button type="button" class="button ghost" (click)="nudge.emit(-10)">-10 ms</button>
					<button type="button" class="button ghost" (click)="nudge.emit(10)">+10 ms</button>
					<button type="button" class="button ghost" (click)="nudge.emit(50)">+50 ms</button>
					<button type="button" class="button ghost" (click)="nudge.emit(100)">+100 ms</button>
				</div>
			</div>

			<label class="panel-group">Direct Offset (ms)
				<input type="number" [class.invalid]="!offsetInputValid" [value]="offsetInputMs" (input)="onInput($event)" />
			</label>

			<button type="button" class="button link" (click)="resetToZero.emit()">↻ Reset to 0 ms</button>
			<button type="button" class="button primary apply" [disabled]="!canApplyOffset" (click)="apply.emit()">✓ Apply Offset</button>
			<button type="button" class="button ghost reset" (click)="resetPreview.emit()">↻ Reset Preview</button>

			<p class="status" *ngIf="offsetStatus">{{ offsetStatus }}</p>
			<p class="saved">Saved offset: {{ signedOffset(savedOffsetMs) }} ms · Delta: {{ signedOffset(offsetDeltaMs) }} ms</p>
		</section>
	`,
	styles: [
		`
			.offset-panel { background: linear-gradient(180deg, rgba(12, 20, 38, 0.96), rgba(8, 13, 27, 0.92)); border: 1px solid rgba(120, 142, 176, 0.2); border-radius: 1rem; display: grid; gap: 1.15rem; padding: 1.4rem; }
			h2 { margin: 0; }
			p { margin: 0; }
			.offset-readout { border-block: 1px solid rgba(197, 209, 225, 0.12); display: grid; gap: 0.45rem; padding: 1.1rem 0; }
			.offset-readout span, small, .saved { color: #aab4c5; }
			.offset-readout strong { color: #a855f7; font-size: clamp(2rem, 5vw, 3rem); line-height: 1; }
			.panel-group { border-top: 1px solid rgba(197, 209, 225, 0.12); padding-top: 1rem; }
			h3 { font-size: 1rem; margin: 0 0 0.85rem; }
			.nudge-grid { display: grid; gap: 0.65rem; grid-template-columns: repeat(3, 1fr); }
			.nudge-grid .button { min-height: 3rem; padding-inline: 0.5rem; }
			input.invalid { border-color: #ff6b7a; }
			.button.link { background: transparent; border: 0; color: #4aa3ff; justify-content: flex-start; padding-inline: 0; }
			.apply { min-height: 3.4rem; }
			.reset { opacity: 0.78; }
			.status { color: #cbd5e1; font-size: 0.9rem; }
			.saved { font-size: 0.82rem; }
		`,
	],
})
export class PreviewOffsetPanelComponent {
	@Input() previewOffsetMs = 0;
	@Input() savedOffsetMs = 0;
	@Input() offsetDeltaMs = 0;
	@Input() offsetInputMs = "0";
	@Input() offsetInputValid = true;
	@Input() offsetStatus: string | null = null;
	@Input() canApplyOffset = false;

	@Output() nudge = new EventEmitter<number>();
	@Output() inputOffset = new EventEmitter<string>();
	@Output() resetPreview = new EventEmitter<void>();
	@Output() resetToZero = new EventEmitter<void>();
	@Output() apply = new EventEmitter<void>();

	onInput(event: Event): void {
		this.inputOffset.emit((event.target as HTMLInputElement).value);
	}

	signedOffset(value: number): string {
		return value > 0 ? `+${value}` : String(value);
	}

	directionText(): string {
		if (this.previewOffsetMs > 0) return "Audio is shifted forward";
		if (this.previewOffsetMs < 0) return "Audio is shifted backward";
		return "No preview offset applied";
	}
}
