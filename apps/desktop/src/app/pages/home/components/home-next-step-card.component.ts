import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { HomeNextAction } from "../../../services/home-dashboard-model";

@Component({
	selector: "chdg-home-next-step-card",
	standalone: true,
	template: `
		<section class="card next-step-card">
			<p class="eyebrow">Next recommended action</p>
			<h2>{{ action.label }}</h2>
			<p>{{ action.description }}</p>
			<div class="action-row next-actions">
				<button class="button primary" type="button" (click)="primaryAction.emit()">{{ action.label }}</button>
				@if (action.secondaryLabel && action.secondaryRoute) {
					<button class="button ghost" type="button" (click)="secondaryAction.emit()">{{ action.secondaryLabel }}</button>
				}
			</div>
		</section>
	`,
	styles: [
		`
		.next-step-card { min-height: 100%; }
		.next-actions { justify-content: flex-start; }
	`,
	],
})
export class HomeNextStepCardComponent {
	@Input({ required: true }) action!: HomeNextAction;
	@Output() primaryAction = new EventEmitter<void>();
	@Output() secondaryAction = new EventEmitter<void>();
}
