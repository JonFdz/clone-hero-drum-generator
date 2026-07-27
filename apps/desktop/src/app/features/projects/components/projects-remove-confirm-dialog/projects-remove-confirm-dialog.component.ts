import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from "@angular/core";

@Component({
	selector: "chdg-projects-remove-confirm-dialog",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./projects-remove-confirm-dialog.component.html",
	styleUrl: "./projects-remove-confirm-dialog.component.css",
})
export class ProjectsRemoveConfirmDialogComponent {
	@Input() isOpen = false;
	@Input() projectName = "Project";
	@Input() projectPath = "";
	@Output() cancelled = new EventEmitter<void>();
	@Output() removeFromRecents = new EventEmitter<void>();

	@HostListener("document:keydown.escape")
	onEscape(): void {
		if (this.isOpen) this.cancelled.emit();
	}
}
