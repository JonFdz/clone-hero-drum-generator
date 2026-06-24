import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import type { HomeRecentProjectItem } from "../home-dashboard.model";

@Component({
	selector: "chdg-home-recent-projects-compact",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./home-recent-projects-compact.component.html",
	styleUrl: "./home-recent-projects-compact.component.css",
})
export class HomeRecentProjectsCompactComponent {
	@Input({ required: true }) projects!: HomeRecentProjectItem[];
	@Output() openProject = new EventEmitter<string>();
	@Output() removeProject = new EventEmitter<string>();
	@Output() viewAll = new EventEmitter<void>();

	removeProjectClick(event: Event, path: string): void {
		event.stopPropagation();
		this.removeProject.emit(path);
	}
}
