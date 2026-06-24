import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	HostListener,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
} from "@angular/core";

export type ProfileMetadataDialogIntent = {
	name: string;
	description?: string;
};

/**
 * Source Review feature-local dialog for editing mapping-profile metadata
 * (name + optional description). Presentational only: emits `confirmed` with
 * the trimmed values, or `cancelled`. Does not navigate or touch the bridge.
 */
@Component({
	selector: "chdg-profile-metadata-dialog",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./profile-metadata-dialog.component.html",
	styleUrl: "./profile-metadata-dialog.component.css",
})
export class ProfileMetadataDialogComponent implements OnChanges {
	@Input() isOpen = false;
	@Input() title = "Profile metadata";
	@Input() message = "";
	@Input() nameInitialValue = "";
	@Input() descriptionInitialValue = "";
	@Input() required = true;
	@Input() confirmLabel = "Save";
	@Input() cancelLabel = "Cancel";

	@Output() confirmed = new EventEmitter<ProfileMetadataDialogIntent>();
	@Output() cancelled = new EventEmitter<void>();

	name = "";
	description = "";

	/** Whether the confirm action is disabled (required name empty). */
	get confirmDisabled(): boolean {
		return this.required && this.name.trim().length === 0;
	}

	ngOnChanges(changes: SimpleChanges): void {
		const isOpenChange = changes["isOpen"];
		if (
			isOpenChange &&
			!isOpenChange.previousValue &&
			isOpenChange.currentValue
		) {
			this.syncValues();
		}
	}

	/** Resets editable fields to the configured initial values. */
	syncValues(): void {
		this.name = this.nameInitialValue ?? "";
		this.description = this.descriptionInitialValue ?? "";
	}

	onConfirm(): void {
		if (this.confirmDisabled) return;
		const trimmedDescription = this.description.trim();
		this.confirmed.emit({
			name: this.name.trim(),
			description: trimmedDescription ? trimmedDescription : undefined,
		});
	}

	@HostListener("document:keydown.escape")
	onEscape(): void {
		if (this.isOpen) this.cancelled.emit();
	}
}
