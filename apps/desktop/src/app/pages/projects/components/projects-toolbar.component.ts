import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { ProjectsSortMode, ProjectsSourceFilter } from "../../../services/projects-library-model";

@Component({
	selector: "chdg-projects-toolbar",
	standalone: true,
	template: `
		<section class="toolbar" aria-label="Project library controls">
			<label class="search-field">
				<span class="search-icon" aria-hidden="true">⌕</span>
				<span class="sr-only">Search projects</span>
				<input type="search" placeholder="Search projects..." [value]="query" (input)="queryChange.emit(inputValue($event))" />
			</label>

			<div class="control-group" aria-label="Source filters">
				@for (option of sourceOptions; track option.value) {
					<button class="filter-chip" type="button" [class.active]="sourceFilter === option.value" (click)="sourceFilterChange.emit(option.value)">{{ option.label }}</button>
				}
			</div>

			<label class="select-label">
				<span>Sort</span>
				<select [value]="sortMode" (change)="sortModeChange.emit(sortValue($event))">
					<option value="last-opened">Last opened</option>
					<option value="name-az">Name A-Z</option>
				</select>
			</label>

			<p class="result-count">{{ resultCount }} shown</p>
		</section>
	`,
	styles: [
		`
		.toolbar { align-items: center; display: grid; gap: 1rem; grid-template-columns: minmax(16rem, 1fr) auto auto auto; margin-bottom: 1rem; }
		.search-field { display: block; position: relative; }
		.search-field input { min-height: 3rem; padding-left: 2.7rem; width: 100%; }
		.search-icon { color: var(--color-muted); font-size: 1.35rem; left: 1rem; position: absolute; top: 50%; transform: translateY(-50%); }
		.control-group { display: flex; flex-wrap: wrap; gap: 0.55rem; }
		.filter-chip { background: rgba(255, 255, 255, 0.035); border-color: var(--color-border); color: var(--color-text-soft); min-height: 2.65rem; padding: 0.55rem 0.9rem; }
		.filter-chip.active { background: rgba(151, 83, 229, 0.25); border-color: rgba(166, 108, 255, 0.55); color: var(--color-accent-soft); }
		.select-label { align-items: center; display: flex; flex-direction: row; gap: 0.55rem; }
		.select-label span { color: var(--color-muted); font-size: 0.78rem; text-transform: uppercase; }
		.select-label select { min-height: 2.65rem; min-width: 10rem; }
		.result-count { color: var(--color-muted); font-size: 0.86rem; font-weight: 800; margin: 0; white-space: nowrap; }
		.sr-only { height: 1px; left: -10000px; overflow: hidden; position: absolute; top: auto; width: 1px; }
		@media (max-width: 1180px) { .toolbar { grid-template-columns: 1fr; } .result-count { justify-self: start; } }
	`,
	],
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
