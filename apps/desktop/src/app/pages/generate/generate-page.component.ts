import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";

@Component({
	selector: "chdg-generate-page",
	standalone: true,
	imports: [CommonModule, RouterModule],
	template: `
    <header class="page-header">
      <p class="eyebrow">Generate</p>
      <h1>Create the Clone Hero package</h1>
      <p>Generation uses &#64;chdg/project through the secure Electron main/preload bridge. It never calls the CLI.</p>
    </header>

    @if (validation().errors.length > 0) {
      <section class="card message warning">
        <h2>Generation blocked</h2>
        <ul><li *ngFor="let error of validation().errors">{{ error }}</li></ul>
        <a class="button primary" routerLink="/new-project">Fix inputs</a>
      </section>
    } @else {
      <div class="grid two">
        <section class="card">
          <h2>Generation Configuration</h2>
          <dl class="summary-list">
            <dt>Source</dt><dd>{{ state().sourcePath }}</dd>
            <dt>Audio</dt><dd>{{ state().audioPath }}</dd>
            <dt>Selected tracks</dt><dd>{{ state().selectedTracks.join(", ") }}</dd>
            <dt>Output folder</dt><dd>{{ state().outputDir }}</dd>
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

      @if (state().issues.length > 0) {
        <section class="card message warning"><h2>Issues / Warnings</h2><ul><li *ngFor="let issue of state().issues">{{ issue.severity }} · {{ issue.code }} — {{ issue.message }}</li></ul></section>
      }

      <section class="card">
        <h2>Generation Log</h2>
        @if (state().logs.length === 0) { <p>No generation actions yet.</p> }
        <ul class="log-list"><li *ngFor="let log of state().logs">{{ log }}</li></ul>
      </section>

      <div class="action-row">
        <a class="button ghost" routerLink="/track-selection">Back</a>
        <button class="button primary" type="button" [disabled]="state().status === 'generating'" (click)="generate(false)">Start Generate</button>
        <button class="button secondary" type="button" [disabled]="!state().generationResult" (click)="openOutputFolder()">Open Output Folder</button>
      </div>
    }
  `,
})
export class GeneratePageComponent {
	readonly state = this.generateState.state;
	readonly validation = this.generateState.validation;

	constructor(
		private readonly bridge: DesktopBridgeService,
		private readonly generateState: DesktopGenerateStateService,
	) {}

	async generate(overwriteKnownFiles: boolean): Promise<void> {
		const input = this.generateState.buildGenerateInput(overwriteKnownFiles);
		if (!input) {
			this.generateState.applyError(this.validation().errors.join(" "));
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
