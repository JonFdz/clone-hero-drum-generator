import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { ProjectsLibraryItem } from "../../../services/projects-library-model";
import { ProjectsProjectCardComponent } from "./projects-project-card.component";

@Component({
	selector: "chdg-projects-project-grid",
	standalone: true,
	imports: [ProjectsProjectCardComponent],
	template: `
		<section class="project-grid" aria-label="Project cards">
			@for (project of projects; track project.path) {
				<chdg-projects-project-card [project]="project" (openProject)="openProject.emit($event)" (requestRemove)="requestRemove.emit($event)" />
			}
		</section>
	`,
	styles: [
		`
		.project-grid { display: grid; gap: 1rem; grid-template-columns: repeat(2, minmax(20rem, 1fr)); }
		@media (max-width: 1080px) { .project-grid { grid-template-columns: 1fr; } }
	`,
	],
})
export class ProjectsProjectGridComponent {
	@Input() projects: ProjectsLibraryItem[] = [];
	@Output() openProject = new EventEmitter<string>();
	@Output() requestRemove = new EventEmitter<string>();
}
