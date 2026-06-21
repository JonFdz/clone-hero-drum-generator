import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { ProjectLibraryService } from "../projects/public-api";
import { ProjectPersistenceService, ProjectSessionStore, ProjectWorkflowHydrator } from "../project-session/public-api";
import { deriveHomeDashboardModel } from "../../services/home-dashboard-model";
import { HomeRecentProjectsCompactComponent } from "./components/home-recent-projects-compact.component";
import { HomeWarningsPanelComponent } from "./components/home-warnings-panel.component";
import { HomeWorkflowProgressComponent } from "./components/home-workflow-progress.component";
import { HomeService } from "./home.service";

@Component({
	selector: "chdg-home-page",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule,
		HomeRecentProjectsCompactComponent,
		HomeWarningsPanelComponent,
		HomeWorkflowProgressComponent,
	],
	templateUrl: "./home-page.component.html",
	styleUrl: "./home-page.component.css",
})
export class HomePageComponent {
	private readonly session = inject(ProjectSessionStore);
	private readonly persistence = inject(ProjectPersistenceService);
	private readonly library = inject(ProjectLibraryService);
	private readonly generateState = inject(DesktopGenerateStateService);
	private readonly workflowHydrator = inject(ProjectWorkflowHydrator);
	private readonly router = inject(Router);
	private readonly home = inject(HomeService);

	readonly model = computed(() =>
		deriveHomeDashboardModel({
			project: { ...this.session.state(), recentProjects: this.library.recentProjects(), settings: { schemaVersion: 1, theme: "dark", projectLocation: "" } },
			generate: this.generateState.state(),
			hasProject: this.session.hasProject(),
			isDirty: this.session.isDirty(),
		}),
	);

	async navigateTo(route: string): Promise<void> {
		await this.router.navigateByUrl(route);
	}

	async openRecent(filePath: string): Promise<void> {
		const result = await this.persistence.openProject(filePath);
		if (result.ok) {
			this.workflowHydrator.hydrate(result.payload);
			await this.library.refresh();
			await this.navigateTo(this.model().nextAction.route);
		}
	}

	async removeRecent(filePath: string): Promise<void> {
		await this.library.remove(filePath);
	}

	async openProject(): Promise<void> {
		const result = await this.persistence.openProjectFromPicker();
		if (result.ok) {
			this.workflowHydrator.hydrate(result.payload);
			await this.library.refresh();
			await this.navigateTo(this.model().nextAction.route);
		}
	}

	async openOutputFolder(): Promise<void> {
		const outputDir = this.generateState.state().outputDir;
		if (!outputDir) {
			await this.navigateTo("/projects/details");
			return;
		}
		await this.home.openOutputFolder(outputDir);
	}
}
