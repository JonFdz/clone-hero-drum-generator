import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
	selector: "chdg-projects-empty-state",
	standalone: true,
	imports: [RouterModule],
	template: `
		<section class="empty-state">
			<div class="empty-icon" aria-hidden="true">▤</div>
			<h2>{{ hasProjects ? 'No matching projects' : 'No recent projects yet' }}</h2>
			<p>{{ hasProjects ? 'Try a different search, source filter, or sort mode.' : 'Create a new .chdg project or open an existing one to build your local library.' }}</p>
			<div class="empty-actions">
				@if (hasProjects) {
					<button class="button ghost" type="button" (click)="resetFilters.emit()">Clear Search / Reset Filters</button>
				} @else {
					<a class="button primary" routerLink="/new-project">New Project</a>
					<button class="button secondary" type="button" (click)="openProject.emit()">Open Project</button>
				}
			</div>
		</section>
	`,
	styles: [
		`
		.empty-state { align-items: center; background: linear-gradient(180deg, rgba(22, 29, 38, 0.72), rgba(13, 17, 23, 0.68)); border: 1px dashed rgba(197, 209, 225, 0.2); border-radius: 0.85rem; display: grid; justify-items: center; min-height: 24rem; padding: 3rem 1.5rem; text-align: center; }
		.empty-icon { background: rgba(151, 83, 229, 0.18); border: 1px solid rgba(151, 83, 229, 0.38); border-radius: 1rem; color: var(--color-accent-soft); display: grid; font-size: 2rem; height: 5rem; margin-bottom: 1.2rem; place-items: center; width: 5rem; }
		h2 { font-size: 1.45rem; margin-bottom: 0.55rem; }
		p { max-width: 31rem; }
		.empty-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; margin-top: 0.6rem; }
	`,
	],
})
export class ProjectsEmptyStateComponent {
	@Input() hasProjects = false;
	@Output() openProject = new EventEmitter<void>();
	@Output() resetFilters = new EventEmitter<void>();
}
