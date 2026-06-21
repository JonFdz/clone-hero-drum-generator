import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import type { ProjectsSourceType } from "../../../services/projects-library-model";

@Component({
	selector: "chdg-projects-source-badge",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./projects-source-badge.component.html",
	styleUrl: "./projects-source-badge.component.css",
})
export class ProjectsSourceBadgeComponent {
	@Input({ required: true }) label = "Unknown";
	@Input({ required: true }) sourceType: ProjectsSourceType = "unknown";
}
