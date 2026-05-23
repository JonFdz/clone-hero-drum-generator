import { Component, Input } from "@angular/core";
import type { HomeStatusCard } from "../../../services/home-dashboard-model";

@Component({
	selector: "chdg-home-project-status-cards",
	standalone: true,
	template: `
		<section class="status-grid" aria-label="Project health status">
			@for (card of cards; track card.label) {
				<div class="mini-card status-card" [class]="'status-card tone-' + card.tone">
					<span>{{ card.label }}</span>
					<strong>{{ card.value }}</strong>
					<p>{{ card.detail }}</p>
				</div>
			}
		</section>
	`,
	styles: [
		`
		.status-grid { display: grid; gap: var(--space-4); grid-template-columns: repeat(4, minmax(0, 1fr)); }
		.status-card { min-height: 8rem; }
		.status-card span { color: var(--color-muted); font-size: 0.78rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
		.status-card strong { color: var(--color-text); display: block; font-size: 1.25rem; margin: var(--space-2) 0; }
		.status-card p { font-size: 0.88rem; margin: 0; }
		.tone-success { border-color: rgba(101, 222, 119, 0.32); }
		.tone-warning { border-color: rgba(246, 180, 80, 0.38); }
		.tone-danger { border-color: rgba(255, 107, 122, 0.38); }
		@media (max-width: 1000px) { .status-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
		@media (max-width: 620px) { .status-grid { grid-template-columns: 1fr; } }
	`,
	],
})
export class HomeProjectStatusCardsComponent {
	@Input({ required: true }) cards!: HomeStatusCard[];
}
