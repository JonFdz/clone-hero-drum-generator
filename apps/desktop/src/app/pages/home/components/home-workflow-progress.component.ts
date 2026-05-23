import { Component, Input } from "@angular/core";
import type { HomeWorkflowStep } from "../../../services/home-dashboard-model";

@Component({
	selector: "chdg-home-workflow-progress",
	standalone: true,
	template: `
		<section class="card workflow-card">
			<p class="eyebrow">Workflow</p>
			<h2>Generation progress</h2>
			<div class="workflow-strip" aria-label="Canonical desktop workflow">
				@for (step of steps; track step.index) {
					<div class="workflow-node" [class]="'workflow-node status-' + step.status">
						<div class="node-index">{{ step.index }}</div>
						<strong>{{ step.label }}</strong>
						<span>{{ step.status }}</span>
						<p>{{ step.description }}</p>
					</div>
				}
			</div>
		</section>
	`,
	styles: [
		`
		.workflow-card { overflow: hidden; }
		.workflow-strip { display: grid; gap: var(--space-3); grid-template-columns: repeat(6, minmax(0, 1fr)); margin-top: var(--space-5); }
		.workflow-node { position: relative; text-align: center; }
		.workflow-node:not(:last-child)::after { border-top: 2px dashed rgba(151, 83, 229, 0.32); content: ""; left: calc(50% + 2rem); position: absolute; right: calc(-50% + 2rem); top: 1.35rem; }
		.node-index { background: rgba(151, 83, 229, 0.18); border: 1px solid rgba(151, 83, 229, 0.42); border-radius: 999px; color: var(--color-accent-soft); display: grid; font-weight: 900; height: 2.7rem; margin: 0 auto var(--space-3); place-items: center; width: 2.7rem; }
		.workflow-node strong { color: var(--color-text); display: block; font-size: 0.95rem; }
		.workflow-node span { color: var(--color-muted); display: block; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; margin: var(--space-2) 0; text-transform: uppercase; }
		.workflow-node p { font-size: 0.78rem; margin: 0; }
		.status-complete .node-index { background: rgba(101, 222, 119, 0.16); border-color: rgba(101, 222, 119, 0.38); color: var(--color-success); }
		.status-current .node-index { background: rgba(166, 108, 255, 0.28); box-shadow: 0 0 0 0.35rem rgba(166, 108, 255, 0.08); }
		.status-blocked .node-index { background: rgba(255, 107, 122, 0.12); border-color: rgba(255, 107, 122, 0.28); color: var(--color-danger); }
		.status-upcoming, .status-unknown { opacity: 0.72; }
		@media (max-width: 1100px) { .workflow-strip { grid-template-columns: repeat(3, minmax(0, 1fr)); } .workflow-node::after { display: none; } }
		@media (max-width: 620px) { .workflow-strip { grid-template-columns: 1fr; } }
	`,
	],
})
export class HomeWorkflowProgressComponent {
	@Input({ required: true }) steps!: HomeWorkflowStep[];
}
