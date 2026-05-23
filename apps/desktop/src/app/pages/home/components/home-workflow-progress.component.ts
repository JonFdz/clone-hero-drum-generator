import { Component, Input } from "@angular/core";
import type { HomeWorkflowStep } from "../../../services/home-dashboard-model";

@Component({
	selector: "chdg-home-workflow-progress",
	standalone: true,
	template: `
		<section class="card workflow-overview-card">
			<h2>Workflow Overview</h2>
			<div class="workflow-mock-strip" aria-label="Canonical desktop workflow">
				@for (step of steps; track step.index) {
					<div class="workflow-mock-step" [class]="'workflow-mock-step status-' + step.status">
						<div class="workflow-icon">{{ iconFor(step.index) }}</div>
						<div class="step-number">{{ step.index }}</div>
						<strong>{{ step.label }}</strong>
						<p>{{ step.description }}</p>
					</div>
				}
			</div>
		</section>
	`,
	styles: [
		`
		.workflow-overview-card { min-height: 18.3rem; overflow: hidden; padding: 1.35rem; }
		.workflow-overview-card h2 { margin-bottom: 1.65rem; }
		.workflow-mock-strip { display: grid; gap: 1.1rem; grid-template-columns: repeat(6, minmax(0, 1fr)); }
		.workflow-mock-step { position: relative; text-align: center; }
		.workflow-mock-step:not(:last-child)::after { border-top: 3px dotted rgba(188, 157, 255, 0.32); content: ""; left: calc(50% + 2.35rem); position: absolute; right: calc(-50% + 2.25rem); top: 2.35rem; }
		.workflow-icon { background: linear-gradient(135deg, rgba(151, 83, 229, 0.48), rgba(151, 83, 229, 0.22)); border: 1px solid rgba(188, 157, 255, 0.32); border-radius: 50%; color: var(--color-accent-soft); display: grid; font-size: 2rem; height: 4.7rem; margin: 0 auto 0.55rem; place-items: center; width: 4.7rem; }
		.step-number { background: rgba(151, 83, 229, 0.72); border-radius: 999px; color: var(--color-text); display: grid; font-size: 0.76rem; font-weight: 900; height: 1.55rem; margin: 0 auto 0.9rem; place-items: center; width: 1.55rem; }
		.workflow-mock-step strong { color: var(--color-text); display: block; font-size: 0.88rem; margin-bottom: 0.4rem; }
		.workflow-mock-step p { font-size: 0.78rem; line-height: 1.35; margin: 0; }
		.status-complete .workflow-icon { border-color: rgba(101, 222, 119, 0.34); }
		.status-current .workflow-icon { box-shadow: 0 0 0 0.32rem rgba(166, 108, 255, 0.08); }
		.status-blocked .workflow-icon { border-color: rgba(255, 107, 122, 0.32); }
		.status-upcoming, .status-unknown { opacity: 0.78; }
		@media (max-width: 1180px) { .workflow-mock-strip { grid-template-columns: repeat(3, minmax(0, 1fr)); row-gap: 1.4rem; } .workflow-mock-step::after { display: none; } }
		@media (max-width: 640px) { .workflow-mock-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
	`,
	],
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
