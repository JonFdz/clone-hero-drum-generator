import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, effect, inject, InjectionToken, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import {
	ProjectSessionStore,
} from "../project-session/public-api";
import { ProjectDetailsService } from "./project-details.service";

export const PROJECT_DETAILS_UNAVAILABLE_MESSAGE =
	"Project Details editing, replacement, review, and saving are not available in this legacy workflow.";

export const PROJECT_DETAILS_REACTIVE_EFFECTS = new InjectionToken<boolean>(
	"PROJECT_DETAILS_REACTIVE_EFFECTS",
	{ factory: () => true },
);

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
	private readonly reactiveEffects = inject(PROJECT_DETAILS_REACTIVE_EFFECTS);

	readonly state = this.generateState.state;
	readonly validation = this.generateState.validation;
	private readonly loadedProjectKey = computed(
		() => this.projectState.state().projectFilePath ?? "__new__",
	);
	private lastLoadedProjectKey = "";
	metadata = { ...this.generateState.state().metadata };
	projectNameInput =
		this.projectState.state().project?.projectName ?? "No project";
	readonly coverPreviewSrc = signal<string | undefined>(undefined);
	readonly persistenceUnavailableMessage =
		PROJECT_DETAILS_UNAVAILABLE_MESSAGE;

	readonly title = computed(() =>
		this.projectState.hasProject()
			? "Project Details"
			: "Project Setup Unavailable",
	);
	readonly setupDisabled = computed(() => true);
	readonly primarySaveLabel = "Save Unavailable";
	readonly coverLabel = computed(() =>
		this.state().cover?.imagePath
			? this.fileName(this.state().cover?.imagePath)
			: "No cover selected",
	);

	constructor() {
		if (this.reactiveEffects) {
			effect(() => {
				const key = this.loadedProjectKey();
				if (key !== this.lastLoadedProjectKey) {
					this.lastLoadedProjectKey = key;
					this.projectNameInput =
						this.projectState.state().project?.projectName ?? "No project";
					this.metadata = { ...this.generateState.state().metadata };
				}
			});
			effect(() => {
				const imagePath = this.state().cover?.imagePath;
				void this.refreshCoverPreview(imagePath);
			});
		}

	}

	updateProjectName(): void {
		this.reportUnavailable();
	}

	async createProject(): Promise<void> {
		this.generateState.applyError(this.persistenceUnavailableMessage);
	}

	async saveProject(): Promise<void> {
		this.generateState.applyError(this.persistenceUnavailableMessage);
	}

	async saveProjectAs(): Promise<void> {
		this.generateState.applyError(this.persistenceUnavailableMessage);
	}

	async pickSource(): Promise<void> {
		this.reportUnavailable();
	}

	async pickAudio(): Promise<void> {
		this.reportUnavailable();
	}

	async pickOutput(): Promise<void> {
		this.reportUnavailable();
	}

	async pickCover(): Promise<void> {
		this.reportUnavailable();
	}

	clearCover(): void {
		this.reportUnavailable();
	}

	updateMetadata(): void {
		this.reportUnavailable();
	}

	setOffset(value: number | string | null): void {
		void value;
		this.reportUnavailable();
	}

	async reviewSource(): Promise<void> {
		this.reportUnavailable();
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

	private reportUnavailable(): void {
		this.generateState.applyError(this.persistenceUnavailableMessage);
	}
}
