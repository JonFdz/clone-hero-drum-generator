import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { HomeRecentProjectItem } from "../../../services/home-dashboard-model";

@Component({
	selector: "chdg-home-recent-projects-compact",
	standalone: true,
	template: `
		<section class="card recent-projects-card">
			<div class="recent-header">
				<h2>Recent Projects</h2>
				<button class="view-all-link" type="button" (click)="viewAll.emit()">
					View all projects <span aria-hidden="true">→</span>
				</button>
			</div>
			@if (projects.length === 0) {
				<div class="recent-project-row empty-row">
					<div class="recent-icon">▣</div>
					<div class="recent-copy">
						<strong>No recent projects yet</strong>
						<p>Create or open a .chdg project to pin it here.</p>
					</div>
				</div>
			} @else {
				<div class="recent-list">
					@for (project of projects; track project.path) {
						<div class="recent-project-row" role="button" tabindex="0" (click)="openProject.emit(project.path)" (keyup.enter)="openProject.emit(project.path)">
							<div class="recent-icon">{{ project.icon }}</div>
							<div class="recent-copy">
								<strong>{{ project.name }}</strong>
								<p>{{ project.lastOpenedLabel }}</p>
							</div>
							<span class="recent-status" [class]="'recent-status tone-' + project.statusTone">{{ project.statusLabel }}</span>
							<button class="kebab-button" type="button" aria-label="Remove recent project" (click)="removeProjectClick($event, project.path)">⋮</button>
						</div>
					}
				</div>
			}
		</section>
	`,
	styles: [
		`
		.recent-projects-card { min-height: 24.2rem; padding: 1.35rem; }
		.recent-header { align-items: center; display: flex; justify-content: space-between; margin-bottom: 1.15rem; }
		.recent-header h2 { margin: 0; }
		.view-all-link { background: transparent; border: 0; color: var(--color-accent-soft); font-size: 0.88rem; font-weight: 800; min-height: auto; padding: 0; }
		.recent-list { display: grid; gap: 0.65rem; }
		.recent-project-row { align-items: center; background: rgba(255, 255, 255, 0.025); border: 1px solid var(--color-border); border-radius: 0.6rem; cursor: pointer; display: grid; gap: 1rem; grid-template-columns: 4.5rem minmax(0, 1fr) auto 2rem; min-height: 5.95rem; padding: 0.75rem; }
		.recent-project-row:hover { background: rgba(151, 83, 229, 0.1); }
		.empty-row { cursor: default; grid-template-columns: 4.5rem minmax(0, 1fr); }
		.recent-icon { align-items: center; background: linear-gradient(135deg, rgba(151, 83, 229, 0.36), rgba(151, 83, 229, 0.18)); border-radius: 0.46rem; color: var(--color-accent-soft); display: grid; font-size: 1.55rem; font-weight: 900; height: 4.35rem; justify-items: center; place-items: center; width: 4.35rem; }
		.recent-copy { min-width: 0; }
		.recent-copy strong { color: var(--color-text); display: block; font-size: 1.08rem; margin-bottom: 0.35rem; }
		.recent-copy p { color: var(--color-text-soft); font-size: 0.92rem; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.recent-status { border: 1px solid var(--color-border); border-radius: 0.42rem; font-size: 0.86rem; font-weight: 800; padding: 0.45rem 0.75rem; white-space: nowrap; }
		.tone-success { background: rgba(101, 222, 119, 0.14); border-color: rgba(101, 222, 119, 0.24); color: var(--color-success); }
		.tone-warning { background: rgba(246, 180, 80, 0.14); border-color: rgba(246, 180, 80, 0.24); color: var(--color-warning); }
		.tone-neutral { background: rgba(114, 178, 255, 0.14); border-color: rgba(114, 178, 255, 0.24); color: #8fc2ff; }
		.tone-danger { background: rgba(255, 107, 122, 0.14); border-color: rgba(255, 107, 122, 0.24); color: var(--color-danger); }
		.kebab-button { background: transparent; border: 0; color: var(--color-muted); font-size: 1.55rem; min-height: auto; padding: 0; }
		@media (max-width: 720px) { .recent-project-row { grid-template-columns: 3.6rem minmax(0, 1fr) auto; } .recent-icon { height: 3.5rem; width: 3.5rem; } .kebab-button { grid-column: 3; } }
	`,
	],
})
export class HomeRecentProjectsCompactComponent {
	@Input({ required: true }) projects!: HomeRecentProjectItem[];
	@Output() openProject = new EventEmitter<string>();
	@Output() removeProject = new EventEmitter<string>();
	@Output() viewAll = new EventEmitter<void>();

	removeProjectClick(event: Event, path: string): void {
		event.stopPropagation();
		this.removeProject.emit(path);
	}
}
