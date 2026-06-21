import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import type { HomeWorkflowStep } from "../../../services/home-dashboard-model";

@Component({
	selector: "chdg-home-workflow-progress",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./home-workflow-progress.component.html",
	styleUrl: "./home-workflow-progress.component.css",
})
export class HomeWorkflowProgressComponent {
	@Input({ required: true }) steps!: HomeWorkflowStep[];

	iconFor(index: number): string {
		switch (index) {
			case 1:
				return "↓";
			case 2:
				return "⌕";
			case 3:
				return "♬";
			case 4:
				return "✦";
			case 5:
				return "▱";
			case 6:
				return "▶";
			default:
				return `${index}`;
		}
	}
}
