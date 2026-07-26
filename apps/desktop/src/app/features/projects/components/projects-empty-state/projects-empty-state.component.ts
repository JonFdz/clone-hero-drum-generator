import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
	selector: "chdg-projects-empty-state",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterModule],
	templateUrl: "./projects-empty-state.component.html",
	styleUrl: "./projects-empty-state.component.css",
})
export class ProjectsEmptyStateComponent {
	@Input() hasProjects = false;
	@Input() newProjectUnavailableMessage = "";
	@Output() openProject = new EventEmitter<void>();
	@Output() resetFilters = new EventEmitter<void>();
}
