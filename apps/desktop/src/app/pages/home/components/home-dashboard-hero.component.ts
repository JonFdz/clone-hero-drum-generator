import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { HomeDashboardModel } from "../../../services/home-dashboard-model";

@Component({
	selector: "chdg-home-dashboard-hero",
	standalone: true,
	imports: [CommonModule],
	template: `
		<section class="card dashboard-hero">
			<div class="hero-copy">
				<p class="eyebrow">Current project</p>
				<h1>{{ model.projectName }}</h1>
				<p class="hero-path">{{ model.projectFilePathLabel }}</p>
				<div class="hero-pills" aria-label="Project status">
					<span class="pill" [class]="'pill status-' + model.outputStatus.tone">{{ model.outputStatus.label }}</span>
					@if (model.isDirty) {
						<span class="pill muted">Modified</span>
					}
					@if (model.missingPathCount > 0) {
						<span class="pill status-warning">{{ model.missingPathCount }} missing path(s)</span>
					}
				</div>
				<p class="hero-detail">{{ model.nextAction.description }}</p>
			</div>

			<div class="hero-actions">
				<button class="button primary" type="button" (click)="primaryAction.emit()">
					{{ model.nextAction.label }}
				</button>
				<div class="action-row compact-actions">
					<button class="button secondary" type="button" (click)="newProject.emit()">New Project</button>
					<button class="button ghost" type="button" (click)="openProject.emit()">Open Project</button>
				</div>
			</div>
		</section>
	`,
	styles: [
		`
		.dashboard-hero {
			align-items: stretch;
			background:
				radial-gradient(circle at 20% 20%, rgba(166, 108, 255, 0.22), transparent 34%),
				linear-gradient(135deg, rgba(31, 39, 54, 0.96), rgba(17, 23, 31, 0.86));
			display: grid;
			gap: var(--space-6);
			grid-template-columns: minmax(0, 1fr) minmax(15rem, 0.32fr);
		}
		.dashboard-hero h1 { margin-bottom: var(--space-2); }
		.hero-path { color: var(--color-text-soft); overflow-wrap: anywhere; }
		.hero-pills { display: flex; flex-wrap: wrap; gap: var(--space-2); margin: var(--space-4) 0; }
		.hero-detail { max-width: 46rem; }
		.hero-actions { align-content: center; display: grid; gap: var(--space-3); }
		.hero-actions .button.primary { font-size: 1rem; min-height: 3.25rem; }
		.compact-actions { justify-content: stretch; }
		.compact-actions .button { flex: 1; }
		.pill.muted { background: rgba(255, 255, 255, 0.05); border-color: var(--color-border); color: var(--color-text-soft); }
		.status-success { background: rgba(101, 222, 119, 0.14); border-color: rgba(101, 222, 119, 0.38); color: var(--color-success); }
		.status-warning { background: rgba(246, 180, 80, 0.14); border-color: rgba(246, 180, 80, 0.38); color: var(--color-warning); }
		.status-danger { background: rgba(255, 107, 122, 0.14); border-color: rgba(255, 107, 122, 0.38); color: var(--color-danger); }
		.status-neutral { background: rgba(151, 83, 229, 0.16); border-color: rgba(151, 83, 229, 0.34); color: var(--color-accent-soft); }
		@media (max-width: 900px) { .dashboard-hero { grid-template-columns: 1fr; } }
	`,
	],
})
export class HomeDashboardHeroComponent {
	@Input({ required: true }) model!: HomeDashboardModel;
	@Output() primaryAction = new EventEmitter<void>();
	@Output() newProject = new EventEmitter<void>();
	@Output() openProject = new EventEmitter<void>();
}
