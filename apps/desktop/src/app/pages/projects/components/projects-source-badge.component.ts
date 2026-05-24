import { Component, Input } from "@angular/core";
import type { ProjectsSourceType } from "../../../services/projects-library-model";

@Component({
	selector: "chdg-projects-source-badge",
	standalone: true,
	template: `<span class="source-badge" [class.midi]="sourceType === 'midi'" [class.gp]="sourceType === 'guitar-pro'">{{ label }}</span>`,
	styles: [
		`
		.source-badge { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--color-border); border-radius: 0.45rem; color: var(--color-text-soft); display: inline-flex; font-size: 0.78rem; font-weight: 800; line-height: 1; padding: 0.42rem 0.6rem; white-space: nowrap; }
		.source-badge.midi { color: #b7c9ff; }
		.source-badge.gp { color: var(--color-accent-soft); }
	`,
	],
})
export class ProjectsSourceBadgeComponent {
	@Input({ required: true }) label = "Unknown";
	@Input({ required: true }) sourceType: ProjectsSourceType = "unknown";
}
