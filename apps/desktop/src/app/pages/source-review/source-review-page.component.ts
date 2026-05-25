import { CommonModule } from "@angular/common";
import { Component, type OnInit, computed, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import {
	applyMappingProfile,
	type MappingOverrideProfile,
	type MappingProfileApplyMode,
	type ProjectIssue,
	type ProjectMappingOverrides,
	type TrackCandidate,
} from "@chdg/project/browser";
import {
	buildMappingRows,
	type MappingRow,
} from "../mapping/mapping-page.model";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { SourceReviewOrchestratorService } from "../../services/source-review-orchestrator.service";
import { formatTrackNoteCount } from "../../services/track-note-count";
import {
	shouldExpandMappingReview,
	sourceSectionsLabel,
} from "../../services/source-review-model";

const PIECES = [
	"kick",
	"snare",
	"hihat_closed",
	"hihat_open",
	"crash",
	"ride",
	"tom_high",
	"tom_mid",
	"tom_floor",
] as const;

@Component({
	selector: "chdg-source-review-page",
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule],
	template: `
		<header class="source-review-header">
			<div>
				<h1>Source Review</h1>
				<p>Review detected drum tracks, normalized preview, and mapping before generation.</p>
			</div>
			<span class="review-status" [class.attention]="status() === 'attention'" [class.failed]="status() === 'failed'">{{ statusLabel() }}</span>
		</header>

		@if (!state().sourcePath) {
			<section class="card message warning">
				<h2>No source selected</h2>
				<p>Choose a local .mid, .midi, or .gp source in Project Details first.</p>
				<a class="button primary" routerLink="/projects/details">Back to Project Details</a>
			</section>
		} @else {
			<section class="card selected-source-card">
				<div class="file-icon">{{ state().sourceKind === 'gpif' ? 'GP' : 'MID' }}</div>
				<div class="selected-source-copy">
					<p class="eyebrow">Selected Source</p>
					<h2>{{ fileName(state().sourcePath) }}</h2>
					<p>{{ state().sourcePath }}</p>
				</div>
				<dl>
					<dt>Source Kind</dt><dd>{{ sourceKindLabel() }}</dd>
					<dt>Last Analyzed</dt><dd>{{ analyzedAt() }}</dd>
				</dl>
				<div class="source-actions">
					<button class="button secondary small" type="button" (click)="refreshAnalysis()">Refresh Analysis</button>
					<button class="button secondary small" type="button" (click)="jsonOpen = !jsonOpen">View JSON</button>
				</div>
			</section>

			@if (state().errorMessage) {
				<section class="card message danger"><h2>Source review failed</h2><p>{{ state().errorMessage }}</p></section>
			}
			@if (orchestrator.autosaveWarning()) {
				<section class="card message warning"><p>{{ orchestrator.autosaveWarning() }}</p></section>
			}

			<div class="summary-grid">
				<section class="card">
					<h2>Source Summary</h2>
					<dl class="summary-list compact">
						<dt>Source Type</dt><dd>{{ sourceKindLabel() }}</dd>
						<dt>Resolution (PPQ)</dt><dd>{{ state().inspection?.resolution ?? 'n/a' }}</dd>
						<dt>Tempo Count</dt><dd>{{ state().inspection?.tempos?.length ?? 'n/a' }}</dd>
						<dt>Time Signatures</dt><dd>{{ state().inspection?.timeSignatures?.length ?? 'n/a' }}</dd>
						<dt>Sections</dt><dd>{{ sectionsLabel() }}</dd>
						<dt>Total Tracks</dt><dd>{{ state().inspection?.tracks?.length ?? 'n/a' }}</dd>
					</dl>
				</section>

				<section class="card">
					<h2>Combined Summary</h2>
					@if (state().normalizationPreview; as preview) {
						<dl class="summary-list compact">
							<dt>Selected Tracks</dt><dd>{{ state().selectedTracks.length }}</dd>
							<dt>Combined Hits</dt><dd>{{ formatNumber(preview.hitCount) }}</dd>
							<dt>Duplicates Removed</dt><dd>{{ duplicateLabel() }}</dd>
							<dt>Unknowns</dt><dd>{{ unknownCount() }}</dd>
							<dt>Warnings</dt><dd>{{ warningCount() }} issues</dd>
						</dl>
					} @else {
						<p>{{ state().status === 'normalizing' ? 'Building normalized preview…' : 'Waiting for normalized preview…' }}</p>
					}
				</section>

				<section class="card piece-summary-card">
					<h2>Piece Summary Preview</h2>
					<div class="piece-summary">
						@for (piece of pieceEntries(); track piece.label) {
							<div><strong>{{ piece.label }}</strong><span>{{ formatNumber(piece.count) }}</span></div>
						}
					</div>
				</section>
			</div>

			<section class="card table-card">
				<div class="split-row"><div><h2>Track Candidates</h2><p>Select one or more complementary drum tracks.</p></div><span>{{ selectedTrackCountLabel() }}</span></div>
				<table>
					<thead><tr><th><span class="sr-only">Selected</span></th><th>Track</th><th>Name</th><th>Notes</th><th>Confidence</th><th>Status</th></tr></thead>
					<tbody>
						@for (track of trackRows(); track track.index) {
							<tr [class.selected-row]="isSelected(track.index)">
								<td><input type="checkbox" [checked]="isSelected(track.index)" (change)="toggleTrack(track.index)" /></td>
								<td>{{ track.index }}</td>
								<td>{{ track.name || 'Untitled' }}</td>
								<td>{{ noteCountLabel(track.noteCount) }}</td>
								<td><span class="pill" [class.success]="track.strength === 'strong'" [class.warning]="track.strength === 'weak'">{{ confidenceLabel(track.strength) }}</span></td>
								<td>{{ trackStatus(track.index, track.strength) }}</td>
							</tr>
						}
					</tbody>
				</table>
			</section>

			<section class="card accordion-card" [class.open]="mappingOpen()">
				<div class="accordion-header">
					<div><h2>Mapping Review</h2><p>{{ mappingSummary() }}</p></div>
					<button class="button secondary small" type="button" (click)="toggleMappingReview()">{{ mappingActionLabel() }}</button>
				</div>
				@if (mappingOpen()) {
					<table class="mapping-table">
						<thead><tr><th>Source Kind</th><th>Source Value</th><th>Detected Meaning</th><th>Current Mapping</th><th>Override</th><th>Status</th></tr></thead>
						<tbody>
							@for (row of mappingRows(); track row.key) {
								<tr>
									<td>{{ row.sourceKind.toUpperCase() }}</td>
									<td>{{ mappingSourceValue(row) }}</td>
									<td>{{ row.automaticPiece ?? 'Unknown' }}</td>
									<td>{{ row.automaticPiece ?? 'Unmapped' }}</td>
									<td><select [ngModel]="overrideLabel(row.key)" (ngModelChange)="setOverride(row, $event)"><option value="">Keep Current</option><option value="ignore">Ignore</option>@for (piece of pieces; track piece) { <option [value]="piece">Map to {{ pieceLabel(piece) }}</option> }</select></td>
									<td>{{ row.status }}</td>
								</tr>
							}
						</tbody>
					</table>
					<div class="mapping-details-grid">
						<section class="mini-card"><h3>Active Overrides Summary</h3><p>{{ overrideCount() }} total overrides · {{ ignoredCount() }} ignored sources · {{ unknownCount() }} unknown sources</p></section>
						<section class="mini-card profile-card"><h3>Profile Actions (Local Only)</h3><p>{{ profileStatus() }}</p><button class="button secondary small" type="button" (click)="saveProfileFromCurrent()">Save as Profile</button><button class="button secondary small" type="button" (click)="applyFirstProfile()">Apply Profile</button></section>
					</div>
				}
			</section>

			<section class="card accordion-card" [class.open]="issuesOpen()">
				<div class="accordion-header" (click)="issuesForcedOpen = !issuesForcedOpen">
					<h2>Issues & Warnings</h2>
					<p>{{ warningCount() }} warnings · {{ issueCount() }} issues · {{ issueCount() === 0 ? 'All good!' : 'Review recommended' }}</p>
				</div>
				@if (issuesOpen()) {
					<ul class="issues-list">
						@for (issue of reviewIssues(); track issue.code + issue.message) {
							<li><strong>{{ issue.severity }} · {{ issue.code }}</strong><span>{{ issue.message }}</span>@if (isMappingIssue(issue)) { <button class="button ghost small" type="button" (click)="mappingUserOpen = true">Review in Mapping Review</button> }</li>
						}
					</ul>
				}
			</section>

			@if (jsonOpen) {
				<section class="card json-card"><h2>Advanced JSON</h2><pre>{{ analysisJson() }}</pre></section>
			}

			<div class="source-review-actions">
				<a class="button ghost" routerLink="/projects/details">Back to Project Details</a>
				<button class="button primary" type="button" [disabled]="!canContinue()" (click)="continueToGenerate()">Continue to Generate</button>
			</div>
		}
	`,
	styles: [
		`
		.source-review-header, .selected-source-card, .accordion-header, .source-review-actions { align-items: center; display: flex; gap: var(--space-4); justify-content: space-between; }
		.source-review-header { margin-bottom: var(--space-5); }
		.source-review-header h1 { font-size: 2rem; margin: 0 0 var(--space-2); }
		.source-review-header p, .selected-source-copy p, .accordion-header p { color: var(--color-muted); margin: 0; }
		.review-status { border: 1px solid rgba(101,222,119,0.35); border-radius: 999px; color: var(--color-success); padding: .45rem .75rem; }
		.review-status.attention { border-color: rgba(246,180,80,.35); color: var(--color-warning); }
		.review-status.failed { border-color: rgba(255,107,122,.35); color: var(--color-danger); }
		.selected-source-card { margin-bottom: var(--space-4); }
		.file-icon { align-items: center; background: rgba(151,83,229,.24); border: 1px solid rgba(151,83,229,.36); border-radius: .85rem; color: var(--color-accent-soft); display: grid; font-weight: 900; height: 4rem; justify-items: center; width: 4rem; }
		.selected-source-copy { flex: 1; min-width: 0; }
		.selected-source-copy h2 { margin: 0 0 .2rem; }
		.selected-source-card dl { display: grid; gap: .25rem 1rem; grid-template-columns: auto auto; }
		.selected-source-card dt { color: var(--color-muted); font-size: .75rem; font-weight: 900; text-transform: uppercase; }
		.selected-source-card dd { margin: 0; }
		.source-actions { display: flex; flex-wrap: wrap; gap: var(--space-2); }
		.summary-grid { display: grid; gap: var(--space-4); grid-template-columns: 1fr 1fr 1.35fr; margin-bottom: var(--space-4); }
		.piece-summary { display: grid; gap: var(--space-2); grid-template-columns: repeat(7, minmax(0, 1fr)); }
		.piece-summary div { border-left: 1px solid var(--color-border); display: grid; gap: .35rem; justify-items: center; padding: .35rem; text-align: center; }
		.piece-summary span { color: var(--color-text-soft); }
		.table-card, .accordion-card { margin-bottom: var(--space-4); }
		.accordion-card.open { border-color: rgba(166,108,255,.35); }
		.mapping-table select { max-width: 14rem; }
		.mapping-details-grid { display: grid; gap: var(--space-3); grid-template-columns: 1fr 1fr; margin-top: var(--space-3); }
		.profile-card { display: flex; flex-wrap: wrap; gap: var(--space-2); justify-content: space-between; }
		.issues-list { display: grid; gap: var(--space-2); list-style: none; margin: var(--space-3) 0 0; padding: 0; }
		.issues-list li { align-items: center; border: 1px solid var(--color-border); border-radius: var(--radius-md); display: grid; gap: var(--space-2); grid-template-columns: minmax(10rem, .4fr) 1fr auto; padding: var(--space-3); }
		.json-card pre { max-height: 24rem; overflow: auto; white-space: pre-wrap; }
		.source-review-actions { margin-top: var(--space-5); }
		@media (max-width: 1180px) { .summary-grid { grid-template-columns: 1fr; } .piece-summary { grid-template-columns: repeat(2, 1fr); } .selected-source-card, .source-review-header, .source-review-actions { align-items: stretch; flex-direction: column; } }
	`,
	],
})
export class SourceReviewPageComponent implements OnInit {
	private readonly bridge = inject(DesktopBridgeService);
	private readonly generateState = inject(DesktopGenerateStateService);
	readonly orchestrator = inject(SourceReviewOrchestratorService);
	private readonly router = inject(Router);

