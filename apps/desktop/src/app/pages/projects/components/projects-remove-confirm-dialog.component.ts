import { CommonModule } from "@angular/common";
import {
	Component,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from "@angular/core";

@Component({
	selector: "chdg-projects-remove-confirm-dialog",
	standalone: true,
	imports: [CommonModule],
	template: `
		@if (isOpen) {
			<div class="dialog-backdrop" role="presentation" (click)="cancel.emit()">
				<section class="dialog" role="dialog" aria-modal="true" aria-labelledby="remove-title" (click)="$event.stopPropagation()">
					<h2 id="remove-title">Remove this project?</h2>
					<p>You can remove it only from the recent list, or remove it from recents and delete the .chdg file from disk.</p>
					<p>Deleting the .chdg file does not delete source/audio/output folders.</p>
					<div class="project-summary">
						<strong>{{ projectName }}</strong>
						<span>{{ projectPath }}</span>
					</div>
					<div class="dialog-actions">
						<button class="button ghost" type="button" (click)="cancel.emit()">Cancel</button>
						<button class="button secondary" type="button" (click)="removeFromRecents.emit()">Remove from Recents</button>
						<button class="button danger" type="button" (click)="removeAndDelete.emit()">Remove from Recents and Delete File</button>
					</div>
				</section>
			</div>
		}
	`,
	styles: [
		`
		.dialog-backdrop { align-items: center; background: rgba(3, 6, 10, 0.72); display: grid; inset: 0; justify-items: center; padding: 1.5rem; position: fixed; z-index: 20; }
		.dialog { background: linear-gradient(180deg, rgba(28, 36, 47, 0.98), rgba(13, 17, 23, 0.98)); border: 1px solid rgba(197, 209, 225, 0.18); border-radius: 1rem; box-shadow: 0 24px 80px rgba(0, 0, 0, 0.46); max-width: 38rem; padding: 1.5rem; width: min(100%, 38rem); }
		h2 { font-size: 1.35rem; margin-bottom: 0.75rem; }
		p { color: var(--color-text-soft); margin: 0.35rem 0; }
		.project-summary { background: rgba(255, 255, 255, 0.035); border: 1px solid var(--color-border); border-radius: 0.7rem; display: grid; gap: 0.3rem; margin: 1rem 0 1.3rem; padding: 0.85rem; }
		.project-summary span { color: var(--color-muted); font-size: 0.82rem; overflow-wrap: anywhere; }
		.dialog-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: end; }
		.button.danger { background: rgba(255, 107, 122, 0.17); border-color: rgba(255, 107, 122, 0.42); color: #ff98a3; }
	`,
	],
})
export class ProjectsRemoveConfirmDialogComponent {
	@Input() isOpen = false;
	@Input() projectName = "Project";
	@Input() projectPath = "";
	@Output() cancel = new EventEmitter<void>();
	@Output() removeFromRecents = new EventEmitter<void>();
	@Output() removeAndDelete = new EventEmitter<void>();

	@HostListener("document:keydown.escape")
	onEscape(): void {
		if (this.isOpen) this.cancel.emit();
	}
}
