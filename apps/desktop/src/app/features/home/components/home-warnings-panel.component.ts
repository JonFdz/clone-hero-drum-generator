import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import type { MissingPathWarning } from "../../../services/desktop-project-state.service";
import type { HomeDashboardModel } from "../home-dashboard.model";

@Component({
	selector: "chdg-home-warnings-panel",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./home-warnings-panel.component.html",
	styleUrl: "./home-warnings-panel.component.css",
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
