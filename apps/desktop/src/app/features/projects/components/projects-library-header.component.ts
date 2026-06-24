import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
	selector: "chdg-projects-library-header",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterModule],
	templateUrl: "./projects-library-header.component.html",
	styleUrl: "./projects-library-header.component.css",
})
export class ProjectsLibraryHeaderComponent {
	@Input() projectCount = 0;
	@Output() openProject = new EventEmitter<void>();
	@Output() newProject = new EventEmitter<void>();
}
