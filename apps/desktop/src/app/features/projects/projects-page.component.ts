import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import {
	PROJECT_PERSISTENCE_UNAVAILABLE_MESSAGE,
	ProjectPersistenceService,
	ProjectSessionStore,
	ProjectWorkflowHydrator,
} from "../project-session/public-api";
import {
	deriveProjectsLibraryModel,
	type ProjectsLibraryItem,
	type ProjectsSortMode,
	type ProjectsSourceFilter,
} from "./projects-library.model";
import { ProjectsEmptyStateComponent } from "./components/projects-empty-state/projects-empty-state.component";
import { ProjectsLibraryHeaderComponent } from "./components/projects-library-header/projects-library-header.component";
import { ProjectsLibraryStatsComponent } from "./components/projects-library-stats/projects-library-stats.component";
import { ProjectsProjectGridComponent } from "./components/projects-project-grid/projects-project-grid.component";
import { ProjectsRemoveConfirmDialogComponent } from "./components/projects-remove-confirm-dialog/projects-remove-confirm-dialog.component";
import { ProjectsToolbarComponent } from "./components/projects-toolbar/projects-toolbar.component";
import { ProjectLibraryService } from "./project-library.service";

@Component({
	selector: "chdg-projects-page",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule,
		ProjectsEmptyStateComponent,
		ProjectsLibraryHeaderComponent,
		ProjectsLibraryStatsComponent,
		ProjectsProjectGridComponent,
		ProjectsRemoveConfirmDialogComponent,
		ProjectsToolbarComponent,
	],
	templateUrl: "./projects-page.component.html",
	styleUrl: "./projects-page.component.css",
})
export class ProjectsPageComponent {
	private readonly session = inject(ProjectSessionStore);
	private readonly persistence = inject(ProjectPersistenceService);
	private readonly library = inject(ProjectLibraryService);
	private readonly generateState = inject(DesktopGenerateStateService);
	private readonly workflowHydrator = inject(ProjectWorkflowHydrator);
	private readonly router = inject(Router);

	readonly query = signal("");
	readonly sourceFilter = signal<ProjectsSourceFilter>("all");
	readonly sortMode = signal<ProjectsSortMode>("last-opened");
	readonly projectPendingRemoval = signal<ProjectsLibraryItem | null>(null);
	readonly persistenceUnavailableMessage =
		PROJECT_PERSISTENCE_UNAVAILABLE_MESSAGE;
	readonly libraryLoading = this.library.loading;
	readonly libraryError = this.library.error;

	readonly model = computed(() =>
		deriveProjectsLibraryModel({
			recentProjects: this.library.recentProjects(),
			query: this.query(),
			sourceFilter: this.sourceFilter(),
			sortMode: this.sortMode(),
			currentProjectFilePath: this.session.projectFilePath(),
			currentOutputStatus: this.session.outputStatus(),
		}),
	);

	async selectRecent(filePath: string): Promise<void> {
		const result = await this.persistence.openProject(filePath);
		if (result.ok) {
			this.workflowHydrator.hydrate(result.payload);
			await this.library.refresh();
		}
	}

	async editRecent(filePath: string): Promise<void> {
		const result = await this.persistence.openProject(filePath);
		if (result.ok) {
			this.workflowHydrator.hydrate(result.payload);
			await this.library.refresh();
			await this.router.navigateByUrl("/projects/details");
		}
	}

	askRemove(filePath: string): void {
		const project = this.model().projects.find((item) => item.path === filePath);
		if (project) this.projectPendingRemoval.set(project);
	}

	cancelRemove(): void {
		this.projectPendingRemoval.set(null);
	}

	async confirmRemoveFromRecents(): Promise<void> {
		const project = this.projectPendingRemoval();
		if (!project) return;
		this.projectPendingRemoval.set(null);
		await this.library.remove(project.path);
	}

	async confirmRemoveAndDelete(): Promise<void> {
		const project = this.projectPendingRemoval();
		if (!project) return;
		this.projectPendingRemoval.set(null);
		const deletedCurrent = this.session.projectFilePath() === project.path;
		const ok = await this.library.deleteFile(project.path);
		if (ok && deletedCurrent) {
			this.session.resetActiveProject();
			this.generateState.reset();
		}
	}

	resetFilters(): void {
		this.query.set("");
		this.sourceFilter.set("all");
		this.sortMode.set("last-opened");
	}

	async openProject(): Promise<void> {
		const result = await this.persistence.openProjectFromPicker();
		if (result.ok) {
			this.workflowHydrator.hydrate(result.payload);
			await this.library.refresh();
			await this.router.navigateByUrl("/projects/details");
		}
	}

}
