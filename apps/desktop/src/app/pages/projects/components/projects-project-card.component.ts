import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { ProjectsLibraryItem } from "../../../services/projects-library-model";
import { ProjectsCoverPlaceholderComponent } from "./projects-cover-placeholder.component";
import { ProjectsSourceBadgeComponent } from "./projects-source-badge.component";

@Component({
	selector: "chdg-projects-project-card",
	standalone: true,
	imports: [ProjectsCoverPlaceholderComponent, ProjectsSourceBadgeComponent],
	template: `
		<article class="project-card" [class.current]="project.isCurrent">
			<div class="card-main">
				<chdg-projects-cover-placeholder [label]="project.coverLabel" [projectName]="project.name" [sourceType]="project.sourceType" />
				<div class="project-copy">
					<div class="project-title-row">
						<h2>{{ project.name }}</h2>
						<button class="remove-button" type="button" title="Remove from recent projects" aria-label="Remove from recent projects" (click)="requestRemove.emit(project.path)">🗑</button>
					</div>
					<div class="badge-row">
						<span class="status-badge" [class.success]="project.statusTone === 'success'" [class.warning]="project.statusTone === 'warning'" [class.danger]="project.statusTone === 'danger'">{{ project.statusLabel }}</span>
						<chdg-projects-source-badge [label]="project.sourceLabel" [sourceType]="project.sourceType" />
					</div>
					<p class="opened">Last opened: {{ project.lastOpenedLabel }}</p>
					<p class="path">{{ project.path }}</p>
				</div>
			</div>
			<div class="card-actions">
				<button type="button" (click)="openProject.emit(project.path)"><span aria-hidden="true">▰</span> Open</button>
				<button type="button" disabled><span aria-hidden="true">✦</span> Generate</button>
				<button type="button" disabled><span aria-hidden="true">▶</span> Preview</button>
			</div>
		</article>
	`,
	styles: [
		`
		.project-card { background: linear-gradient(180deg, rgba(22, 29, 38, 0.9), rgba(13, 17, 23, 0.76)); border: 1px solid var(--color-border); border-radius: 0.85rem; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18); min-height: 13.1rem; overflow: hidden; }
		.project-card.current { border-color: rgba(166, 108, 255, 0.46); box-shadow: 0 0 0 1px rgba(166, 108, 255, 0.08), 0 16px 48px rgba(0, 0, 0, 0.18); }
		.card-main { display: grid; gap: 1.15rem; grid-template-columns: 5rem minmax(0, 1fr); padding: 1.25rem 1.25rem 1rem; }
		.project-copy { min-width: 0; }
		.project-title-row { align-items: start; display: flex; gap: 0.8rem; justify-content: space-between; }
		h2 { font-size: 1.28rem; letter-spacing: -0.02em; line-height: 1.15; margin: 0; }
		.remove-button { background: transparent; border: 0; color: var(--color-muted); min-height: 2rem; padding: 0.2rem 0.35rem; }
		.remove-button:hover { color: var(--color-danger); }
		.badge-row { align-items: center; display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.65rem 0 0.7rem; }
		.status-badge { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--color-border); border-radius: 0.45rem; color: var(--color-text-soft); display: inline-flex; font-size: 0.78rem; font-weight: 900; line-height: 1; padding: 0.42rem 0.6rem; white-space: nowrap; }
		.status-badge.success { background: rgba(101, 222, 119, 0.14); border-color: rgba(101, 222, 119, 0.34); color: var(--color-success); }
		.status-badge.warning { background: rgba(246, 180, 80, 0.14); border-color: rgba(246, 180, 80, 0.34); color: #ffbd49; }
		.status-badge.danger { background: rgba(255, 107, 122, 0.14); border-color: rgba(255, 107, 122, 0.34); color: var(--color-danger); }
		.opened, .path { font-size: 0.86rem; margin: 0; }
		.path { color: var(--color-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.card-actions { border-top: 1px solid var(--color-border); display: grid; grid-template-columns: repeat(3, 1fr); }
		.card-actions button { background: rgba(255, 255, 255, 0.018); border: 0; border-right: 1px solid var(--color-border); border-radius: 0; color: var(--color-text); font-size: 0.88rem; min-height: 3.05rem; padding: 0.65rem 0.5rem; text-decoration: none; }
		.card-actions button:not(:disabled):hover { background: rgba(151, 83, 229, 0.16); color: var(--color-accent-soft); }
		.card-actions button:disabled { opacity: 0.48; }
		.card-actions :last-child { border-right: 0; }
		@media (max-width: 620px) { .card-main { grid-template-columns: 4.5rem minmax(0, 1fr); padding: 1rem; } .card-actions { grid-template-columns: 1fr; } .card-actions button { border-right: 0; border-top: 1px solid var(--color-border); } }
	`,
	],
})
export class ProjectsProjectCardComponent {
	@Input({ required: true }) project!: ProjectsLibraryItem;
	@Output() openProject = new EventEmitter<string>();
	@Output() requestRemove = new EventEmitter<string>();
}
