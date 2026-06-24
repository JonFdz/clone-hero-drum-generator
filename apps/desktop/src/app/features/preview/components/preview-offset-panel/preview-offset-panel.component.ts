import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
	computed,
	signal,
} from "@angular/core";

@Component({
	selector: "chdg-preview-offset-panel",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./preview-offset-panel.component.html",
	styleUrl: "./preview-offset-panel.component.css",
})
export class PreviewOffsetPanelComponent {
	@Input() savedOffsetMs = 0;
	@Input() offsetDeltaMs = 0;
	@Input() offsetInputMs = "0";
	@Input() offsetInputValid = true;
	@Input() offsetStatus: string | null = null;
	@Input() canApplyOffset = false;

	private readonly _previewOffsetMs = signal(0);

	@Input() set previewOffsetMs(value: number) {
		this._previewOffsetMs.set(value);
	}
	get previewOffsetMs(): number {
		return this._previewOffsetMs();
	}

	@Output() nudge = new EventEmitter<number>();
	@Output() inputOffset = new EventEmitter<string>();
	@Output() resetPreview = new EventEmitter<void>();
	@Output() resetToZero = new EventEmitter<void>();
	@Output() apply = new EventEmitter<void>();

	readonly directionText = computed<string>(() => {
		const offset = this._previewOffsetMs();
		if (offset > 0) return "Audio is shifted forward";
		if (offset < 0) return "Audio is shifted backward";
		return "No preview offset applied";
	});

	onInput(event: Event): void {
		this.inputOffset.emit((event.target as HTMLInputElement).value);
	}

	signedOffset(value: number): string {
		return value > 0 ? `+${value}` : String(value);
	}
}