	readonly state = this.generateState.state;
	readonly status = this.orchestrator.status;
	readonly pieces = PIECES;
	mappingUserOpen = false;
	issuesForcedOpen = false;
	jsonOpen = false;
	profiles: MappingOverrideProfile[] = [];
	applyMode: MappingProfileApplyMode = "merge";

	readonly sectionsLabel = computed(() =>
		sourceSectionsLabel(this.state().inspection),
	);

	async ngOnInit(): Promise<void> {
		void this.loadProfiles();
		await this.orchestrator.reviewCurrentSource();
	}

	statusLabel(): string {
		switch (this.status()) {
			case "analyzing":
				return "Analyzing source…";
			case "updating":
				return "Updating preview…";
			case "attention":
				return "Review needs attention";
			case "failed":
				return "Source review failed";
			case "up-to-date":
				return "Source review up to date";
			default:
				return this.state().sourcePath ? "Ready to review" : "Source required";
		}
	}

	async refreshAnalysis(): Promise<void> {
		this.generateState.setAnalysisCache(undefined);
		await this.orchestrator.reviewCurrentSource();
	}

	async toggleTrack(trackIndex: number): Promise<void> {
		await this.orchestrator.toggleTrack(trackIndex);
	}

	isSelected(trackIndex: number): boolean {
		return this.state().selectedTracks.includes(trackIndex);
	}

