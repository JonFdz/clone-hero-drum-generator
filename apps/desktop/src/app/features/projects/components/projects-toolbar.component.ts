import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import type { ProjectsSortMode, ProjectsSourceFilter } from "../projects-library.model";

@Component({
	selector: "chdg-projects-toolbar",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./projects-toolbar.component.html",
	styleUrl: "./projects-toolbar.component.css",
})
export class ProjectsToolbarComponent {
	@Input() query = "";
	@Input() sourceFilter: ProjectsSourceFilter = "all";
	@Input() sortMode: ProjectsSortMode = "last-opened";
	@Input() resultCount = 0;
	@Output() queryChange = new EventEmitter<string>();
	@Output() sourceFilterChange = new EventEmitter<ProjectsSourceFilter>();
	@Output() sortModeChange = new EventEmitter<ProjectsSortMode>();

	readonly sourceOptions: Array<{ value: ProjectsSourceFilter; label: string }> = [
		{ value: "all", label: "All" },
		{ value: "midi", label: "MIDI-like" },
		{ value: "guitar-pro", label: "Guitar Pro-like" },
		{ value: "unknown", label: "Unknown" },
	];

	inputValue(event: Event): string {
		return (event.target as HTMLInputElement).value;
	}

	sortValue(event: Event): ProjectsSortMode {
		return (event.target as HTMLSelectElement).value as ProjectsSortMode;
	}
}
