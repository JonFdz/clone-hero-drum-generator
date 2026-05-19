import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";

@Component({
	selector: "chdg-new-project-page",
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule],
	template: `
    <header class="page-header">
      <p class="eyebrow">New Project</p>
      <h1>Generate a Clone Hero song folder</h1>
      <p>Select local source/audio files, an output folder, metadata, and chart offset. State is in memory only for Phase 11.</p>
    </header>

    <div class="grid two">
      <section class="card form-card">
        <h2>Project inputs</h2>

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
          <button class="button primary" type="button" [disabled]="!state().sourcePath" (click)="inspectSource()">Inspect Source</button>
          <a class="button ghost" routerLink="/track-selection">Track Selection</a>
        </div>
      </section>

      <aside class="card summary-card">
        <h2>Project Summary</h2>
        <dl class="summary-list">
          <dt>Source</dt><dd>{{ state().sourcePath || "Not selected" }}</dd>
          <dt>Source type</dt><dd>{{ state().sourceKind || "Unknown" }}</dd>
          <dt>Audio</dt><dd>{{ state().audioPath || "Required" }}</dd>
          <dt>Output</dt><dd>{{ state().outputDir || "Not selected" }}</dd>
          <dt>Offset</dt><dd>{{ state().offsetMs ?? 0 }} ms</dd>
        </dl>
        <p>Local-only workflow. No URLs, uploads, .chdg persistence, or external editor integration in this phase.</p>
      </aside>
    </div>
  `,
})
export class NewProjectPageComponent {
	readonly state = this.generateState.state;
	readonly validation = this.generateState.validation;
	readonly metadata = { ...this.generateState.state().metadata };

	constructor(
		private readonly bridge: DesktopBridgeService,
		private readonly generateState: DesktopGenerateStateService,
		private readonly router: Router,
	) {}

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