	noteCountLabel(noteCount: number | null | undefined): string {
		return formatTrackNoteCount(noteCount);
	}

	confidenceLabel(value: string): string {
		return value === "unknown"
			? "N/A"
			: value.charAt(0).toUpperCase() + value.slice(1);
	}

	trackStatus(trackIndex: number, strength: string): string {
		if (this.isSelected(trackIndex))
			return this.state().selectedTracks.length === 1
				? "Auto-selected"
				: "Selected";
		return strength === "weak" ? "Low confidence" : "Available";
	}

	mappingRows(): MappingRow[] {
		return buildMappingRows(
			this.state().normalizationPreview?.mappingCandidates,
			this.state().mappingOverrides,
		);
	}

	trackRows(): TrackCandidate[] {
		const selected = new Set(this.state().selectedTracks);
		return [...(this.state().inspection?.tracks ?? [])].sort((left, right) => {
			const leftSelected = selected.has(left.index) ? 0 : 1;
			const rightSelected = selected.has(right.index) ? 0 : 1;
			return leftSelected - rightSelected || left.index - right.index;
		});
	}

	selectedTrackCountLabel(): string {
		const count = this.state().selectedTracks.length;
		return count === 1 ? "1 track selected" : `${count} tracks selected`;
	}

	mappingNeedsAttention(): boolean {
		return shouldExpandMappingReview({
			normalizationPreview: this.state().normalizationPreview,
			overrides: this.state().mappingOverrides,
		});
	}

