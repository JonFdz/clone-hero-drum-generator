import { CommonModule } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { DesktopProjectStateService } from "../../services/desktop-project-state.service";
import { deriveHomeDashboardModel } from "../../services/home-dashboard-model";
import { HomeRecentProjectsCompactComponent } from "./components/home-recent-projects-compact.component";
import { HomeWarningsPanelComponent } from "./components/home-warnings-panel.component";
import { HomeWorkflowProgressComponent } from "./components/home-workflow-progress.component";

@Component({
	selector: "chdg-home-page",
	standalone: true,
	imports: [
		CommonModule,
		HomeRecentProjectsCompactComponent,
		HomeWarningsPanelComponent,
		HomeWorkflowProgressComponent,
	],
	template: `
		<div class="home-mock-page">
			<header class="home-welcome">
				<h1>Welcome back!</h1>
				<p>Here's what's happening with your projects.</p>
			</header>

			<div class="home-mock-grid">
				<chdg-home-recent-projects-compact
					[projects]="model().recentProjects"
					(openProject)="openRecent($event)"
					(removeProject)="removeRecent($event)"
					(viewAll)="navigateTo('/projects')"
				/>

				<section class="card mock-actions-card" aria-label="Quick actions">
					<h2>Quick Actions</h2>
					<div class="mock-action-list">
						<button class="mock-action-button" type="button" (click)="navigateTo('/new-project')">
							<span class="mock-action-icon">▣</span>
							<span>New Project</span>
						</button>
						<button class="mock-action-button" type="button" (click)="openProject()">
							<span class="mock-action-icon">▰</span>
							<span>Open Project</span>
						</button>
						<button class="mock-action-button" type="button" (click)="navigateTo('/new-project')">
							<span class="mock-action-icon">♪</span>
							<span>Import MIDI</span>
						</button>
						<button class="mock-action-button" type="button" (click)="navigateTo('/new-project')">
							<span class="mock-action-icon gp-icon">GP</span>
							<span>Import Guitar Pro</span>
						</button>
						<button class="mock-action-button" type="button" (click)="openOutputFolder()">
							<span class="mock-action-icon">▭</span>
							<span>Open Output Folder</span>
						</button>
					</div>
				</section>

				<chdg-home-workflow-progress [steps]="model().workflow" />

				<section class="card mock-system-card" aria-label="System status">
					<h2>System Status</h2>
					<div class="system-row">
						<span class="system-icon success">✓</span>
						<div>
							<strong>FFmpeg found</strong>
							<p>FFmpeg is installed and ready.</p>
						</div>
					</div>
					<div class="system-row">
						<span class="system-icon info">◎</span>
						<div>
							<strong>Local only / offline</strong>
							<p>Working locally. No internet required.</p>
						</div>
					</div>
					<div class="system-row project-format-row">
						<span class="system-icon purple">▤</span>
						<div>
							<strong>Project format</strong>
							<p>.chdg</p>
						</div>
						<button class="learn-more" type="button" (click)="navigateTo('/settings')">Learn more</button>
					</div>
				</section>
			</div>

			<chdg-home-warnings-panel
				[model]="model()"
				[warnings]="model().missingPathWarnings"
			/>
		</div>
	`,
	styles: [
		`
		.home-mock-page { display: grid; gap: 1.4rem; }
		.home-welcome { margin: 0.25rem 0 0.05rem; }
		.home-welcome h1 { font-size: clamp(2rem, 3vw, 2.35rem); letter-spacing: -0.035em; margin-bottom: 0.45rem; }
		.home-welcome p { color: var(--color-text-soft); font-size: 1rem; margin: 0; }
		.home-mock-grid { display: grid; gap: 1.4rem; grid-template-columns: minmax(0, 1.64fr) minmax(22rem, 0.95fr); }
		.mock-actions-card, .mock-system-card { padding: 1.35rem; }
		.mock-actions-card h2, .mock-system-card h2 { margin-bottom: 1rem; }
		.mock-action-list { display: grid; gap: 0.65rem; }
		.mock-action-button { align-items: center; background: linear-gradient(90deg, rgba(151, 83, 229, 0.18), rgba(151, 83, 229, 0.09)); border: 1px solid rgba(166, 108, 255, 0.44); border-radius: 0.48rem; display: grid; gap: 1rem; grid-template-columns: 2rem 1fr; justify-content: start; min-height: 3.4rem; padding: 0.75rem 1.25rem; text-align: left; width: 100%; }
		.mock-action-button:hover { background: rgba(151, 83, 229, 0.24); }
		.mock-action-icon { color: var(--color-accent-soft); display: inline-grid; font-size: 1.35rem; font-weight: 900; place-items: center; }
		.gp-icon { background: var(--color-accent-soft); border-radius: 50%; color: #452166; font-size: 0.78rem; height: 1.65rem; width: 1.65rem; }
		.system-row { align-items: center; border-top: 1px solid var(--color-border); display: grid; gap: 1rem; grid-template-columns: 3rem minmax(0, 1fr); padding: 1rem 0; }
		.system-row:first-of-type { border-top: 0; padding-top: 0.35rem; }
		.system-row strong { color: var(--color-text); display: block; margin-bottom: 0.15rem; }
		.system-row p { font-size: 0.86rem; margin: 0; }
		.system-icon { border-radius: 50%; display: grid; font-size: 1.35rem; font-weight: 900; height: 3rem; place-items: center; width: 3rem; }
		.system-icon.success { background: rgba(101, 222, 119, 0.16); border: 1px solid rgba(101, 222, 119, 0.36); color: var(--color-success); }
		.system-icon.info { background: rgba(80, 151, 255, 0.18); border: 1px solid rgba(80, 151, 255, 0.36); color: #7fb5ff; }
		.system-icon.purple { background: rgba(151, 83, 229, 0.22); border: 1px solid rgba(151, 83, 229, 0.4); color: var(--color-accent-soft); }
		.project-format-row { grid-template-columns: 3rem minmax(0, 1fr) auto; }
		.learn-more { background: rgba(151, 83, 229, 0.14); border: 1px solid rgba(151, 83, 229, 0.42); color: var(--color-accent-soft); min-height: 2.25rem; padding: 0.45rem 0.9rem; }
		@media (max-width: 1180px) { .home-mock-grid { grid-template-columns: 1fr; } }
		@media (max-width: 680px) { .project-format-row { grid-template-columns: 3rem minmax(0, 1fr); } .learn-more { grid-column: 2; justify-self: start; } }
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

	async openOutputFolder(): Promise<void> {
		const outputDir = this.generateState.state().outputDir;
		if (!outputDir) {
			await this.navigateTo("/new-project");
			return;
		}
		await this.bridge.openOutputFolder(outputDir);
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
