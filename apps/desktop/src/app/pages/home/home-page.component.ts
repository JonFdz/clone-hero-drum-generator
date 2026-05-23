import { CommonModule } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { DesktopProjectStateService } from "../../services/desktop-project-state.service";
import {
	deriveHomeDashboardModel,
	type HomeSecondaryAction,
} from "../../services/home-dashboard-model";
import { HomeDashboardHeroComponent } from "./components/home-dashboard-hero.component";
import { HomeRecentProjectsCompactComponent } from "./components/home-recent-projects-compact.component";
import { HomeWarningsPanelComponent } from "./components/home-warnings-panel.component";
import { HomeWorkflowProgressComponent } from "./components/home-workflow-progress.component";

@Component({
	selector: "chdg-home-page",
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		HomeDashboardHeroComponent,
		HomeRecentProjectsCompactComponent,
		HomeWarningsPanelComponent,
		HomeWorkflowProgressComponent,
	],
	template: `
		<div class="home-dashboard mock-home">
			<chdg-home-dashboard-hero
				[model]="model()"
				(primaryAction)="navigateTo(model().nextAction.route)"
				(secondaryAction)="activateSecondaryAction($event)"
			/>

			<div class="home-secondary-grid">
				<chdg-home-recent-projects-compact
					[projects]="model().recentProjects"
					(openProject)="openRecent($event)"
					(removeProject)="removeRecent($event)"
					(viewAll)="navigateTo('/projects')"
				/>
				<chdg-home-workflow-progress [steps]="model().workflow" />
			</div>

			<chdg-home-warnings-panel
				[model]="model()"
				[warnings]="model().missingPathWarnings"
			/>
		</div>
	`,
	styles: [
		`
		.home-dashboard { display: grid; gap: var(--space-5); }
		.home-secondary-grid { display: grid; gap: var(--space-5); grid-template-columns: minmax(18rem, 0.78fr) minmax(0, 1.22fr); }
		@media (max-width: 1100px) { .home-secondary-grid { grid-template-columns: 1fr; } }
	`,
	],
})
export class HomePageComponent {
	private readonly projectState = inject(DesktopProjectStateService);
	private readonly bridge = inject(DesktopBridgeService);
	private readonly generateState = inject(DesktopGenerateStateService);
	private readonly router = inject(Router);

	readonly model = computed(() =>
		deriveHomeDashboardModel({
			project: this.projectState.state(),
			generate: this.generateState.state(),
			hasProject: this.projectState.hasProject(),
			isDirty: this.projectState.isDirty(),
		}),
	);

	async navigateTo(route: string): Promise<void> {
		await this.router.navigateByUrl(route);
	}

	async activateSecondaryAction(action: HomeSecondaryAction): Promise<void> {
		if (action.kind === "open-project") {
			await this.openProject();
			return;
		}
		if (action.route) await this.navigateTo(action.route);
	}

	async openRecent(filePath: string): Promise<void> {
		const payload = await this.projectState.openProject(filePath);
		if (payload) {
			this.loadProjectState(payload);
			await this.navigateTo(this.model().nextAction.route);
		}
	}

	async removeRecent(filePath: string): Promise<void> {
		await this.projectState.removeRecentProject(filePath);
	}

	async openProject(): Promise<void> {
		const picked = await this.bridge.openProjectFile();
		if (!picked) return;
		const payload = await this.projectState.openProject(picked.path);
		if (payload) {
			this.loadProjectState(payload);
			await this.navigateTo(this.model().nextAction.route);
		}
	}

	private loadProjectState(
		payload: Awaited<ReturnType<DesktopProjectStateService["openProject"]>>,
	): void {
		if (!payload) return;
		this.generateState.loadProjectState({
			sourcePath: payload.sourcePath,
			audioPath: payload.audioPath,
			outputDir: payload.outputDir,
			sourceKind: payload.sourceKind,
			selectedTracks: payload.selectedTracks,
			metadata: payload.metadata,
			offsetMs: payload.offsetMs,
			lastGeneratedAt: payload.lastGeneratedAt,
			outputFiles: payload.outputFiles,
			mappingOverrides: payload.mappingOverrides,
		});
	}
}
