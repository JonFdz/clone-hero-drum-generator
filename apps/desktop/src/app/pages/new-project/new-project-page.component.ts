import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import type { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import type { DesktopProjectStateService } from "../../services/desktop-project-state.service";
import { PROJECT_PERSISTENCE_UNAVAILABLE_MESSAGE } from "../../features/project-session/public-api";

@Component({
	selector: "chdg-new-project-page",
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule],
	template: `
    <header class="page-header">
      <p class="eyebrow">Project Creation Unavailable</p>
      <h1>Legacy runtime setup</h1>
      <p>This dormant screen cannot create or save a canonical .chdg project. Any selected values remain runtime-only.</p>
    </header>

    @if (projectState.missingPathWarnings().length > 0) {
      <section class="card message warning">
        <h2>Missing files</h2>
        <ul>
          @for (warning of projectState.missingPathWarnings(); track warning.kind) {
            <li>{{ warning.message }}</li>
          }
        </ul>
        <p>File replacement and managed generation are unavailable in this dormant workflow.</p>
      </section>
    }

    @if (projectState.outputStatus() === 'needs-regenerate') {
      <section class="card message warning">
        <h2>Output outdated</h2>
        <p>The persisted export status is outdated. Managed regeneration is unavailable in this dormant workflow.</p>
      </section>
    }

    <fieldset class="grid two" disabled [title]="persistenceUnavailableMessage">
      <section class="card form-card">
        <h2>Project inputs</h2>

        <div class="field-group">
          <label>Project Name <span class="required">required</span></label>
          <div class="picker-row">
            <input class="input-like" [(ngModel)]="projectNameInput" (change)="updateProjectName()" placeholder="Enter project name" />
            <button class="button secondary" type="button" [disabled]="true" [title]="persistenceUnavailableMessage" (click)="createProject()">Creation Unavailable</button>
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
          <button class="button primary" type="button" disabled [title]="persistenceUnavailableMessage" (click)="reviewSource()">Source Review Unavailable</button>
        </div>
      </section>

      <aside class="card summary-card">
        <h2>Project Summary</h2>
        <dl class="summary-list">
          <dt>Project</dt><dd>{{ projectState.state().projectName }}</dd>
          <dt>Status</dt><dd>Runtime only</dd>
          <dt>Output</dt><dd>{{ projectState.state().outputStatus }}</dd>
          <dt>Source</dt><dd>{{ state().sourcePath || "Not selected" }}</dd>
          <dt>Source type</dt><dd>{{ state().sourceKind || "Unknown" }}</dd>
          <dt>Audio</dt><dd>{{ state().audioPath || "Required" }}</dd>
          <dt>Output folder</dt><dd>{{ state().outputDir || "Not selected" }}</dd>
          <dt>Offset</dt><dd>{{ state().offsetMs ?? 0 }} ms</dd>
        </dl>
        <div class="action-row">
          <button class="button secondary small" type="button" [disabled]="true" [title]="persistenceUnavailableMessage" (click)="saveProject()">Save Unavailable</button>
          <button class="button secondary small" type="button" [disabled]="true" [title]="persistenceUnavailableMessage" (click)="saveProjectAs()">Save As Unavailable</button>
        </div>
        <p class="message warning" role="status">{{ persistenceUnavailableMessage }}</p>
      </aside>
    </fieldset>
  `,
})
export class NewProjectPageComponent {
	readonly state = this.generateState.state;
	readonly validation = this.generateState.validation;
	readonly metadata = { ...this.generateState.state().metadata };
	projectNameInput = this.projectState.state().projectName;
	readonly persistenceUnavailableMessage =
		PROJECT_PERSISTENCE_UNAVAILABLE_MESSAGE;

	constructor(
		readonly generateState: DesktopGenerateStateService,
		readonly projectState: DesktopProjectStateService,
	) {}

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

	private reportUnavailable(): void {
		this.generateState.applyError(this.persistenceUnavailableMessage);
	}
}
