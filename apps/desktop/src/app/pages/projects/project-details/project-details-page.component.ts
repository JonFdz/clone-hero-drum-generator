import { CommonModule } from "@angular/common";
import { Component, computed, effect, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { DesktopBridgeService } from "../../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../../services/desktop-generate-state.service";
import { DesktopProjectStateService } from "../../../services/desktop-project-state.service";
import { createDefaultProjectName } from "../../../services/project-name-model";

@Component({
	selector: "chdg-project-details-page",
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule],
	template: `
		<header class="details-hero">
			<div class="hero-copy">
				<p class="eyebrow">Projects / Details</p>
				<h1>{{ title() }}</h1>
				<p>Configure the local .chdg project, source files, metadata, cover art, and chart offset.</p>
			</div>
			<div class="hero-actions">
				<button class="button secondary" type="button" (click)="createProject()">New Project</button>
				<a class="button ghost" routerLink="/projects">Back to Projects</a>
			</div>
		</header>

		@if (projectState.missingPathWarnings().length > 0) {
			<section class="notice warning-notice">
				<div>
					<h2>Missing local paths</h2>
					<p>Re-select missing source/audio/output paths before generation. Missing cover artwork is non-blocking.</p>
				</div>
				<ul>
					@for (warning of projectState.missingPathWarnings(); track warning.kind) {
						<li>{{ warning.message }}</li>
					}
				</ul>
			</section>
		}

		@if (projectState.outputStatus() === 'needs-regenerate') {
			<section class="notice warning-notice compact-notice">
				<h2>Output outdated</h2>
				<p>Generation inputs changed since the last successful generation. Regenerate to update output.</p>
			</section>
		}

		<div class="details-layout">
			<main class="details-flow">
				<section class="setup-card identity-card">
					<div class="card-header-row">
						<span class="step-badge">1</span>
						<div class="header-text">
							<h2>Project Identity</h2>
							<p>Name the local project file and track its save status.</p>
						</div>
					</div>
					<div class="identity-grid">
						<label class="field-label">Project Name<input [(ngModel)]="projectNameInput" (change)="updateProjectName()" placeholder="Enter project name" /></label>
						<div class="project-file-pill">
							<span>{{ projectState.state().projectFilePath ? 'Project file' : 'Unsaved project' }}</span>
							<strong>{{ projectState.state().projectFilePath || 'Save to create a .chdg file path' }}</strong>
						</div>
					</div>
				</section>

				<section class="setup-card cover-card">
					<div class="card-header-row">
						<span class="step-badge">2</span>
						<div class="header-text">
							<h2>Cover / Portada</h2>
							<p>Optional local artwork reference. The image path is saved; the image is not embedded.</p>
						</div>
					</div>
					<div class="cover-content">
						@if (coverPreviewSrc()) {
							<img class="cover-preview" [src]="coverPreviewSrc()" alt="Project cover preview" />
						} @else {
							<div class="cover-placeholder" aria-label="No cover selected">♪</div>
						}
						<div class="cover-copy">
							<strong>{{ coverLabel() }}</strong>
							<p>Supported: .png, .jpg, .jpeg, .webp. Missing cover files show a warning but do not block generation.</p>
							<div class="button-row">
								<button class="button secondary" type="button" (click)="pickCover()">Choose Cover</button>
								<button class="button ghost" type="button" [disabled]="!state().cover?.imagePath" (click)="clearCover()">Remove Cover</button>
							</div>
						</div>
					</div>
				</section>

				<section class="setup-card path-card">
					<div class="card-header-row">
						<span class="step-badge">3</span>
						<div class="header-text"><h2>Source File</h2><p>Select a local chart source. Supports .mid, .midi, and .gp.</p></div>
						<button class="button secondary" type="button" (click)="pickSource()">Choose File</button>
					</div>
					<div class="file-row"><span class="file-icon">♬</span><div><strong>{{ fileName(state().sourcePath) || 'No source selected' }}</strong><p>{{ state().sourceKind || 'Local source required. No network files or URLs.' }}</p></div><span class="ok" [class.on]="state().sourcePath">✓</span></div>
				</section>

				<section class="setup-card path-card">
					<div class="card-header-row">
						<span class="step-badge">4</span>
						<div class="header-text"><h2>Audio File (Required)</h2><p>Select the local audio file for this project.</p></div>
						<button class="button secondary" type="button" (click)="pickAudio()">Choose File</button>
					</div>
					<div class="file-row"><span class="file-icon">♫</span><div><strong>{{ fileName(state().audioPath) || 'No audio selected' }}</strong><p>Audio is required for Desktop Generate MVP.</p></div><span class="ok" [class.on]="state().audioPath">✓</span></div>
				</section>

				<section class="setup-card path-card">
					<div class="card-header-row">
						<span class="step-badge">5</span>
						<div class="header-text"><h2>Output Folder</h2><p>Choose where notes.chart, song.ini, and song.ogg will be written.</p></div>
						<button class="button secondary" type="button" (click)="pickOutput()">Choose Folder</button>
					</div>
					<div class="file-row"><span class="file-icon">□</span><div><strong>{{ state().outputDir || 'No output folder selected' }}</strong><p>A .chdg file stores project settings separately from generated output.</p></div><span class="ok" [class.on]="state().outputDir">✓</span></div>
				</section>

				<section class="setup-card metadata-card">
					<div class="card-header-row">
						<span class="step-badge">6</span>
						<div class="header-text"><h2>Metadata</h2><p>Set song information for song.ini.</p></div>
					</div>
					<div class="metadata-grid">
						<label class="field-label">Song Name<input [(ngModel)]="metadata.name" (ngModelChange)="updateMetadata()" /></label>
						<label class="field-label">Artist<input [(ngModel)]="metadata.artist" (ngModelChange)="updateMetadata()" /></label>
						<label class="field-label">Album<input [(ngModel)]="metadata.album" (ngModelChange)="updateMetadata()" /></label>
						<label class="field-label">Year<input [(ngModel)]="metadata.year" (ngModelChange)="updateMetadata()" /></label>
						<label class="field-label">Genre<input [(ngModel)]="metadata.genre" (ngModelChange)="updateMetadata()" /></label>
						<label class="field-label">Charter<input [(ngModel)]="metadata.charter" (ngModelChange)="updateMetadata()" /></label>
					</div>
				</section>

				<section class="setup-card options-card">
					<div class="card-header-row">
						<span class="step-badge">7</span>
						<div class="header-text"><h2>Offset and Options</h2><p>Chart offset is stored in the chart while note ticks are not moved.</p></div>
					</div>
					<div class="options-layout">
						<label class="field-label offset-field">Chart Offset (ms)<input type="number" [ngModel]="state().offsetMs" (ngModelChange)="setOffset($event)" /></label>
						<ul class="option-list"><li>Auto-detect source type</li><li>Track selection later</li><li>Local-only workflow</li></ul>
					</div>
				</section>
			</main>

			<aside class="summary-card">
				<p class="summary-eyebrow">Project Summary</p>
				<h2>{{ projectState.state().projectName }}</h2>
				<div class="status-row">
					<span class="status-pill" [class.modified]="projectState.state().dirty">{{ projectState.state().dirty ? 'Modified' : 'Saved' }}</span>
					<span class="status-pill">{{ projectState.state().outputStatus }}</span>
				</div>
				<dl class="summary-list">
					<dt>Cover</dt><dd>{{ coverLabel() }}</dd>
					<dt>Source</dt><dd>{{ fileName(state().sourcePath) || 'Not selected' }}</dd>
					<dt>Audio</dt><dd>{{ fileName(state().audioPath) || 'Required' }}</dd>
					<dt>Output Folder</dt><dd>{{ state().outputDir || 'Not selected' }}</dd>
					<dt>Offset</dt><dd>{{ state().offsetMs ?? 0 }} ms</dd>
				</dl>
				<ul class="readiness-list"><li [class.ready]="state().sourcePath">Source file</li><li [class.ready]="state().audioPath">Audio file</li><li [class.ready]="state().outputDir">Output folder</li><li class="ready">Local-only workflow</li></ul>
				@if (validation().errors.length > 0) {
					<div class="message warning small-message"><strong>Before generation:</strong><ul><li *ngFor="let error of validation().errors">{{ error }}</li></ul></div>
				}
				<div class="summary-actions"><button class="button primary" type="button" [disabled]="!state().sourcePath" (click)="reviewSource()">Review Source</button><button class="button secondary" type="button" (click)="saveProject()">{{ primarySaveLabel() }}</button><button class="button ghost" type="button" (click)="saveProjectAs()">Save As</button></div>
				<p class="summary-note">You can review and adjust settings before proceeding.</p>
			</aside>
		</div>
	`,
	styles: [
		`
		.details-hero { align-items: flex-start; display: flex; justify-content: space-between; gap: 1.5rem; margin: 0.2rem 0 1.25rem; }
		.hero-copy { max-width: 48rem; min-width: 0; }
		.hero-copy h1 { font-size: clamp(2.1rem, 3.2vw, 3.1rem); letter-spacing: -0.045em; line-height: 1; margin: 0.12rem 0 0.45rem; }
		.hero-copy p, .header-text p, .cover-copy p, .summary-note { color: var(--color-muted); margin: 0; }
		.eyebrow, .summary-eyebrow { color: var(--color-accent-soft); font-size: 0.78rem; font-weight: 900; letter-spacing: 0.14em; margin: 0; text-transform: uppercase; }
		.hero-actions { display: flex; flex-shrink: 0; flex-wrap: wrap; gap: 0.75rem; justify-content: flex-end; }
		.details-layout { align-items: start; display: grid; gap: 1.25rem; grid-template-columns: minmax(0, 1fr) minmax(20rem, 24rem); }
		.details-flow { display: grid; gap: 0.72rem; min-width: 0; }
		.setup-card, .summary-card, .notice { background: linear-gradient(180deg, rgba(22, 29, 38, 0.94), rgba(13, 17, 23, 0.84)); border: 1px solid var(--color-border); border-radius: 0.85rem; box-shadow: 0 18px 52px rgba(0,0,0,0.18); }
		.setup-card { display: grid; gap: 0.82rem; padding: 0.95rem 1.05rem; }
		.card-header-row { align-items: center; display: grid; gap: 0.85rem; grid-template-columns: auto minmax(0, 1fr) auto; }
		.header-text { min-width: 0; }
		.header-text h2, .summary-card h2, .notice h2 { font-size: 1.08rem; margin: 0 0 0.18rem; }
		.step-badge { align-items: center; background: rgba(151,83,229,0.2); border: 1px solid rgba(181,122,255,0.42); border-radius: 999px; color: var(--color-accent-soft); display: inline-grid; font-size: 0.88rem; font-weight: 900; height: 2rem; justify-items: center; width: 2rem; }
		.identity-grid { align-items: end; display: grid; gap: 0.9rem; grid-template-columns: minmax(18rem, 1fr) minmax(15rem, 0.85fr); }
		.field-label { color: var(--color-muted); display: grid; font-size: 0.78rem; font-weight: 800; gap: 0.3rem; }
		input { background: rgba(255,255,255,0.045); border: 1px solid var(--color-border); border-radius: 0.56rem; color: var(--color-text); min-height: 2.45rem; padding: 0.55rem 0.7rem; width: 100%; }
		.project-file-pill { background: rgba(255,255,255,0.035); border: 1px solid rgba(197,209,225,0.08); border-radius: 0.62rem; display: grid; gap: 0.22rem; min-width: 0; padding: 0.62rem 0.75rem; }
		.project-file-pill span { color: var(--color-muted); font-size: 0.76rem; font-weight: 900; text-transform: uppercase; }
		.project-file-pill strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.cover-content { align-items: center; display: grid; gap: 1rem; grid-template-columns: 7.2rem minmax(0, 1fr); }
		.cover-preview, .cover-placeholder { aspect-ratio: 1; border-radius: 0.85rem; height: 7.2rem; object-fit: cover; width: 7.2rem; }
		.cover-placeholder, .file-icon { align-items: center; background: rgba(151,83,229,0.24); border: 1px solid rgba(151,83,229,0.36); color: var(--color-accent-soft); display: grid; justify-items: center; }
		.cover-placeholder { font-size: 2rem; }
		.cover-copy { display: grid; gap: 0.55rem; min-width: 0; }
		.button-row { display: flex; flex-wrap: wrap; gap: 0.55rem; }
		.file-row { align-items: center; background: rgba(255,255,255,0.035); border: 1px solid rgba(197,209,225,0.08); border-radius: 0.58rem; display: grid; gap: 0.75rem; grid-template-columns: 2.45rem minmax(0,1fr) 1.55rem; padding: 0.68rem; }
		.file-icon { border-radius: 0.5rem; height: 2.35rem; width: 2.35rem; }
		.file-row strong, .file-row p { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.file-row p { color: var(--color-muted); margin: 0.12rem 0 0; }
		.ok { color: rgba(255,255,255,0.22); font-weight: 900; } .ok.on { color: var(--color-success); }
		.metadata-grid { display: grid; gap: 0.65rem 0.9rem; grid-template-columns: repeat(3, minmax(0, 1fr)); }
		.options-layout { align-items: end; display: grid; gap: 1rem; grid-template-columns: minmax(12rem, 18rem) minmax(0, 1fr); }
		.option-list, .readiness-list { list-style: none; margin: 0; padding: 0; }
		.option-list { color: var(--color-text-soft); display: grid; gap: 0.48rem; }
		.option-list li::before, .readiness-list li::before { content: '✓'; font-weight: 900; margin-right: 0.5rem; }
		.option-list li::before { color: var(--color-accent-soft); }
		.notice { align-items: start; display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr) minmax(16rem, 26rem); margin-bottom: 0.9rem; padding: 0.95rem 1.05rem; }
		.notice ul { color: var(--color-text-soft); margin: 0; }
		.compact-notice { grid-template-columns: 1fr; }
		.summary-card { padding: 1.25rem; position: sticky; top: 1rem; }
		.status-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.8rem 0 1rem; }
		.status-pill { background: rgba(101,222,119,0.12); border: 1px solid rgba(101,222,119,0.26); border-radius: 999px; color: var(--color-success); font-size: 0.78rem; font-weight: 900; padding: 0.38rem 0.6rem; text-transform: capitalize; }
		.status-pill.modified { background: rgba(246,180,80,0.13); border-color: rgba(246,180,80,0.32); color: #ffbd49; }
		.summary-list { display: grid; gap: 0.58rem; margin: 0 0 1rem; }
		.summary-list dt { color: var(--color-muted); font-size: 0.73rem; font-weight: 900; text-transform: uppercase; }
		.summary-list dd { margin: -0.42rem 0 0; overflow-wrap: anywhere; }
		.readiness-list { border-top: 1px solid var(--color-border); display: grid; gap: 0.45rem; margin: 0 0 1rem; padding-top: 1rem; }
		.readiness-list li { color: var(--color-muted); } .readiness-list li.ready { color: var(--color-text-soft); } .readiness-list li.ready::before { color: var(--color-accent-soft); }
		.summary-actions { display: grid; gap: 0.6rem; }
		.summary-note { margin-top: 0.8rem; text-align: center; }
		.small-message { font-size: 0.86rem; margin-bottom: 0.8rem; padding: 0.75rem; }
		@media (max-width: 1180px) { .details-layout { grid-template-columns: 1fr; } .summary-card { position: static; } }
		@media (max-width: 760px) { .details-hero, .hero-actions { align-items: stretch; flex-direction: column; } .card-header-row, .identity-grid, .cover-content, .metadata-grid, .options-layout, .notice { grid-template-columns: 1fr; } .card-header-row > .button { justify-self: start; } }
	`,
	],
})
export class ProjectDetailsPageComponent {
	private readonly bridge = inject(DesktopBridgeService);
	readonly generateState = inject(DesktopGenerateStateService);
	readonly projectState = inject(DesktopProjectStateService);
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

