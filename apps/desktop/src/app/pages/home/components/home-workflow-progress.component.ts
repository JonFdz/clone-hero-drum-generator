import { Component, Input } from "@angular/core";
import type { HomeWorkflowStep } from "../../../services/home-dashboard-model";

@Component({
	selector: "chdg-home-workflow-progress",
	standalone: true,
	template: `
		<section class="card workflow-card">
			<div class="workflow-heading">
				<p class="eyebrow">Workflow</p>
				<h2>From source to preview</h2>
			</div>
			<div class="workflow-strip" aria-label="Canonical desktop workflow">
				@for (step of steps; track step.index) {
					<div class="workflow-node" [class]="'workflow-node status-' + step.status">
						<div class="node-index">{{ step.index }}</div>
						<strong>{{ step.label }}</strong>
						<span>{{ step.description }}</span>
					</div>
				}
			</div>
		</section>
	`,
	styles: [
		`
		.workflow-card { overflow: hidden; }
		.workflow-heading { margin-bottom: var(--space-4); }
		.workflow-strip { display: grid; gap: var(--space-3); grid-template-columns: repeat(6, minmax(0, 1fr)); }
		.workflow-node { position: relative; text-align: center; }
		.workflow-node:not(:last-child)::after { border-top: 2px dashed rgba(151, 83, 229, 0.32); content: ""; left: calc(50% + 1.65rem); position: absolute; right: calc(-50% + 1.65rem); top: 1.2rem; }
		.node-index { background: rgba(151, 83, 229, 0.18); border: 1px solid rgba(151, 83, 229, 0.42); border-radius: 999px; color: var(--color-accent-soft); display: grid; font-weight: 900; height: 2.35rem; margin: 0 auto var(--space-2); place-items: center; width: 2.35rem; }
		.workflow-node strong { color: var(--color-text); display: block; font-size: 0.86rem; line-height: 1.2; }
		.workflow-node span { color: var(--color-muted); display: block; font-size: 0.74rem; margin-top: var(--space-1); }
		.status-complete .node-index { background: rgba(101, 222, 119, 0.16); border-color: rgba(101, 222, 119, 0.38); color: var(--color-success); }
		.status-current .node-index { background: rgba(166, 108, 255, 0.28); box-shadow: 0 0 0 0.32rem rgba(166, 108, 255, 0.08); }
		.status-available .node-index { background: rgba(114, 178, 255, 0.14); border-color: rgba(114, 178, 255, 0.34); color: #8fc2ff; }
		.status-blocked .node-index { background: rgba(255, 107, 122, 0.12); border-color: rgba(255, 107, 122, 0.28); color: var(--color-danger); }
		.status-upcoming, .status-unknown { opacity: 0.68; }
		@media (max-width: 1100px) { .workflow-strip { grid-template-columns: repeat(3, minmax(0, 1fr)); } .workflow-node::after { display: none; } }
		@media (max-width: 620px) { .workflow-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
	`,
	],
})
export class HomeWorkflowProgressComponent {
	@Input({ required: true }) steps!: HomeWorkflowStep[];
}
