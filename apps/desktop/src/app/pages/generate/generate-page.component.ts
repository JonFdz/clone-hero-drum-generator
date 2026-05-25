import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import type { ValidationItem } from "@chdg/project/browser";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { DesktopValidationService } from "../../services/desktop-validation.service";

@Component({
	selector: "chdg-generate-page",
	standalone: true,
	imports: [CommonModule, RouterModule],
	template: `
    <header class="page-header">
      <p class="eyebrow">Generate</p>
      <h1>Create the Clone Hero package</h1>
      <p>Review validation first, then generate through the secure Electron main/preload bridge.</p>
    </header>

    <section class="card validation-preflight" [class.blocked]="!summary().canGenerate">
      <div class="split-row">
        <div>
          <h2>{{ summary().canGenerate ? "Ready to generate" : "Generation blocked" }}</h2>
          <p>{{ summary().canGenerate ? "Warnings and info are shown below, but no blocking errors were found." : "Fix blocking errors before starting generation." }}</p>
        </div>
        <div class="count-row">
          <span class="pill danger">{{ summary().errorCount }} errors</span>
          <span class="pill warning">{{ summary().warningCount }} warnings</span>
          <span class="pill">{{ summary().infoCount }} info</span>
        </div>
      </div>
      <p class="field-hint">Last checked: {{ formatCheckedAt(summary().checkedAt) }}</p>

      @if (blockingItems().length > 0) {
        <ul class="validation-list">
          <li *ngFor="let item of blockingItems()" class="validation-item error">
            <strong>{{ item.title }}</strong>
            <span>{{ item.message }}</span>
            @if (item.fixAction?.route) { <a [routerLink]="item.fixAction?.route">{{ item.fixAction?.label }}</a> }
          </li>
        </ul>
      }

      @if (nonBlockingItems().length > 0) {
        <details class="validation-details" open>
          <summary>Warnings and info</summary>
          <ul class="validation-list compact-list">
            <li *ngFor="let item of nonBlockingItems()" class="validation-item" [class.warning]="item.severity === 'warning'" [class.info]="item.severity === 'info'">
              <strong>{{ item.severity }} · {{ item.title }}</strong>
              <span>{{ item.message }}</span>
            </li>
          </ul>
        </details>
      }
      <a class="button ghost" routerLink="/validation">Open full validation checklist</a>
    </section>

    <div class="grid two">
      <section class="card">
        <h2>Generation Configuration</h2>
        <dl class="summary-list">
          <dt>Source</dt><dd>{{ state().sourcePath || "Not selected" }}</dd>
          <dt>Audio</dt><dd>{{ state().audioPath || "Not selected" }}</dd>
          <dt>Selected tracks</dt><dd>{{ state().selectedTracks.length ? state().selectedTracks.join(", ") : "None" }}</dd>
          <dt>Output folder</dt><dd>{{ state().outputDir || "Not selected" }}</dd>
          <dt>Song</dt><dd>{{ state().metadata.name || "From source filename" }}</dd>
          <dt>Offset</dt><dd>{{ state().offsetMs ?? 0 }} ms</dd>
        </dl>
      </section>

      <section class="card">
        <h2>Generation Steps</h2>
        <ol class="placeholder-list">
          <li>Parse Source</li>
          <li>Normalize Drums</li>
          <li>Merge Selected Tracks</li>
          <li>Write notes.chart</li>
          <li>Write song.ini</li>
          <li>Convert Audio to song.ogg</li>
          <li>Finalize Package</li>
        </ol>
      </section>
    </div>

    @if (state().errorMessage) {
      <section class="card message danger"><h2>Generation error</h2><p>{{ state().errorMessage }}</p></section>
    }

    @if (state().generationResult; as result) {
      <section class="card">
        <h2>Output Files</h2>
        <div class="piece-grid">
          <div class="mini-card"><strong>notes.chart</strong><span>{{ result.files.chart }}</span></div>
          <div class="mini-card"><strong>song.ini</strong><span>{{ result.files.songIni }}</span></div>
          <div class="mini-card"><strong>song.ogg</strong><span>{{ result.files.songOgg || "Audio conversion did not produce song.ogg" }}</span></div>
        </div>
        <dl class="summary-list compact">
          <dt>Hit count</dt><dd>{{ result.hitCount }}</dd>
          <dt>Mapped notes</dt><dd>{{ result.mappedNoteCount }}</dd>
          <dt>Deduplicated notes</dt><dd>{{ result.deduplicatedCount }}</dd>
          <dt>Selected tracks</dt><dd>{{ result.selectedTracks.join(", ") }}</dd>
        </dl>
      </section>
    }

    <section class="card">
      <h2>Generation Log</h2>
      @if (state().logs.length === 0) { <p>No generation actions yet.</p> }
      <ul class="log-list"><li *ngFor="let log of state().logs">{{ log }}</li></ul>
    </section>

    <div class="action-row">
      <a class="button ghost" routerLink="/source-review">Back</a>
      <button class="button primary" type="button" [disabled]="state().status === 'generating' || !summary().canGenerate" (click)="generate(false)">Start Generate</button>
      <button class="button secondary" type="button" [disabled]="!state().generationResult" (click)="openOutputFolder()">Open Output Folder</button>
    </div>
  `,
	styles: [
		`
    .validation-preflight { margin-bottom: var(--space-5); }
    .validation-preflight.blocked { border-color: rgba(255, 107, 122, 0.45); }
    .count-row { display: flex; flex-wrap: wrap; gap: var(--space-2); justify-content: flex-end; }
    .pill.danger { background: rgba(255, 107, 122, 0.15); border-color: rgba(255, 107, 122, 0.35); color: var(--color-danger); }
    .pill.warning { background: rgba(246, 180, 80, 0.15); border-color: rgba(246, 180, 80, 0.35); color: var(--color-warning); }
    .validation-list { display: grid; gap: var(--space-3); list-style: none; margin: var(--space-4) 0; padding: 0; }
    .validation-item { border: 1px solid var(--color-border); border-radius: var(--radius-md); display: grid; gap: var(--space-2); padding: var(--space-3); }
    .validation-item span { color: var(--color-text-soft); overflow-wrap: anywhere; }
    .validation-item.error { border-color: rgba(255, 107, 122, 0.45); }
    .validation-item.warning { border-color: rgba(246, 180, 80, 0.35); }
    .validation-item.info { border-color: rgba(166, 108, 255, 0.28); }
    .validation-details { margin: var(--space-4) 0; }
    .compact-list { max-height: 16rem; overflow: auto; }
  `,
	],
})
export class GeneratePageComponent {
	readonly state = this.generateState.state;
	readonly summary = this.validationService.summary;

