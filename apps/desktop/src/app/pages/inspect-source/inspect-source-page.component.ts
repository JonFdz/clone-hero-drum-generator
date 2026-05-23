import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { formatTrackNoteCount } from "../../services/track-note-count";

@Component({
	selector: "chdg-inspect-source-page",
	standalone: true,
	imports: [CommonModule, RouterModule],
	template: `
    <header class="page-header">
      <p class="eyebrow">Inspect Source</p>
      <h1>Structured source inspection</h1>
      <p>Inspection runs through the secure desktop bridge and &#64;chdg/project.</p>
    </header>

    @if (!state().sourcePath) {
      <section class="card message warning">
        <h2>No source selected</h2>
        <p>Start from New Project and select a local .mid, .midi, or .gp source.</p>
        <a class="button primary" routerLink="/new-project">New Project</a>
      </section>
    } @else {
      <div class="action-row top-actions">
        <button class="button secondary" type="button" (click)="inspectAgain()">Re-inspect</button>
        <button class="button primary" type="button" [disabled]="!state().inspection" (click)="goToTracks()">Continue to Track Selection</button>
      </div>

      @if (state().errorMessage) {
        <section class="card message danger"><h2>Inspection error</h2><p>{{ state().errorMessage }}</p></section>
      }

      @if (state().inspection; as inspection) {
        <div class="grid two">
          <section class="card">
            <h2>Source Summary</h2>
            <dl class="summary-list">
              <dt>Source type</dt><dd>{{ inspection.sourceKind }}</dd>
              <dt>File path</dt><dd>{{ inspection.sourcePath }}</dd>
              <dt>Resolution / PPQ</dt><dd>{{ inspection.resolution ?? "n/a" }}</dd>
              <dt>Tempo events</dt><dd>{{ inspection.tempos.length }}</dd>
              <dt>Time signatures</dt><dd>{{ inspection.timeSignatures.length }}</dd>
              <dt>Sections</dt><dd>{{ inspection.sections.length }}</dd>
              <dt>Total tracks</dt><dd>{{ inspection.tracks.length }}</dd>
            </dl>
          </section>

          <section class="card">
            <h2>Drum Candidates</h2>
            <div class="card-list">
              <div class="mini-card" *ngFor="let track of drumCandidates()">
                <div class="split-row"><strong>#{{ track.index }} {{ track.name || "Untitled track" }}</strong><span class="pill">{{ track.strength }}</span></div>
                <p>{{ noteCountLabel(track.noteCount) }} · {{ track.role }}</p>
              </div>
            </div>
          </section>
        </div>

        <section class="card table-card">
          <h2>Detected Tracks</h2>
          <table>
            <thead><tr><th>Track</th><th>Name</th><th>Notes</th><th>Strength</th><th>Role</th><th>Selected</th></tr></thead>
            <tbody>
              <tr *ngFor="let track of inspection.tracks">
                <td>{{ track.index }}</td>
                <td>{{ track.name || "Untitled" }}</td>
                <td>{{ noteCountLabel(track.noteCount) }}</td>
                <td>{{ track.strength }}</td>
                <td>{{ track.role }}</td>
                <td>{{ state().selectedTracks.includes(track.index) ? "yes" : "no" }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        @if (inspection.issues.length > 0) {
          <section class="card message warning">
            <h2>Warnings / Issues</h2>
            <ul><li *ngFor="let issue of inspection.issues">{{ issue.severity }} · {{ issue.code }} — {{ issue.message }}</li></ul>
          </section>
        }
      } @else {
        <section class="card"><h2>Ready to inspect</h2><p>{{ state().sourcePath }}</p></section>
      }
    }
  `,
})
export class InspectSourcePageComponent {
	readonly state = this.generateState.state;

	constructor(
		private readonly bridge: DesktopBridgeService,
		private readonly generateState: DesktopGenerateStateService,
		private readonly router: Router,
	) {}

	drumCandidates() {
		return (this.state().inspection?.tracks ?? []).filter(
			(track) => track.role === "drums",
		);
	}

	async inspectAgain(): Promise<void> {
		const sourcePath = this.state().sourcePath;
		if (!sourcePath) return;
		this.generateState.startInspecting();
		try {
			this.generateState.applyInspection(
				await this.bridge.inspectSource({ sourcePath, drumsOnly: true }),
			);
		} catch (error) {
			this.generateState.applyError(
				error instanceof Error ? error.message : "Inspect failed.",
			);
		}
	}

	noteCountLabel(noteCount: number | null | undefined): string {
		return formatTrackNoteCount(noteCount);
	}

	async goToTracks(): Promise<void> {
		await this.router.navigateByUrl("/track-selection");
	}
}
