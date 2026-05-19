import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";

@Component({
	selector: "chdg-track-selection-page",
	standalone: true,
	imports: [CommonModule, RouterModule],
	template: `
    <header class="page-header">
      <p class="eyebrow">Track Selection</p>
      <h1>Select one or more drum tracks</h1>
      <p>Multi-track selection is supported. Source timing is preserved; conflicts are reported.</p>
    </header>

    @if (!state().inspection) {
      <section class="card message warning">
        <h2>Inspection required</h2>
        <p>Inspect a source before selecting tracks.</p>
        <a class="button primary" routerLink="/new-project">Start New Project</a>
      </section>
    } @else {
      <div class="grid two">
        <section class="card table-card">
          <h2>Track Candidates</h2>
          <table>
            <thead><tr><th></th><th>Track</th><th>Name</th><th>Role</th><th>Notes</th><th>Confidence</th></tr></thead>
            <tbody>
              <tr *ngFor="let track of state().inspection?.tracks" [class.selected-row]="state().selectedTracks.includes(track.index)">
                <td><input type="checkbox" [checked]="state().selectedTracks.includes(track.index)" (change)="toggleTrack(track.index)" /></td>
                <td>{{ track.index }}</td>
                <td>{{ track.name || "Untitled" }}</td>
                <td>{{ track.role }}</td>
                <td>{{ track.noteCount }}</td>
                <td>{{ track.strength }}</td>
              </tr>
            </tbody>
          </table>
          <p class="field-hint">{{ state().selectedTracks.length }} track(s) selected.</p>
        </section>

        <section class="card">
          <h2>Combined / Normalization Summary</h2>
          @if (state().normalizationPreview; as preview) {
            <dl class="summary-list">
              <dt>Selected tracks</dt><dd>{{ preview.selectedTracks.join(", ") }}</dd>
              <dt>Hit count</dt><dd>{{ preview.hitCount }}</dd>
              <dt>Source kind</dt><dd>{{ preview.sourceKind }}</dd>
              <dt>Issues</dt><dd>{{ preview.issues.length }}</dd>
            </dl>
            @if (preview.mergeSummary) {
              <div class="mini-card">
                <h3>Merge Summary</h3>
                <p>{{ preview.mergeSummary.inputHitCount }} input hit(s), {{ preview.mergeSummary.mergedHitCount }} merged, {{ preview.mergeSummary.duplicateHitCount }} duplicate(s) removed.</p>
              </div>
            }
          } @else {
            <p>Run normalization preview after selecting track(s).</p>
          }
        </section>
      </div>

      @if (state().normalizationPreview; as preview) {
        <section class="card">
          <h2>Piece Summary</h2>
          <div class="piece-grid">
            <div class="mini-card" *ngFor="let item of pieceSummaryEntries(preview.pieceSummary)">
              <strong>{{ item[0] }}</strong><span>{{ item[1] }}</span>
            </div>
          </div>
        </section>

        <section class="card table-card">
          <h2>First Hits</h2>
          <table>
            <thead><tr><th>Tick</th><th>Piece</th><th>Velocity</th><th>Source</th></tr></thead>
            <tbody><tr *ngFor="let hit of preview.firstHits"><td>{{ hit.tick }}</td><td>{{ hit.piece }}</td><td>{{ hit.velocity }}</td><td>{{ sourceLabel(hit.source) }}</td></tr></tbody>
          </table>
        </section>
      }

      @if (state().errorMessage) {
        <section class="card message danger"><h2>Track selection error</h2><p>{{ state().errorMessage }}</p></section>
      }

      <div class="action-row">
        <a class="button ghost" routerLink="/inspect-source">Back</a>
        <button class="button secondary" type="button" [disabled]="state().selectedTracks.length === 0" (click)="normalize()">Normalize Preview</button>
        <button class="button primary" type="button" [disabled]="state().selectedTracks.length === 0" (click)="continueToGenerate()">Continue to Generate</button>
      </div>
    }
  `,
})
export class TrackSelectionPageComponent {
	readonly state = this.generateState.state;

	constructor(
		private readonly bridge: DesktopBridgeService,
		private readonly generateState: DesktopGenerateStateService,
		private readonly router: Router,
	) {}

	toggleTrack(trackIndex: number): void {
		this.generateState.toggleTrack(trackIndex);
	}

	async normalize(): Promise<void> {
		const input = this.generateState.buildNormalizeInput();
		if (!input) {
			this.generateState.applyError(
				"Select at least one track before normalization.",
			);
			return;
		}
		this.generateState.startNormalizing();
		try {
			this.generateState.applyNormalization(
				await this.bridge.normalizeSelection(input),
			);
		} catch (error) {
			this.generateState.applyError(
				error instanceof Error ? error.message : "Normalization failed.",
			);
		}
	}

	async continueToGenerate(): Promise<void> {
		if (!this.state().normalizationPreview) {
			await this.normalize();
		}
		if (this.state().normalizationPreview) {
			await this.router.navigateByUrl("/generate");
		}
	}

	pieceSummaryEntries(
		summary: Record<string, number>,
	): Array<[string, number]> {
		return Object.entries(summary).sort(([a], [b]) => a.localeCompare(b));
	}

	sourceLabel(source: unknown): string {
		if (typeof source !== "object" || source === null) return "source";
		if ("trackIndex" in source && typeof source.trackIndex === "number")
			return `track ${source.trackIndex}`;
		if ("trackName" in source && typeof source.trackName === "string")
			return source.trackName;
		return "source";
	}
}