	constructor(
		private readonly bridge: DesktopBridgeService,
		private readonly generateState: DesktopGenerateStateService,
		private readonly validationService: DesktopValidationService,
	) {}

	blockingItems(): ValidationItem[] {
		return this.summary().items.filter((item) => item.blocking);
	}

	nonBlockingItems(): ValidationItem[] {
		return this.summary().items.filter((item) => !item.blocking);
	}

	formatCheckedAt(value: string): string {
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
	}

	async generate(overwriteKnownFiles: boolean): Promise<void> {
		const summary = this.validationService.validateNow();
		if (!summary.canGenerate) {
			this.generateState.applyError(
				summary.items
					.filter((item) => item.blocking)
					.map((item) => item.message)
					.join(" "),
			);
			return;
		}

		const input = this.generateState.buildGenerateInput(overwriteKnownFiles);
		if (!input) {
			this.generateState.applyError("Generation input is incomplete.");
			return;
		}

		this.generateState.startGenerating();
		try {
			const envelope = await this.bridge.generatePackage(input);
			if (
				!envelope.ok &&
				envelope.error.code === "OVERWRITE_CONFIRMATION_REQUIRED" &&
				!overwriteKnownFiles
			) {
				const confirmed = window.confirm(
					`${envelope.error.message}\n\nOverwrite only notes.chart, song.ini, and song.ogg?`,
				);
				if (confirmed) {
					await this.generate(true);
					return;
				}
			}
			this.generateState.applyGeneration(envelope);
		} catch (error) {
			this.generateState.applyError(
				error instanceof Error ? error.message : "Generation failed.",
			);
		}
	}

	async openOutputFolder(): Promise<void> {
		const outputDir =
			this.state().generationResult?.outputDir ?? this.state().outputDir;
		if (!outputDir) return;
		try {
			const envelope = await this.bridge.openOutputFolder(outputDir);
			if (!envelope.ok)
				this.generateState.applyError(envelope.error.message, envelope.issues);
		} catch (error) {
			this.generateState.applyError(
				error instanceof Error ? error.message : "Open output folder failed.",
			);
		}
	}
}
