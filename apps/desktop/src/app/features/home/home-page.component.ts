import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { ProjectLibraryService } from "../projects/public-api";
import { ProjectPersistenceService, ProjectSessionStore, ProjectWorkflowHydrator } from "../project-session/public-api";
import {
	deriveHomeDashboardModel,
	deriveHomeOutputReadiness,
} from "./home-dashboard.model";
import { HomeRecentProjectsCompactComponent } from "./components/home-recent-projects-compact/home-recent-projects-compact.component";
import { HomeWarningsPanelComponent } from "./components/home-warnings-panel/home-warnings-panel.component";
import { HomeWorkflowProgressComponent } from "./components/home-workflow-progress/home-workflow-progress.component";
import { HomeService } from "./home.service";

export const HOME_CREATION_IMPORT_UNAVAILABLE_MESSAGE =
	"Canonical project creation and source import are not available in this legacy workflow.";

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
	readonly creationImportUnavailableMessage =
		HOME_CREATION_IMPORT_UNAVAILABLE_MESSAGE;
	readonly outputReadiness = computed(() =>
		deriveHomeOutputReadiness({
			outputStatus: this.session.outputStatus(),
			outputDir: this.generateState.state().outputDir,
			missingPathWarnings: this.session.missingPathWarnings(),
		}),
	);
	readonly canOpenOutputFolder = computed(
		() => this.outputReadiness().canOpenOutputFolder,
	);
	readonly outputFolderActionTitle = computed(() =>
		this.outputReadiness().recordedTargetMissing ||
		this.outputReadiness().requiredManagedPreviewMissing
			? "The recorded export target or required managed preview files are unavailable"
			: this.outputReadiness().hasRecordedTarget
				? "Open the persisted export target"
				: "No export target is recorded for this project",
	);

	readonly model = computed(() =>
		deriveHomeDashboardModel({
			projectName: this.session.projectName(),
			projectFilePath: this.session.projectFilePath(),
			outputStatus: this.session.outputStatus(),
			missingPathWarnings: this.session.missingPathWarnings(),
			recentProjects: this.library.recentProjects(),
			hasProject: this.session.hasProject(),
			isDirty: this.session.isDirty(),
			sourcePath: this.generateState.state().sourcePath,
			audioPath: this.generateState.state().audioPath,
			outputDir: this.generateState.state().outputDir,
			selectedTrackCount: this.generateState.state().selectedTracks.length,
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
		if (!outputDir || !this.canOpenOutputFolder()) return;
		await this.home.openOutputFolder(outputDir);
	}
}
