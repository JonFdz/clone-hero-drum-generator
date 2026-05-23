import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import type {
	HomeDashboardModel,
	HomeSecondaryAction,
} from "../../../services/home-dashboard-model";

@Component({
	selector: "chdg-home-dashboard-hero",
	standalone: true,
	imports: [CommonModule],
	template: `
		<section class="card dashboard-hero">
			<div class="hero-copy">
				<p class="eyebrow">{{ model.hasProject ? "Continue work" : "Home launchpad" }}</p>
				<h1>{{ model.projectName }}</h1>
				<p class="hero-path">{{ model.projectFilePathLabel }}</p>

				<div class="readiness-strip" aria-label="Project readiness">
					@for (badge of model.readinessBadges; track badge.label) {
						<span class="readiness-badge" [class]="'readiness-badge tone-' + badge.tone" [title]="badge.detail">
							{{ badge.label }}
						</span>
					}
				</div>

				<div class="next-summary">
					<span>Next</span>
					<strong>{{ model.nextAction.label }}</strong>
					<p>{{ model.nextAction.description }}</p>
				</div>
			</div>

			<div class="hero-actions" aria-label="Home actions">
				<button class="button primary" type="button" (click)="primaryAction.emit()">
					{{ model.nextAction.label }}
				</button>
				<div class="secondary-actions">
					@for (action of model.secondaryActions; track action.kind + ':' + (action.route || action.id) + ':' + action.label) {
						<button class="button secondary" type="button" (click)="secondaryAction.emit(action)">
							{{ action.label }}
						</button>
					}
				</div>
			</div>
		</section>
	`,
	styles: [
		`
		.dashboard-hero {
			align-items: stretch;
			background:
				radial-gradient(circle at 18% 18%, rgba(166, 108, 255, 0.22), transparent 36%),
				linear-gradient(135deg, rgba(32, 39, 54, 0.96), rgba(15, 20, 27, 0.9));
			display: grid;
			gap: var(--space-6);
			grid-template-columns: minmax(0, 1fr) minmax(17rem, 0.34fr);
			min-height: 18rem;
		}
		.dashboard-hero h1 { font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -0.04em; margin-bottom: var(--space-2); }
		.hero-path { color: var(--color-text-soft); margin-bottom: var(--space-5); overflow-wrap: anywhere; }
		.readiness-strip { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-5); }
		.readiness-badge { border: 1px solid var(--color-border); border-radius: 999px; color: var(--color-text-soft); font-size: 0.78rem; font-weight: 800; padding: 0.45rem 0.7rem; }
		.tone-success { background: rgba(101, 222, 119, 0.14); border-color: rgba(101, 222, 119, 0.36); color: var(--color-success); }
		.tone-warning { background: rgba(246, 180, 80, 0.14); border-color: rgba(246, 180, 80, 0.36); color: var(--color-warning); }
		.tone-danger { background: rgba(255, 107, 122, 0.14); border-color: rgba(255, 107, 122, 0.36); color: var(--color-danger); }
		.tone-neutral { background: rgba(151, 83, 229, 0.14); border-color: rgba(151, 83, 229, 0.3); color: var(--color-accent-soft); }
		.next-summary { border-left: 3px solid rgba(166, 108, 255, 0.65); padding-left: var(--space-4); }
		.next-summary span { color: var(--color-muted); display: block; font-size: 0.72rem; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; }
		.next-summary strong { color: var(--color-text); display: block; font-size: 1.15rem; margin: var(--space-1) 0 var(--space-2); }
		.next-summary p { margin: 0; max-width: 44rem; }
		.hero-actions { align-content: center; display: grid; gap: var(--space-3); }
		.hero-actions .button.primary { font-size: 1.03rem; min-height: 3.45rem; }
		.secondary-actions { display: grid; gap: var(--space-2); grid-template-columns: 1fr 1fr; }
		.secondary-actions .button { min-height: 2.65rem; padding-left: 0.8rem; padding-right: 0.8rem; }
		@media (max-width: 1000px) { .dashboard-hero { grid-template-columns: 1fr; min-height: unset; } .hero-actions { align-content: stretch; } }
		@media (max-width: 560px) { .secondary-actions { grid-template-columns: 1fr; } }
	`,
	],
})
export class HomeDashboardHeroComponent {
	@Input({ required: true }) model!: HomeDashboardModel;
	@Output() primaryAction = new EventEmitter<void>();
	@Output() secondaryAction = new EventEmitter<HomeSecondaryAction>();
}