	mappingOpen(): boolean {
		return this.mappingNeedsAttention() || this.mappingUserOpen;
	}

	toggleMappingReview(): void {
		if (this.mappingOpen() && !this.mappingNeedsAttention()) {
			this.mappingUserOpen = false;
			return;
		}
		this.mappingUserOpen = true;
	}

	mappingActionLabel(): string {
		return this.mappingOpen() && !this.mappingNeedsAttention()
			? "Hide Mapping"
			: "Review Mapping";
	}

	issuesOpen(): boolean {
		return this.issuesForcedOpen || this.reviewIssues().length > 0;
	}

	mappingSummary(): string {
		const rows = this.mappingRows();
		const unknown = rows.filter(
			(row) => row.automaticPiece === "unknown" || !row.automaticPiece,
		).length;
		const overrides = this.overrideCount();
		return `${rows.length - unknown} mapped sources · ${unknown} unknown · ${overrides} overrides · Profile: None`;
	}

	overrideLabel(key: string): string {
		const override = this.state().mappingOverrides[key];
		if (!override) return "";
		return override.target.kind === "ignore" ? "ignore" : override.target.piece;
	}

	async setOverride(row: MappingRow, value: string): Promise<void> {
		const current = { ...this.state().mappingOverrides };
		if (!value) {
			delete current[row.key];
			this.generateState.setMappingOverrides(current);
			await this.orchestrator.mappingChanged();
			return;
		}
		current[row.key] =
			value === "ignore"
				? {
						sourceKind: row.sourceKind,
						key: row.key,
						target: { kind: "ignore" as const },
					}
				: {
						sourceKind: row.sourceKind,
						key: row.key,
						target: {
							kind: "piece" as const,
							piece: value as (typeof PIECES)[number],
						},
					};
		this.generateState.setMappingOverrides(current as ProjectMappingOverrides);
		await this.orchestrator.mappingChanged();
	}

	async loadProfiles(): Promise<void> {
		const result = await this.bridge.readMappingProfiles();
		if (result.ok) this.profiles = result.data;
	}

	async saveProfileFromCurrent(): Promise<void> {
		const name = window.prompt("Profile name", "Source Review Profile")?.trim();
		if (!name) return;
		const now = new Date().toISOString();
		const result = await this.bridge.saveMappingProfile({
			id: crypto.randomUUID(),
			name,
			overrides: { ...this.state().mappingOverrides },
			createdAt: now,
			updatedAt: now,
		});
		if (result.ok) this.profiles = result.data;
	}

