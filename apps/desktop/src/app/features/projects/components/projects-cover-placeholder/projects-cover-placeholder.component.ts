import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import type { ProjectsSourceType } from "../../projects-library.model";

@Component({
	selector: "chdg-projects-cover-placeholder",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./projects-cover-placeholder.component.html",
	styleUrl: "./projects-cover-placeholder.component.css",
})
export class ProjectsCoverPlaceholderComponent {
	@Input({ required: true }) label = "CH";
	@Input({ required: true }) projectName = "Project";
	@Input() sourceType: ProjectsSourceType = "unknown";

	get icon(): string {
		if (this.sourceType === "midi") return "♫";
		if (this.sourceType === "guitar-pro") return "GP";
		return "▤";
	}
}
