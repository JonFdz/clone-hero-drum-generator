import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
	selector: "chdg-projects-library-header",
	standalone: true,
	imports: [RouterModule],
	template: `
		<header class="library-header">
			<div>
				<h1>Projects</h1>
				<p>Manage your CHDG projects.</p>
			</div>
			<div class="header-actions">
				<span class="project-count" aria-label="Total recent projects">{{ projectCount }} projects</span>
				<button class="button ghost" type="button" (click)="openProject.emit()">▰ Open Project</button>
				<button class="button primary" type="button" (click)="newProject.emit()">＋ New Project</button>
			</div>
		</header>
	`,
	styles: [
		`
		.library-header { align-items: end; display: flex; gap: 1rem; justify-content: space-between; margin: 0.3rem 0 1.35rem; }
		.library-header h1 { font-size: clamp(2rem, 3vw, 2.55rem); letter-spacing: -0.04em; margin-bottom: 0.45rem; }
		.library-header p { color: var(--color-text-soft); font-size: 1rem; margin: 0; }
		.header-actions { align-items: center; display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: end; }
		.project-count { background: rgba(255, 255, 255, 0.04); border: 1px solid var(--color-border); border-radius: 999px; color: var(--color-muted); font-size: 0.82rem; font-weight: 800; padding: 0.5rem 0.75rem; }
		@media (max-width: 860px) { .library-header { align-items: start; flex-direction: column; } .header-actions { justify-content: start; } }
	`,
	],
})
export class ProjectsLibraryHeaderComponent {
	@Input() projectCount = 0;
	@Output() openProject = new EventEmitter<void>();
	@Output() newProject = new EventEmitter<void>();
}
