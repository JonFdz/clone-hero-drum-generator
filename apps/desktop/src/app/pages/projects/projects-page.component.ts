import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { DesktopProjectStateService } from "../../services/desktop-project-state.service";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { ProjectWorkflowHydrator } from "../../features/project-session/public-api";
import { createDefaultProjectName } from "../../services/project-name-model";
import {
	deriveProjectsLibraryModel,
	type ProjectsLibraryItem,
	type ProjectsSortMode,
	type ProjectsSourceFilter,
} from "../../services/projects-library-model";
import { ProjectsEmptyStateComponent } from "./components/projects-empty-state.component";
import { ProjectsLibraryHeaderComponent } from "./components/projects-library-header.component";
import { ProjectsLibraryStatsComponent } from "./components/projects-library-stats.component";
import { ProjectsProjectGridComponent } from "./components/projects-project-grid.component";
import { ProjectsRemoveConfirmDialogComponent } from "./components/projects-remove-confirm-dialog.component";
import { ProjectsToolbarComponent } from "./components/projects-toolbar.component";

@Component({
	selector: "chdg-projects-page",
	standalone: true,
	imports: [
		CommonModule,
		ProjectsEmptyStateComponent,
		ProjectsLibraryHeaderComponent,
		ProjectsLibraryStatsComponent,
		ProjectsProjectGridComponent,
		ProjectsRemoveConfirmDialogComponent,
		ProjectsToolbarComponent,
	],
	template: `
		<div class="projects-library-page">
			<chdg-projects-library-header [projectCount]="model().totalCount" (openProject)="openProject()" (newProject)="newProject()" />

			<chdg-projects-toolbar
				[query]="query()"
				[sourceFilter]="sourceFilter()"
				[sortMode]="sortMode()"
				[resultCount]="model().resultCount"
				(queryChange)="query.set($event)"
				(sourceFilterChange)="sourceFilter.set($event)"
				(sortModeChange)="sortMode.set($event)"
			/>

			<div class="library-layout">
				<main class="library-main">
					@if (model().projects.length > 0) {
						<chdg-projects-project-grid [projects]="model().projects" (selectProject)="selectRecent($event)" (editProject)="editRecent($event)" (requestRemove)="askRemove($event)" />
						<p class="local-note">All projects are stored locally on this device.</p>
					} @else {
						<chdg-projects-empty-state [hasProjects]="model().totalCount > 0" (openProject)="openProject()" (newProject)="newProject()" (resetFilters)="resetFilters()" />
					}
				</main>

				<chdg-projects-library-stats [stats]="model().stats" />
			</div>
		</div>

		<chdg-projects-remove-confirm-dialog
			[isOpen]="!!projectPendingRemoval()"
			[projectName]="projectPendingRemoval()?.name ?? 'Project'"
			[projectPath]="projectPendingRemoval()?.path ?? ''"
			(cancel)="cancelRemove()"
			(removeFromRecents)="confirmRemoveFromRecents()"
			(removeAndDelete)="confirmRemoveAndDelete()"
		/>
	`,
	styles: [
		`
		.projects-library-page { display: grid; gap: 0; }
		.library-layout { align-items: start; display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr) minmax(20rem, 23rem); }
		.library-main { min-width: 0; }
		.local-note { color: var(--color-muted); font-size: 0.88rem; margin: 1.35rem 0 0; }
		@media (max-width: 1240px) { .library-layout { grid-template-columns: 1fr; } }
	`,
	],
})
export class ProjectsPageComponent {
	private readonly projectState = inject(DesktopProjectStateService);
	private readonly bridge = inject(DesktopBridgeService);
	private readonly generateState = inject(DesktopGenerateStateService);
	private readonly workflowHydrator = inject(ProjectWorkflowHydrator);
	private readonly router = inject(Router);

	readonly query = signal("");
	readonly sourceFilter = signal<ProjectsSourceFilter>("all");
	readonly sortMode = signal<ProjectsSortMode>("last-opened");
	readonly projectPendingRemoval = signal<ProjectsLibraryItem | null>(null);

	readonly model = computed(() =>
		deriveProjectsLibraryModel({
			recentProjects: this.projectState.state().recentProjects,
			query: this.query(),
			sourceFilter: this.sourceFilter(),
			sortMode: this.sortMode(),
			currentProjectFilePath: this.projectState.state().projectFilePath,
			currentOutputStatus: this.projectState.state().outputStatus,
		}),
	);

	async selectRecent(filePath: string): Promise<void> {
		const payload = await this.projectState.openProject(filePath);
		if (payload) {
			this.workflowHydrator.hydrate(payload);
		}
	}

	async editRecent(filePath: string): Promise<void> {
		const payload = await this.projectState.openProject(filePath);
		if (payload) {
			this.workflowHydrator.hydrate(payload);
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
		await this.projectState.removeRecentProject(project.path);
	}

	async confirmRemoveAndDelete(): Promise<void> {
		const project = this.projectPendingRemoval();
		if (!project) return;
		this.projectPendingRemoval.set(null);
		const deletedCurrent = this.projectState.state().projectFilePath === project.path;
		const ok = await this.projectState.deleteProjectFile(project.path);
		if (ok && deletedCurrent) {
			this.generateState.reset();
		}
	}

	resetFilters(): void {
		this.query.set("");
		this.sourceFilter.set("all");
		this.sortMode.set("last-opened");
	}

	async openProject(): Promise<void> {
		const picked = await this.bridge.openProjectFile();
		if (!picked) return;
		const payload = await this.projectState.openProject(picked.path);
		if (payload) {
			this.workflowHydrator.hydrate(payload);
			await this.router.navigateByUrl("/projects/details");
		}
	}

	async newProject(): Promise<void> {
		const defaultName = createDefaultProjectName();
		const payload = await this.projectState.createProject(defaultName);
		if (payload) {
			this.workflowHydrator.hydrate(payload);
			await this.router.navigateByUrl("/projects/details?mode=new");
		}
	}
}
