import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { type Router, RouterModule } from "@angular/router";
import type { DesktopBridgeService } from "../../services/desktop-bridge.service";
import type { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import type { DesktopProjectStateService } from "../../services/desktop-project-state.service";

@Component({
	selector: "chdg-new-project-page",
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule],
	template: `
    <header class="page-header">
      <p class="eyebrow">New Project</p>
      <h1>{{ projectState.state().projectName }}</h1>
      <p>Select local source/audio files, an output folder, metadata, and chart offset.</p>
    </header>

    @if (projectState.missingPathWarnings().length > 0) {
      <section class="card message warning">
        <h2>Missing files</h2>
        <ul>
          @for (warning of projectState.missingPathWarnings(); track warning.kind) {
            <li>{{ warning.message }}</li>
          }
        </ul>
        <p>Re-select missing files before generating.</p>
      </section>
    }

    @if (projectState.outputStatus() === 'needs-regenerate') {
      <section class="card message warning">
        <h2>Output outdated</h2>
        <p>Generation inputs changed since the last successful generation. Regenerate to update output.</p>
      </section>
    }

    <div class="grid two">
      <section class="card form-card">
        <h2>Project inputs</h2>

        <div class="field-group">
          <label>Project Name <span class="required">required</span></label>
          <div class="picker-row">
            <input class="input-like" [(ngModel)]="projectNameInput" (change)="updateProjectName()" placeholder="Enter project name" />
            <button class="button secondary" type="button" (click)="createProject()">Create Project</button>
          </div>
        </div>

        <div class="field-group">
          <label>Source File <span class="required">required</span></label>
          <div class="picker-row">
            <input class="input-like path-input" [value]="state().sourcePath ?? ''" readonly placeholder="Select .mid, .midi, or .gp" />
            <button class="button secondary" type="button" (click)="pickSource()">Choose Source</button>
          </div>
          <p class="field-hint">Detected source type: <strong>{{ state().sourceKind ?? "not selected" }}</strong></p>
        </div>

        <div class="field-group">
          <label>Audio File <span class="required">required</span></label>
          <div class="picker-row">
            <input class="input-like path-input" [value]="state().audioPath ?? ''" readonly placeholder="Select .mp3, .wav, .ogg, or other local audio" />
            <button class="button secondary" type="button" (click)="pickAudio()">Choose Audio</button>
          </div>
          <p class="field-hint">Audio is required for Desktop Generate MVP.</p>
        </div>

        <div class="field-group">
          <label>Output Folder <span class="required">required</span></label>
          <div class="picker-row">
            <input class="input-like path-input" [value]="state().outputDir ?? ''" readonly placeholder="Select output folder" />
            <button class="button secondary" type="button" (click)="pickOutput()">Choose Folder</button>
          </div>
          <p class="field-hint">Generation writes notes.chart, song.ini, and song.ogg here. No recursive cleanup is performed.</p>
        </div>

        <h2>Metadata</h2>
        <div class="metadata-grid">
          <label>Song name<input [(ngModel)]="metadata.name" (ngModelChange)="updateMetadata()" /></label>
          <label>Artist<input [(ngModel)]="metadata.artist" (ngModelChange)="updateMetadata()" /></label>
          <label>Album<input [(ngModel)]="metadata.album" (ngModelChange)="updateMetadata()" /></label>
          <label>Year<input [(ngModel)]="metadata.year" (ngModelChange)="updateMetadata()" /></label>
          <label>Genre<input [(ngModel)]="metadata.genre" (ngModelChange)="updateMetadata()" /></label>
          <label>Charter<input [(ngModel)]="metadata.charter" (ngModelChange)="updateMetadata()" /></label>
          <label>Chart Offset (ms)<input type="number" [ngModel]="state().offsetMs" (ngModelChange)="setOffset($event)" /></label>
        </div>

        @if (validation().errors.length > 0) {
          <div class="message warning"><strong>Before generation:</strong><ul><li *ngFor="let error of validation().errors">{{ error }}</li></ul></div>
        }

        <div class="action-row">
          <button class="button primary" type="button" [disabled]="!state().sourcePath" (click)="reviewSource()">Review Source</button>
          <a class="button ghost" routerLink="/source-review">Source Review</a>
        </div>
      </section>

      <aside class="card summary-card">
        <h2>Project Summary</h2>
        <dl class="summary-list">
          <dt>Project</dt><dd>{{ projectState.state().projectName }}</dd>
          <dt>Status</dt><dd>{{ projectState.state().dirty ? 'Modified' : 'Saved' }}</dd>
          <dt>Output</dt><dd>{{ projectState.state().outputStatus }}</dd>
          <dt>Source</dt><dd>{{ state().sourcePath || "Not selected" }}</dd>
          <dt>Source type</dt><dd>{{ state().sourceKind || "Unknown" }}</dd>
          <dt>Audio</dt><dd>{{ state().audioPath || "Required" }}</dd>
          <dt>Output folder</dt><dd>{{ state().outputDir || "Not selected" }}</dd>
          <dt>Offset</dt><dd>{{ state().offsetMs ?? 0 }} ms</dd>
        </dl>
        <div class="action-row">
          <button class="button secondary small" type="button" (click)="saveProject()">Save</button>
          <button class="button secondary small" type="button" (click)="saveProjectAs()">Save As</button>
        </div>
      </aside>
    </div>
  `,
})
export class NewProjectPageComponent {
	readonly state = this.generateState.state;
	readonly validation = this.generateState.validation;
	readonly metadata = { ...this.generateState.state().metadata };
	projectNameInput = this.projectState.state().projectName;

	constructor(
		private readonly bridge: DesktopBridgeService,
		readonly generateState: DesktopGenerateStateService,
		readonly projectState: DesktopProjectStateService,
		private readonly router: Router,
	) {
		// Apply default charter/offset from settings if empty
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
		if (!this.projectNameInput.trim()) return;
		const ok = await this.projectState.createProject(
			this.projectNameInput.trim(),
		);
		if (ok) {
			this.generateState.reset();
			// Apply defaults from settings
			const settings = this.projectState.state().settings;
			if (settings.defaultCharter) {
				this.metadata.charter = settings.defaultCharter;
				this.generateState.setMetadata(this.metadata);
			}
			if (settings.defaultOffsetMs !== undefined) {
				this.generateState.setOffsetMsInput(String(settings.defaultOffsetMs));
			}
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
