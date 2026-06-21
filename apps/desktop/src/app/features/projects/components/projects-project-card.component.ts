import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import type { ProjectsLibraryItem } from "../../../services/projects-library-model";
import { ProjectsCoverPlaceholderComponent } from "./projects-cover-placeholder.component";
import { ProjectsSourceBadgeComponent } from "./projects-source-badge.component";

@Component({
	selector: "chdg-projects-project-card",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ProjectsCoverPlaceholderComponent, ProjectsSourceBadgeComponent],
	templateUrl: "./projects-project-card.component.html",
	styleUrl: "./projects-project-card.component.css",
})
export class ProjectsProjectCardComponent {
	@Input({ required: true }) project!: ProjectsLibraryItem;
	@Output() selectProject = new EventEmitter<string>();
	@Output() editProject = new EventEmitter<string>();
	@Output() requestRemove = new EventEmitter<string>();
}