	async applyFirstProfile(): Promise<void> {
		const profile = this.profiles[0];
		if (!profile) return;
		const result = applyMappingProfile({
			projectOverrides: this.state().mappingOverrides,
			profileOverrides: profile.overrides,
			mode: this.applyMode,
		});
		this.generateState.setMappingOverrides(result.overrides);
		this.mappingUserOpen = true;
		await this.orchestrator.mappingChanged();
	}

	profileStatus(): string {
		return this.profiles.length === 0
			? "No profile applied"
			: `${this.profiles.length} local profiles available`;
	}
	overrideCount(): number {
		return Object.keys(this.state().mappingOverrides).length;
	}
	ignoredCount(): number {
		return Object.values(this.state().mappingOverrides).filter(
			(override) => override.target.kind === "ignore",
		).length;
	}
	warningCount(): number {
		return this.reviewIssues().filter((issue) => issue.severity === "warning")
			.length;
	}
	issueCount(): number {
		return this.reviewIssues().length;
	}
	unknownCount(): number {
		return this.mappingRows().filter(
			(row) => row.automaticPiece === "unknown" || !row.automaticPiece,
		).length;
	}

	mappingSourceValue(row: MappingRow): string {
		const value = row.label ?? row.sourceValue;
		return row.sourceKind === "gpif" && /^MIDI\s+\d+/i.test(value)
			? `GPIF articulation (${value})`
			: value;
	}

	isMappingIssue(issue: ProjectIssue): boolean {
		return /unknown|unmapped|mapping/i.test(issue.code) ||
			Boolean(issue.details?.["notes"] || issue.details?.["unknownArticulations"]);
	}

	reviewIssues(): ProjectIssue[] {
		return [
			...(this.state().inspection?.issues ?? []),
			...(this.state().normalizationPreview?.issues ?? []),
			...(this.state().normalizationPreview?.mergeSummary?.issues ?? []),
		];
	}

	duplicateLabel(): string {
		const summary = this.state().normalizationPreview?.mergeSummary;
		if (!summary) return "0";
		const percent =
			summary.inputHitCount > 0
				? (summary.duplicateHitCount / summary.inputHitCount) * 100
				: 0;
		return `${this.formatNumber(summary.duplicateHitCount)} (${percent.toFixed(1)}%)`;
	}

	pieceEntries(): Array<{ label: string; count: number }> {
		const summary = this.state().normalizationPreview?.pieceSummary ?? {};
		return [
			["kick", "Kick"],
			["snare", "Snare"],
			["hihat_closed", "Hi-Hat Closed"],
			["hihat_open", "Hi-Hat Open"],
			["crash", "Crash"],
			["ride", "Ride"],
			["toms", "Toms"],
		].map(([key, label]) => ({
			label,
			count:
				key === "toms"
					? (summary["tom_high"] ?? 0) +
						(summary["tom_mid"] ?? 0) +
						(summary["tom_floor"] ?? 0)
					: (summary[key] ?? 0),
		}));
	}

	pieceLabel(piece: string): string {
		return piece
			.replace(/_/g, " ")
			.replace(/\b\w/g, (char) => char.toUpperCase());
	}
	formatNumber(value: number): string {
		return new Intl.NumberFormat().format(value);
	}
	fileName(filePath: string | undefined): string {
		return filePath?.split(/[\\/]/).pop() ?? "";
	}
	sourceKindLabel(): string {
		return this.state().sourceKind === "gpif"
			? "Guitar Pro"
			: this.state().sourceKind === "midi"
				? "MIDI"
				: "Unknown";
	}
	analyzedAt(): string {
		const value =
			this.state().analysisCache?.normalizedAt ??
			this.state().analysisCache?.inspectedAt;
		return value ? new Date(value).toLocaleString() : "Not analyzed yet";
	}
	analysisJson(): string {
		return JSON.stringify(
			{
				inspection: this.state().inspection,
				normalizationPreview: this.state().normalizationPreview,
				analysis: this.state().analysisCache,
			},
			null,
			2,
		);
	}
	canContinue(): boolean {
		return Boolean(
			this.state().sourcePath &&
				this.state().selectedTracks.length > 0 &&
				this.state().normalizationPreview &&
				!this.state().errorMessage,
		);
	}
	async continueToGenerate(): Promise<void> {
		if (this.canContinue()) await this.router.navigateByUrl("/generate");
	}
}
