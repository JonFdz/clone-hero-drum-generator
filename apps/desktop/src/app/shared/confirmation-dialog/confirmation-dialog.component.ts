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
 * Shared accessible confirmation dialog.
 *
 * Presentational only: emits `confirmed` or `cancelled`. Does not navigate and
 * does not touch the desktop bridge. Keyboard accessible: Escape cancels,
 * the confirm/cancel buttons are focus targets, and the backdrop click
 * cancels. Destructive confirmations render with an explicit danger style.
 */
@Component({
	selector: "chdg-confirmation-dialog",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./confirmation-dialog.component.html",
	styleUrl: "./confirmation-dialog.component.css",
})
export class ConfirmationDialogComponent {
	@Input() isOpen = false;
	@Input() title = "Confirm";
	@Input() message = "";
	@Input() confirmLabel = "Confirm";
	@Input() cancelLabel = "Cancel";
	@Input() destructive = false;

	@Output() confirmed = new EventEmitter<void>();
	@Output() cancelled = new EventEmitter<void>();

	@HostListener("document:keydown.escape")
	onEscape(): void {
		if (this.isOpen) this.cancelled.emit();
	}
}