		const settings = this.projectState.state().settings;
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
		const payload = await this.projectState.createProject(name);
		if (payload) {
			this.generateState.loadProjectState(payload);
			this.projectNameInput = payload.projectName;
			await this.router.navigateByUrl("/projects/details?mode=new");
		}
	}

	async saveProject(): Promise<void> {
		const name = this.projectState.state().projectName;
		const filePath = this.projectState.state().projectFilePath;
		const payload = this.generateState.buildProjectStatePayload(name, filePath);
		const saved = await this.projectState.saveProject(payload);
		if (saved) {
			this.generateState.setSavedOutputDir(saved.payload.outputDir);
		}

	}

	async saveProjectAs(): Promise<void> {
		const name = this.projectState.state().projectName;
		const currentPath = this.projectState.state().projectFilePath;
		const picked = await this.bridge.saveProjectFile(name, currentPath);
		if (!picked) return;
		const payload = this.generateState.buildProjectStatePayload(
			name,
			picked.path,
		);
		await this.projectState.saveProjectAs({
			...payload,
			filePath: picked.path,
		});
	}

	async pickSource(): Promise<void> {
		await this.runPicker(async () => {
			const picked = await this.bridge.pickSourceFile();
			if (picked) this.generateState.setSourcePath(picked.path);
		});
	}

	async pickAudio(): Promise<void> {
		await this.runPicker(async () => {
			const picked = await this.bridge.pickAudioFile();
			if (picked) this.generateState.setAudioPath(picked.path);
		});
	}

	async pickOutput(): Promise<void> {
		await this.runPicker(async () => {
			const picked = await this.bridge.pickOutputFolder();
			if (picked) this.generateState.setOutputDir(picked.path);
		});
	}

	async pickCover(): Promise<void> {
		await this.runPicker(async () => {
			const picked = await this.bridge.pickCoverImageFile();
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
			const envelope = await this.bridge.getCoverImagePreviewUrl(imagePath);
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
