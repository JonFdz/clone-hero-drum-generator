import { Component, Input } from "@angular/core";
import type { MissingPathWarning } from "../../../services/desktop-project-state.service";
import type { HomeDashboardModel } from "../../../services/home-dashboard-model";

@Component({
	selector: "chdg-home-warnings-panel",
	standalone: true,
	template: `
		@if (warnings.length > 0 || model.outputStatus.tone === "danger") {
			<section class="card warning-panel">
				<p class="eyebrow">Needs attention</p>
				@if (warnings.length > 0) {
					<h2>Missing project paths</h2>
					<ul>
						@for (warning of warnings; track warning.kind) {
							<li>
								<strong>{{ labelFor(warning.kind) }}</strong>
								<span>{{ warning.path || warning.message }}</span>
							</li>
						}
					</ul>
					<p>Use Continue Setup to choose the missing source, audio, output folder, or optional cover again.</p>
				}
				@if (model.outputStatus.tone === "danger") {
					<h2>Generation failed</h2>
					<p>{{ model.outputStatus.detail }} Open Generate to review the latest logs and retry safely.</p>
				}
			</section>
		}
	`,
	styles: [
		`
		.warning-panel { border-color: rgba(246, 180, 80, 0.42); }
		.warning-panel ul { display: grid; gap: var(--space-3); list-style: none; margin: 0 0 var(--space-4); padding: 0; }
		.warning-panel li { background: rgba(246, 180, 80, 0.08); border: 1px solid rgba(246, 180, 80, 0.24); border-radius: var(--radius-md); display: grid; gap: var(--space-2); padding: var(--space-3); }
		.warning-panel strong { color: var(--color-warning); }
		.warning-panel span { color: var(--color-text-soft); overflow-wrap: anywhere; }
	`,
	],
})
export class HomeWarningsPanelComponent {
	@Input({ required: true }) model!: HomeDashboardModel;
	@Input({ required: true }) warnings!: MissingPathWarning[];

	labelFor(kind: MissingPathWarning["kind"]): string {
		switch (kind) {
			case "sourcePath":
				return "Source file";
			case "audioPath":
				return "Audio file";
			case "outputDir":
				return "Output folder";
			case "coverImagePath":
				return "Cover image";
		}
	}
}
