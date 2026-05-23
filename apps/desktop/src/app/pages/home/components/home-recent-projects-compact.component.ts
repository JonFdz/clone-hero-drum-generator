import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { RecentProject } from "@chdg/project/browser";

@Component({
	selector: "chdg-home-recent-projects-compact",
	standalone: true,
	template: `
		<section class="card recent-compact">
			<div class="split-row section-title">
				<div>
					<p class="eyebrow">Recent Projects</p>
					<h2>Continue quickly</h2>
				</div>
				<button class="button ghost small-link" type="button" (click)="viewAll.emit()">View all</button>
			</div>
			@if (projects.length === 0) {
				<p>No recent projects yet. Create or open a .chdg project to pin it here.</p>
			} @else {
				<div class="card-list compact-list">
					@for (project of projects; track project.path) {
						<div class="mini-card recent-project" role="button" tabindex="0" (click)="openProject.emit(project.path)" (keyup.enter)="openProject.emit(project.path)">
							<div class="project-main">
								<strong>{{ project.name }}</strong>
								<p>{{ project.path }}</p>
							</div>
							<button class="button ghost remove-button" type="button" aria-label="Remove recent project" (click)="removeProjectClick($event, project.path)">Remove</button>
						</div>
					}
				</div>
			}
		</section>
	`,
	styles: [
		`
		.recent-compact { min-height: 100%; }
		.section-title { align-items: start; margin-bottom: var(--space-4); }
		.small-link { min-height: 2.2rem; padding: 0.45rem 0.75rem; }
		.compact-list { gap: var(--space-3); }
		.recent-project { align-items: center; cursor: pointer; display: grid; gap: var(--space-3); grid-template-columns: minmax(0, 1fr) auto; }
		.recent-project:hover { background: rgba(151, 83, 229, 0.12); }
		.project-main { min-width: 0; }
		.project-main strong { color: var(--color-text); }
		.project-main p { font-size: 0.82rem; margin: var(--space-2) 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.remove-button { min-height: 2rem; padding: 0.35rem 0.65rem; }
	`,
	],
})
export class HomeRecentProjectsCompactComponent {
	@Input({ required: true }) projects!: RecentProject[];
	@Output() openProject = new EventEmitter<string>();
	@Output() removeProject = new EventEmitter<string>();
	@Output() viewAll = new EventEmitter<void>();

	removeProjectClick(event: Event, path: string): void {
		event.stopPropagation();
		this.removeProject.emit(path);
	}
}
