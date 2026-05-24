import { CommonModule } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { DesktopBridgeService } from "../../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../../services/desktop-generate-state.service";
import { DesktopProjectStateService } from "../../../services/desktop-project-state.service";

@Component({
	selector: "chdg-project-details-page",
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule],
	template: `
		<header class="details-hero">
			<div>
				<p class="eyebrow">Projects</p>
				<h1>{{ title() }}</h1>
				<p>Create and edit local Clone Hero drum chart project details.</p>
			</div>
			<a class="button ghost" routerLink="/projects">Back to Projects</a>
		</header>

		@if (projectState.missingPathWarnings().length > 0) {
			<section class="card message warning">
				<h2>Missing local paths</h2>
				<ul>
					@for (warning of projectState.missingPathWarnings(); track warning.kind) {
						<li>{{ warning.message }}</li>
					}
				</ul>
				<p>Missing cover artwork is non-blocking. Re-select missing source/audio/output paths before generation.</p>
			</section>
		}

		@if (projectState.outputStatus() === 'needs-regenerate') {
			<section class="card message warning">
				<h2>Output outdated</h2>
				<p>Generation inputs changed since the last successful generation. Regenerate to update output.</p>
			</section>
		}

		<div class="details-layout">
			<main class="details-flow">
				<section class="step-card identity-card">
					<div class="step-index">1</div>
					<div class="card-body">
						<div class="section-heading">
							<div>
								<h2>Project Identity</h2>
								<p>Name the local .chdg project.</p>
							</div>
							<button class="button secondary" type="button" (click)="createProject()">New Project</button>
						</div>
						<input class="input-like" [(ngModel)]="projectNameInput" (change)="updateProjectName()" placeholder="Enter project name" />
					</div>
				</section>

				<section class="step-card cover-card">
					<div class="step-index">2</div>
					<div class="card-body">
						<div class="section-heading">
							<div>
								<h2>Cover / Portada</h2>
								<p>Optional local artwork reference. The image is not embedded in the .chdg file.</p>
							</div>
							<div class="button-row compact">
								<button class="button secondary" type="button" (click)="pickCover()">Choose Cover</button>
								<button class="button ghost" type="button" [disabled]="!state().cover?.imagePath" (click)="clearCover()">Remove</button>
							</div>
						</div>
						<div class="cover-preview-row">
							@if (coverPreviewSrc()) {
								<img class="cover-preview" [src]="coverPreviewSrc()" alt="Project cover preview" />
							} @else {
								<div class="cover-placeholder" aria-label="No cover selected">♪</div>
							}
							<div>
								<strong>{{ coverLabel() }}</strong>
								<p class="field-hint">Supported: .png, .jpg, .jpeg, .webp. Missing cover files warn but do not block generation.</p>
							</div>
						</div>
					</div>
				</section>

				<section class="step-card">
					<div class="step-index">3</div>
					<div class="card-body">
						<div class="section-heading">
							<div><h2>Source File</h2><p>Select a local chart source. Supports .mid, .midi, and .gp.</p></div>
							<button class="button secondary" type="button" (click)="pickSource()">Choose File</button>
						</div>
						<div class="file-row"><span class="file-icon">♬</span><div><strong>{{ fileName(state().sourcePath) || 'No source selected' }}</strong><p>{{ state().sourceKind || 'Local source required' }}</p></div><span class="ok" [class.on]="state().sourcePath">✓</span></div>
						<p class="field-hint">Local files only. No network files or URLs.</p>
					</div>
				</section>

				<section class="step-card">
					<div class="step-index">4</div>
					<div class="card-body">
						<div class="section-heading">
							<div><h2>Audio File (Required)</h2><p>Select the local audio file for this project.</p></div>
							<button class="button secondary" type="button" (click)="pickAudio()">Choose File</button>
						</div>
						<div class="file-row"><span class="file-icon">♫</span><div><strong>{{ fileName(state().audioPath) || 'No audio selected' }}</strong><p>Audio is required for Desktop Generate MVP.</p></div><span class="ok" [class.on]="state().audioPath">✓</span></div>
					</div>
				</section>

				<section class="step-card">
					<div class="step-index">5</div>
					<div class="card-body">
						<div class="section-heading">
							<div><h2>Output Folder</h2><p>Choose where notes.chart, song.ini, and song.ogg will be written.</p></div>
							<button class="button secondary" type="button" (click)="pickOutput()">Choose Folder</button>
						</div>
						<div class="file-row"><span class="file-icon">□</span><div><strong>{{ state().outputDir || 'No output folder selected' }}</strong><p>A .chdg file stores project settings separately from generated output.</p></div><span class="ok" [class.on]="state().outputDir">✓</span></div>
					</div>
				</section>

				<section class="step-card metadata-card">
					<div class="step-index">6</div>
					<div class="card-body">
						<h2>Metadata</h2>
						<p>Set song information for song.ini.</p>
						<div class="metadata-grid">
							<label>Song Name<input [(ngModel)]="metadata.name" (ngModelChange)="updateMetadata()" /></label>
							<label>Artist<input [(ngModel)]="metadata.artist" (ngModelChange)="updateMetadata()" /></label>
							<label>Album<input [(ngModel)]="metadata.album" (ngModelChange)="updateMetadata()" /></label>
							<label>Year<input [(ngModel)]="metadata.year" (ngModelChange)="updateMetadata()" /></label>
							<label>Genre<input [(ngModel)]="metadata.genre" (ngModelChange)="updateMetadata()" /></label>
							<label>Charter<input [(ngModel)]="metadata.charter" (ngModelChange)="updateMetadata()" /></label>
						</div>
					</div>
				</section>

				<section class="step-card options-card">
					<div class="step-index">7</div>
					<div class="card-body options-layout">
						<div>
							<h2>Offset and Options</h2>
							<p>Chart offset is stored in the chart while note ticks are not moved.</p>
							<label class="offset-label">Chart Offset (ms)<input type="number" [ngModel]="state().offsetMs" (ngModelChange)="setOffset($event)" /></label>
						</div>
						<ul class="option-list">
							<li>Auto-detect source type</li>
							<li>Track selection later</li>
							<li>Local-only workflow</li>
						</ul>
					</div>
				</section>
			</main>

			<aside class="summary-card">
				<h2>Project Summary</h2>
				<dl class="summary-list">
					<dt>Project</dt><dd>{{ projectState.state().projectName }}</dd>
					<dt>Cover</dt><dd>{{ coverLabel() }}</dd>
					<dt>Status</dt><dd>{{ projectState.state().dirty ? 'Modified' : 'Saved' }}</dd>
					<dt>Output</dt><dd>{{ projectState.state().outputStatus }}</dd>
					<dt>Source</dt><dd>{{ fileName(state().sourcePath) || 'Not selected' }}</dd>
					<dt>Audio</dt><dd>{{ fileName(state().audioPath) || 'Required' }}</dd>
					<dt>Output folder</dt><dd>{{ state().outputDir || 'Not selected' }}</dd>
					<dt>Offset</dt><dd>{{ state().offsetMs ?? 0 }} ms</dd>
				</dl>
				@if (validation().errors.length > 0) {
					<div class="message warning small-message"><strong>Before generation:</strong><ul><li *ngFor="let error of validation().errors">{{ error }}</li></ul></div>
				}
				<div class="summary-actions">
					<button class="button primary" type="button" [disabled]="!state().sourcePath" (click)="inspectSource()">Inspect Source</button>
					<button class="button secondary" type="button" (click)="saveProject()">{{ primarySaveLabel() }}</button>
					<button class="button ghost" type="button" (click)="saveProjectAs()">Save As</button>
				</div>
				<p class="field-hint centered">You can review and adjust settings before proceeding.</p>
			</aside>
		</div>
	`,
	styles: [
		`
		.details-hero { align-items: start; display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1.15rem; }
		.details-hero h1 { font-size: clamp(2rem, 3vw, 3rem); letter-spacing: -0.04em; margin: 0.1rem 0 0.35rem; }
		.details-hero p, .card-body p, .field-hint { color: var(--color-muted); margin: 0; }
		.eyebrow { color: var(--color-accent-soft); font-size: 0.78rem; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; }
		.details-layout { align-items: start; display: grid; gap: 1.25rem; grid-template-columns: minmax(0, 1fr) minmax(19rem, 23rem); }
		.details-flow { display: grid; gap: 0.75rem; }
		.step-card, .summary-card { background: linear-gradient(180deg, rgba(22, 29, 38, 0.92), rgba(13, 17, 23, 0.82)); border: 1px solid var(--color-border); border-radius: 0.9rem; box-shadow: 0 18px 52px rgba(0,0,0,0.2); }
		.step-card { display: grid; gap: 1rem; grid-template-columns: 3rem minmax(0, 1fr); margin-left: 1.4rem; position: relative; }
		.step-index { align-items: center; background: linear-gradient(135deg, #7f4bd8, #4b2c7c); border-radius: 999px; box-shadow: 0 0 0 5px rgba(127,75,216,0.14); display: grid; font-weight: 900; height: 2.35rem; justify-items: center; left: -1.4rem; position: absolute; top: 1rem; width: 2.35rem; }
		.card-body { display: grid; gap: 0.75rem; padding: 1rem 1.15rem 1.05rem 1.35rem; }
		.section-heading { align-items: center; display: flex; justify-content: space-between; gap: 1rem; }
		h2 { font-size: 1.1rem; margin: 0; }
		.button-row, .compact { display: flex; gap: 0.55rem; }
		.input-like, input { background: rgba(255,255,255,0.045); border: 1px solid var(--color-border); border-radius: 0.55rem; color: var(--color-text); min-height: 2.45rem; padding: 0.55rem 0.7rem; width: 100%; }
		.file-row { align-items: center; background: rgba(255,255,255,0.035); border: 1px solid rgba(197,209,225,0.08); border-radius: 0.55rem; display: grid; gap: 0.75rem; grid-template-columns: 2.45rem minmax(0,1fr) 1.6rem; padding: 0.7rem; }
		.file-row strong, .file-row p { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.file-icon, .cover-placeholder { align-items: center; background: rgba(151,83,229,0.24); border: 1px solid rgba(151,83,229,0.36); border-radius: 0.5rem; color: var(--color-accent-soft); display: grid; justify-items: center; }
		.file-icon { height: 2.35rem; width: 2.35rem; }
		.ok { color: rgba(255,255,255,0.2); } .ok.on { color: var(--color-success); }
		.cover-preview-row { align-items: center; display: grid; gap: 1rem; grid-template-columns: 7rem minmax(0,1fr); }
		.cover-preview, .cover-placeholder { aspect-ratio: 1; border-radius: 0.8rem; height: 7rem; object-fit: cover; width: 7rem; }
		.cover-placeholder { font-size: 2rem; }
		.metadata-grid { display: grid; gap: 0.65rem 0.9rem; grid-template-columns: repeat(3, minmax(0, 1fr)); }
		.metadata-grid label, .offset-label { color: var(--color-muted); display: grid; font-size: 0.78rem; font-weight: 800; gap: 0.25rem; }
		.options-layout { grid-template-columns: minmax(0, 1fr) minmax(14rem, 20rem); }
		.option-list { color: var(--color-text-soft); display: grid; gap: 0.65rem; list-style: none; margin: 0; padding: 0; }
		.option-list li::before { color: var(--color-accent-soft); content: '✓'; font-weight: 900; margin-right: 0.5rem; }
		.summary-card { padding: 1.25rem; position: sticky; top: 1rem; }
		.summary-list { display: grid; gap: 0.6rem; margin: 1rem 0; }
		.summary-list dt { color: var(--color-muted); font-size: 0.76rem; font-weight: 900; text-transform: uppercase; }
		.summary-list dd { margin: -0.45rem 0 0; overflow-wrap: anywhere; }
		.summary-actions { display: grid; gap: 0.6rem; }
		.centered { text-align: center; }
		.small-message { font-size: 0.86rem; margin-bottom: 0.8rem; padding: 0.75rem; }
		@media (max-width: 1180px) { .details-layout { grid-template-columns: 1fr; } .summary-card { position: static; } }
		@media (max-width: 760px) { .section-heading, .details-hero { align-items: stretch; flex-direction: column; } .metadata-grid, .options-layout { grid-template-columns: 1fr; } .cover-preview-row { grid-template-columns: 1fr; } }
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
	readonly metadata = { ...this.generateState.state().metadata };
	projectNameInput = this.projectState.state().projectName;

	readonly title = computed(() =>
		this.projectState.state().projectFilePath
			? "Project Details"
			: "Edit Project",
	);
	readonly primarySaveLabel = computed(() =>
		this.projectState.state().projectFilePath ? "Save Changes" : "Save Draft",
	);
	readonly coverLabel = computed(() =>
		this.state().cover?.imagePath
			? this.fileName(this.state().cover?.imagePath)
			: "No cover selected",
	);
	readonly coverPreviewSrc = computed(() => {
		const imagePath = this.state().cover?.imagePath;
		return imagePath ? `file://${imagePath}` : undefined;
	});

	constructor() {
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
		const name = this.projectNameInput.trim() || "Untitled";
		const ok = await this.projectState.createProject(name);
		if (ok) {
			this.generateState.reset();
			this.projectNameInput = name;
		}
	}

	async saveProject(): Promise<void> {
		const name = this.projectState.state().projectName;
		const filePath = this.projectState.state().projectFilePath;
		const payload = this.generateState.buildProjectStatePayload(name, filePath);
		await this.projectState.saveProject(payload);
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
			if (picked) this.generateState.setCoverImagePath(picked.path);
		});
	}

	clearCover(): void {
		this.generateState.setCoverImagePath(undefined);
	}

	updateMetadata(): void {
		this.generateState.setMetadata(this.metadata);
	}

	setOffset(value: number | string | null): void {
		this.generateState.setOffsetMsInput(value === null ? "" : String(value));
	}

	async inspectSource(): Promise<void> {
		const sourcePath = this.state().sourcePath;
		if (!sourcePath) {
			this.generateState.applyError("Source file is required.");
			return;
		}
		this.generateState.startInspecting();
		try {
			const envelope = await this.bridge.inspectSource({
				sourcePath,
				drumsOnly: true,
			});
			this.generateState.applyInspection(envelope);
			if (envelope.ok) await this.router.navigateByUrl("/inspect-source");
		} catch (error) {
			this.generateState.applyError(
				error instanceof Error ? error.message : "Inspect failed.",
			);
		}
	}

	fileName(filePath: string | undefined): string {
		if (!filePath) return "";
		return filePath.split(/[\\/]/).pop() ?? filePath;
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
