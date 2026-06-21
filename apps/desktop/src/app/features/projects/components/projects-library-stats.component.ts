import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import type { ProjectsLibraryStats } from "../../../services/projects-library-model";

@Component({
	selector: "chdg-projects-library-stats",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./projects-library-stats.component.html",
	styleUrl: "./projects-library-stats.component.css",
})
export class ProjectsLibraryStatsComponent {
	@Input({ required: true }) stats!: ProjectsLibraryStats;
}
