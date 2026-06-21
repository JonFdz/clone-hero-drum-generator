import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { ProjectPersistenceService, ProjectSessionStore, ProjectWorkflowHydrator } from "../project-session/public-api";
import { ProjectLibraryService } from "../projects/public-api";
import { SettingsService } from "../settings/public-api";
import { ProjectDetailsService } from "./project-details.service";
import { createDefaultProjectName } from "../../services/project-name-model";

@Component({
	selector: "chdg-project-details-page",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, FormsModule, RouterModule],
	templateUrl: "./project-details-page.component.html",
	styleUrl: "./project-details-page.component.css",
})
export class ProjectDetailsPageComponent {
	private readonly details = inject(ProjectDetailsService);
	readonly generateState = inject(DesktopGenerateStateService);
	readonly projectState = inject(ProjectSessionStore);
	private readonly persistence = inject(ProjectPersistenceService);
	private readonly library = inject(ProjectLibraryService);
	private readonly settingsService = inject(SettingsService);
	private readonly workflowHydrator = inject(ProjectWorkflowHydrator);
	private readonly router = inject(Router);

	readonly state = this.generateState.state;
	readonly validation = this.generateState.validation;
	private readonly loadedProjectKey = computed(
		() => this.projectState.state().projectFilePath ?? "__new__",
	);
	private lastLoadedProjectKey = "";
	metadata = { ...this.generateState.state().metadata };
	projectNameInput = this.projectState.state().projectName;
	readonly coverPreviewSrc = signal<string | undefined>(undefined);

	readonly title = computed(() =>
		this.projectState.state().projectFilePath
			? "Project Details"
			: "Create Project",
	);
	readonly primarySaveLabel = computed(() =>
		this.projectState.state().projectFilePath ? "Save Changes" : "Save Draft",
	);
	readonly coverLabel = computed(() =>
		this.state().cover?.imagePath
			? this.fileName(this.state().cover?.imagePath)
			: "No cover selected",
	);

	constructor() {
		effect(() => {
			const key = this.loadedProjectKey();
			if (key !== this.lastLoadedProjectKey) {
				this.lastLoadedProjectKey = key;
				this.projectNameInput = this.projectState.state().projectName;
				this.metadata = { ...this.generateState.state().metadata };
			}
		});
		effect(() => {
			const imagePath = this.state().cover?.imagePath;
			void this.refreshCoverPreview(imagePath);
		});

		const settings = this.settingsService.settings();
		if (settings.defaultCharter && !this.metadata.charter) {
			this.metadata.charter = settings.defaultCharter;
			this.generateState.setMetadata(this.metadata);
		}
		if (
			settings.defaultOffsetMs !== undefined &&
			this.state().offsetMs === undefined
		) {
			this.generateState.setOffsetMsInput(String(settings.defaultOffsetMs));
		}
	}

	updateProjectName(): void {
		this.projectState.setProjectName(this.projectNameInput);
	}

	async createProject(): Promise<void> {
		const name = createDefaultProjectName();
		const result = await this.persistence.createProject(name);
		if (result.ok) {
			this.workflowHydrator.hydrate(result.payload);
			await this.library.refresh();
			this.projectNameInput = result.payload.projectName;
			await this.router.navigateByUrl("/projects/details?mode=new");
		}
	}

	async saveProject(): Promise<void> {
		const name = this.projectState.state().projectName;
		const filePath = this.projectState.state().projectFilePath;
		const payload = this.generateState.buildProjectStatePayload(name, filePath);
		const saved = await this.persistence.saveProject(payload);
		if (saved.ok) {
			await this.library.refresh();
			this.generateState.setSavedOutputDir(saved.payload.outputDir);
		}

	}

	async saveProjectAs(): Promise<void> {
		const name = this.projectState.state().projectName;
		const currentPath = this.projectState.state().projectFilePath;
		const payload = this.generateState.buildProjectStatePayload(name, currentPath);
		const result = await this.persistence.saveProjectAs(payload);
		if (result.ok) await this.library.refresh();
	}

	async pickSource(): Promise<void> {
		await this.runPicker(async () => {
			const picked = await this.details.pickSource();
			if (picked) this.generateState.setSourcePath(picked.path);
		});
	}

	async pickAudio(): Promise<void> {
		await this.runPicker(async () => {
			const picked = await this.details.pickAudio();
			if (picked) this.generateState.setAudioPath(picked.path);
		});
	}

	async pickOutput(): Promise<void> {
		await this.runPicker(async () => {
			const picked = await this.details.pickOutput();
			if (picked) this.generateState.setOutputDir(picked.path);
		});
	}

	async pickCover(): Promise<void> {
		await this.runPicker(async () => {
			const picked = await this.details.pickCover();
			if (picked) {
				this.generateState.setCoverImagePath(picked.path);
				this.coverPreviewSrc.set(picked.fileUrl);
			}
		});
	}

	clearCover(): void {
		this.generateState.setCoverImagePath(undefined);
		this.coverPreviewSrc.set(undefined);
	}

	updateMetadata(): void {
		this.generateState.setMetadata(this.metadata);
	}

	setOffset(value: number | string | null): void {
		this.generateState.setOffsetMsInput(value === null ? "" : String(value));
	}

	async reviewSource(): Promise<void> {
		if (!this.state().sourcePath) {
			this.generateState.applyError("Source file is required.");
			return;
		}
		await this.router.navigateByUrl("/source-review");
	}

	fileName(filePath: string | undefined): string {
		if (!filePath) return "";
		return filePath.split(/[\\/]/).pop() ?? filePath;
	}

	private async refreshCoverPreview(
		imagePath: string | undefined,
	): Promise<void> {
		if (!imagePath) {
			this.coverPreviewSrc.set(undefined);
			return;
		}
		try {
			const envelope = await this.details.coverPreview(imagePath);
			this.coverPreviewSrc.set(envelope.ok ? envelope.data.src : undefined);
		} catch {
			this.coverPreviewSrc.set(undefined);
		}
	}

	private async runPicker(action: () => Promise<void>): Promise<void> {
		try {
			await action();
		} catch (error) {
			this.generateState.applyError(
				error instanceof Error ? error.message : "Desktop bridge unavailable.",
			);
		}
	}
}
