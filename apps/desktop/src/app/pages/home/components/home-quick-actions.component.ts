import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { HomeQuickAction } from "../../../services/home-dashboard-model";

@Component({
	selector: "chdg-home-quick-actions",
	standalone: true,
	template: `
		<section class="card quick-actions">
			<p class="eyebrow">Quick Actions</p>
			<h2>Launchpad</h2>
			<div class="action-list">
				@for (action of actions; track action.id) {
					<button class="button secondary action-button" type="button" (click)="activate(action)">
						{{ action.label }}
					</button>
				}
			</div>
		</section>
	`,
	styles: [
		`
		.quick-actions { min-height: 100%; }
		.action-list { display: grid; gap: var(--space-3); margin-top: var(--space-4); }
		.action-button { justify-content: flex-start; min-height: 3.2rem; }
	`,
	],
})
export class HomeQuickActionsComponent {
	@Input({ required: true }) actions!: HomeQuickAction[];
	@Output() routeAction = new EventEmitter<string>();
	@Output() openProject = new EventEmitter<void>();

	activate(action: HomeQuickAction): void {
		if (action.kind === "open-project") {
			this.openProject.emit();
			return;
		}
		if (action.route) this.routeAction.emit(action.route);
	}
}
