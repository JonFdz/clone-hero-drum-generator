import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import type { ProjectsLibraryItem } from "../../../services/projects-library-model";
import { ProjectsProjectCardComponent } from "./projects-project-card.component";

@Component({
	selector: "chdg-projects-project-grid",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ProjectsProjectCardComponent],
	templateUrl: "./projects-project-grid.component.html",
	styleUrl: "./projects-project-grid.component.css",
})
export class ProjectsProjectGridComponent {
	@Input() projects: ProjectsLibraryItem[] = [];
	@Output() selectProject = new EventEmitter<string>();
	@Output() editProject = new EventEmitter<string>();
	@Output() requestRemove = new EventEmitter<string>();
}
