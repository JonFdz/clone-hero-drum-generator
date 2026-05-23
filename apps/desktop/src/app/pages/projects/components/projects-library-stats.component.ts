import { Component, Input } from "@angular/core";
import type { ProjectsLibraryStats } from "../../../services/projects-library-model";

@Component({
	selector: "chdg-projects-library-stats",
	standalone: true,
	template: `
		<aside class="stats-panel" aria-label="Library stats">
			<section class="stats-card overview-card">
				<h2>Library Overview</h2>
				<div class="total-ring" aria-label="Total recent projects">
					<strong>{{ stats.totalProjects }}</strong>
					<span>Total Projects</span>
				</div>
				<div class="metric-list">
					<div><span>Opened Today</span><strong>{{ stats.openedToday }}</strong></div>
					<div><span>Opened This Week</span><strong>{{ stats.openedThisWeek }}</strong></div>
					<div><span>Most Recent</span><strong>{{ stats.mostRecentLabel }}</strong></div>
				</div>
			</section>

			<section class="stats-card">
				<h2>Source Types</h2>
				<div class="source-row midi"><span>MIDI-like</span><strong>{{ stats.sourceCounts.midi }}</strong></div>
				<div class="source-row gp"><span>Guitar Pro-like</span><strong>{{ stats.sourceCounts['guitar-pro'] }}</strong></div>
				<div class="source-row unknown"><span>Unknown</span><strong>{{ stats.sourceCounts.unknown }}</strong></div>
			</section>
		</aside>
	`,
	styles: [
		`
		.stats-panel { display: grid; gap: 1rem; }
		.stats-card { background: linear-gradient(180deg, rgba(22, 29, 38, 0.9), rgba(13, 17, 23, 0.78)); border: 1px solid var(--color-border); border-radius: 0.85rem; padding: 1.25rem; }
		.stats-card h2 { font-size: 1rem; margin-bottom: 1rem; }
		.total-ring { align-items: center; background: radial-gradient(circle, rgba(13, 17, 23, 0.94) 48%, transparent 50%), conic-gradient(var(--color-success) 0 33%, #ffbd49 33% 66%, var(--color-accent) 66% 100%); border-radius: 50%; display: grid; height: 8rem; justify-items: center; margin: 0.4rem auto 1rem; place-content: center; width: 8rem; }
		.total-ring strong { font-size: 2.15rem; line-height: 1; }
		.total-ring span { color: var(--color-text-soft); font-size: 0.74rem; margin-top: 0.2rem; }
		.metric-list { display: grid; gap: 0.65rem; }
		.metric-list div, .source-row { align-items: center; background: rgba(255, 255, 255, 0.025); border: 1px solid rgba(197, 209, 225, 0.08); border-radius: 0.6rem; display: flex; gap: 0.7rem; justify-content: space-between; padding: 0.75rem 0.85rem; }
		.metric-list span, .source-row span { color: var(--color-text-soft); font-size: 0.87rem; }
		.metric-list strong, .source-row strong { color: var(--color-text); font-size: 0.95rem; text-align: right; }
		.source-row::before { border-radius: 50%; content: ""; height: 0.65rem; width: 0.65rem; }
		.source-row span { margin-right: auto; }
		.source-row.midi::before { background: #7fb5ff; }
		.source-row.gp::before { background: var(--color-accent); }
		.source-row.unknown::before { background: var(--color-muted); }
	`,
	],
})
export class ProjectsLibraryStatsComponent {
	@Input({ required: true }) stats!: ProjectsLibraryStats;
}
