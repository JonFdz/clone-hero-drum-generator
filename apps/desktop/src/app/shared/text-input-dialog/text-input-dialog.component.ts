import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from "@angular/core";

/**
 * Shared accessible single-line text-input dialog.
 *
 * Presentational only: emits `confirmed` with the trimmed value, or
 * `cancelled`. Does not navigate and does not touch the desktop bridge.
 * Keyboard accessible: Escape cancels; Enter on the field confirms; the
 * confirm action is disabled when `required` and the value is empty.
 */
@Component({
	selector: "chdg-text-input-dialog",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./text-input-dialog.component.html",
	styleUrl: "./text-input-dialog.component.css",
})
export class TextInputDialogComponent {
	@Input() isOpen = false;
	@Input() title = "Enter value";
	@Input() message = "";
	@Input() initialValue = "";
	@Input() placeholder = "";
	@Input() required = false;
	@Input() confirmLabel = "Save";
	@Input() cancelLabel = "Cancel";

	@Output() confirmed = new EventEmitter<string>();
	@Output() cancelled = new EventEmitter<void>();

	value = "";

	/** Whether the confirm action is currently disabled. */
	get confirmDisabled(): boolean {
		return this.required && this.value.trim().length === 0;
	}

	/** Resets the editable value to the configured initial value. */
	syncValue(): void {
		this.value = this.initialValue ?? "";
	}

	onConfirm(): void {
		if (this.confirmDisabled) return;
		this.confirmed.emit(this.value.trim());
	}

	@HostListener("document:keydown.escape")
	onEscape(): void {
		if (this.isOpen) this.cancelled.emit();
	}
}
