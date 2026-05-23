import { Component, Input } from "@angular/core";
import type { ProjectsSourceType } from "../../../services/projects-library-model";

@Component({
	selector: "chdg-projects-cover-placeholder",
	standalone: true,
	template: `
		<div class="cover" [attr.aria-label]="'Cover placeholder for ' + projectName">
			<span class="cover-icon" aria-hidden="true">{{ icon }}</span>
			<span class="cover-label">{{ label }}</span>
		</div>
	`,
	styles: [
		`
		.cover { align-items: center; aspect-ratio: 1; background: linear-gradient(135deg, rgba(151, 83, 229, 0.46), rgba(151, 83, 229, 0.14)); border: 1px solid rgba(166, 108, 255, 0.34); border-radius: 0.85rem; box-shadow: inset 0 0 26px rgba(215, 184, 255, 0.08); display: grid; justify-items: center; min-width: 4.8rem; overflow: hidden; padding: 0.65rem; }
		.cover-icon { color: var(--color-accent-soft); font-size: 1.75rem; line-height: 1; }
		.cover-label { color: var(--color-text); font-size: 0.82rem; font-weight: 900; letter-spacing: 0.08em; margin-top: -0.25rem; }
	`,
	],
})
export class ProjectsCoverPlaceholderComponent {
	@Input({ required: true }) label = "CH";
	@Input({ required: true }) projectName = "Project";
	@Input() sourceType: ProjectsSourceType = "unknown";

	get icon(): string {
		if (this.sourceType === "midi") return "♫";
		if (this.sourceType === "guitar-pro") return "GP";
		return "▤";
	}
}
