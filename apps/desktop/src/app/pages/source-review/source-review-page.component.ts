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
	mappingAttentionState,
	mappingReviewCounts,
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

type IssueSeverityCounts = {
	errors: number;
	warnings: number;
	info: number;
};

type DisplayIssue = ProjectIssue & {
	count: number;
};

@Component({
	selector: "chdg-source-review-page",
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule],
	template: `
		<header class="source-review-header">
			<div class="source-review-title">
				<h1>Source Review</h1>
				<p>Review selected drum tracks, normalized preview, and mapping before generation.</p>
			</div>
			<span class="review-status" [class.attention]="status() === 'attention'" [class.failed]="status() === 'failed'">
				<span class="status-glyph" aria-hidden="true"></span>
				{{ statusLabel() }}
			</span>
		</header>

		@if (!state().sourcePath) {
			<section class="card message warning">
				<h2>No source selected</h2>
				<p>Choose a local .mid, .midi, or .gp source in Project Details first.</p>
				<a class="button primary" routerLink="/projects/details">Back to Project Details</a>
			</section>
		} @else {
			<section class="card selected-source-card">
				<div class="file-icon" [class.gp]="state().sourceKind === 'gpif'" [class.midi]="state().sourceKind === 'midi'">
					<span>{{ state().sourceKind === 'gpif' ? 'GP' : 'MIDI' }}</span>
				</div>
				<div class="selected-source-copy">
					<p class="eyebrow">Selected Source</p>
					<div class="source-name-row">
						<h2>{{ fileName(state().sourcePath) }}</h2>
						<span class="source-kind-chip">{{ sourceKindLabel() }}</span>
					</div>
					<p class="source-path">{{ state().sourcePath }}</p>
				</div>
				<dl class="source-meta">
					<div><dt>Source Kind</dt><dd>{{ sourceKindLabel() }}</dd></div>
					<div><dt>Last Analyzed</dt><dd>{{ analyzedAt() }}</dd></div>
				</dl>
				<div class="source-card-side">
					<div class="source-actions">
						<button class="button secondary small" type="button" (click)="refreshAnalysis()"><span aria-hidden="true">↻</span> Refresh Analysis</button>
						<button class="button secondary small" type="button" (click)="jsonOpen = !jsonOpen">View JSON</button>
					</div>
				</div>
			</section>

			@if (state().errorMessage) {
				<section class="card message danger"><h2>Source review failed</h2><p>{{ state().errorMessage }}</p></section>
			}
			@if (orchestrator.autosaveWarning()) {
				<section class="card message warning"><p>{{ orchestrator.autosaveWarning() }}</p></section>
			}

			<div class="summary-grid">
				<section class="card summary-card">
					<h2>Source Summary</h2>
					<dl class="summary-list compact icon-list">
						<div><dt><span aria-hidden="true">▧</span>Source Type</dt><dd>{{ sourceKindLabel() }}</dd></div>
						<div><dt><span aria-hidden="true">♬</span>Resolution (PPQ)</dt><dd>{{ state().inspection?.resolution ?? 'n/a' }}</dd></div>
						<div><dt><span aria-hidden="true">⌁</span>Tempo Count</dt><dd>{{ state().inspection?.tempos?.length ?? 'n/a' }}</dd></div>
						<div><dt><span aria-hidden="true">♯</span>Time Signatures</dt><dd>{{ state().inspection?.timeSignatures?.length ?? 'n/a' }}</dd></div>
						<div><dt><span aria-hidden="true">◴</span>Sections</dt><dd>{{ sectionsLabel() }}</dd></div>
						<div><dt><span aria-hidden="true">☷</span>Total Tracks</dt><dd>{{ state().inspection?.tracks?.length ?? 'n/a' }}</dd></div>
					</dl>
				</section>

				<section class="card summary-card">
					<h2>Combined Summary <span class="help-dot" aria-hidden="true">?</span></h2>
					@if (state().normalizationPreview; as preview) {
						<dl class="summary-list compact icon-list">
							<div><dt><span aria-hidden="true">☌</span>Selected Tracks</dt><dd>{{ state().selectedTracks.length }}</dd></div>
							<div><dt><span aria-hidden="true">✣</span>Combined Hits</dt><dd>{{ formatNumber(preview.hitCount) }}</dd></div>
							<div><dt><span aria-hidden="true">▤</span>Duplicates Removed</dt><dd>{{ duplicateLabel() }}</dd></div>
							<div><dt><span aria-hidden="true">?</span>Unknowns</dt><dd>{{ unknownCount() }}</dd></div>
							<div><dt class="warning-label"><span aria-hidden="true">△</span>Warnings</dt><dd>{{ warningCount() }} issues</dd></div>
						</dl>
					} @else {
						<p>{{ state().status === 'normalizing' ? 'Building normalized preview…' : 'Waiting for normalized preview…' }}</p>
					}
				</section>

				<section class="card summary-card piece-summary-card">
					<h2>Piece Summary Preview <span class="help-dot" aria-hidden="true">?</span></h2>
					<div class="piece-summary">
						@for (piece of pieceEntries(); track piece.label) {
							<div class="piece-item" [ngClass]="piece.kind">
								<span class="piece-icon" aria-hidden="true"><i></i></span>
								<strong>{{ piece.label }}</strong>
								<span>{{ formatNumber(piece.count) }}</span>
							</div>
						}
					</div>
				</section>
			</div>

			<section class="card table-card track-card">
				<div class="split-row table-header"><div><h2>Track Candidates</h2><p>Select one or more complementary drum tracks.</p></div><span class="selected-count">{{ selectedTrackCountLabel() }}</span></div>
				<div class="table-frame">
					<table>
						<thead><tr><th><span class="sr-only">Selected</span></th><th>Track</th><th>Name</th><th>Notes</th><th>Confidence</th><th>Status</th></tr></thead>
						<tbody>
							@for (track of trackRows(); track track.index) {
								<tr [class.selected-row]="isSelected(track.index)">
									<td><input type="checkbox" [checked]="isSelected(track.index)" (change)="toggleTrack(track.index)" /></td>
									<td>{{ track.index }}</td>
									<td>{{ track.name || 'Untitled' }}</td>
									<td>{{ noteCountLabel(track.noteCount) }}</td>
									<td><span class="pill confidence-pill" [class.strong]="track.strength === 'strong'" [class.weak]="track.strength === 'weak'" [class.na]="track.strength === 'unknown'">{{ confidenceLabel(track.strength) }}</span></td>
									<td><span class="status-badge" [class.auto]="isSelected(track.index)" [class.low]="track.strength === 'weak'">{{ trackStatus(track.index, track.strength) }}</span></td>
								</tr>
							}
						</tbody>
					</table>
				</div>
				<div class="track-table-footer"><span>{{ selectedTrackCountLabel() }}</span><span>{{ trackNotesSummaryLabel() }}</span></div>
			</section>

			<section class="card accordion-card mapping-card" [class.open]="mappingOpen()" [class.attention]="mappingNeedsAttention()">
				<div class="accordion-header mapping-header">
					<div class="accordion-copy">
						<div class="accordion-title-row">
							<h2>Mapping Review</h2>
							<span class="review-badge" [class.warning]="mappingNeedsAttention()"><span aria-hidden="true">{{ mappingNeedsAttention() ? '△' : mappingStatusLabel() === 'Known percussion ignored' ? 'i' : '✓' }}</span>{{ mappingStatusLabel() }}</span>
						</div>
						<p>{{ mappingSummary() }}</p>
						@if (mappingCoverageSummary()) { <p class="profile-line">{{ mappingCoverageSummary() }}</p> }
						<p class="profile-line">Profile: None</p>
					</div>
					<div class="accordion-actions">
						<button class="button secondary small" type="button" (click)="toggleMappingReview()">{{ mappingActionLabel() }}</button>
						<button class="chevron-button" type="button" (click)="toggleMappingReview()" [attr.aria-label]="mappingActionLabel()">{{ mappingOpen() ? '⌃' : '⌄' }}</button>
					</div>
				</div>
				@if (mappingOpen()) {
					<div class="table-frame mapping-frame">
						<table class="mapping-table">
							<thead><tr><th>Source Kind</th><th>Source Value</th><th>Detected Meaning</th><th>Current Mapping</th><th>Override</th><th>Status</th></tr></thead>
							<tbody>
								@for (row of mappingRows(); track row.key) {
									<tr>
										<td><span class="source-kind-mini" [class.gpif]="row.sourceKind === 'gpif'">{{ row.sourceKind.toUpperCase() }}</span></td>
										<td>{{ mappingSourceValue(row) }}</td>
										<td>{{ mappingDetectedMeaning(row) }}</td>
										<td><span class="mapping-piece-pill" [class.unmapped]="mappingCurrentMapping(row) === 'Unmapped'">{{ mappingCurrentMapping(row) }}</span></td>
										<td>
											<select [ngModel]="overrideLabel(row.key)" (ngModelChange)="setOverride(row, $event)">
												<option value="">Keep Current</option>
												<option value="ignore">Ignore</option>
												@for (piece of pieces; track piece) {
													<option [value]="piece">Map to {{ pieceLabel(piece) }}</option>
												}
											</select>
										</td>
										<td><span class="mapping-status" [class.override]="mappingStatusLabelForRow(row) === 'Override'" [class.ignore]="mappingStatusLabelForRow(row) === 'Ignore'" [class.unmapped]="mappingStatusLabelForRow(row) === 'Unmapped'">{{ mappingStatusLabelForRow(row) }}</span></td>
									</tr>
								}
							</tbody>
						</table>
					</div>
					<div class="mapping-details-grid">
						<section class="mini-card overrides-summary"><h3>Active Overrides Summary</h3><div class="override-metrics"><span><strong>{{ overrideCount() }}</strong>Total Overrides</span><span><strong>{{ changedMappingCount() }}</strong>Mappings Changed</span><span><strong>{{ ignoredCount() }}</strong>Ignored Sources</span><span><strong>{{ unknownCount() }}</strong>Unknown Sources</span></div><p>Overrides are applied during generation. They do not modify the source files.</p></section>
						<section class="mini-card profile-card"><div><h3>Profile Actions (Local Only)</h3><p>{{ profileStatus() }}</p><p class="profile-hint">Profiles are stored locally on this machine and are not synced.</p></div><div class="profile-actions"><button class="button secondary small" type="button" (click)="saveProfileFromCurrent()">Save as Profile</button><button class="button secondary small" type="button" (click)="applyFirstProfile()">Apply Profile</button></div></section>
					</div>
				}
			</section>

			<section class="card accordion-card issues-card" [class.open]="issuesOpen()" [class.attention]="issuesNeedAttention() || warningCount() > 0">
				<div class="accordion-header issues-header">
					<div class="issue-icon" aria-hidden="true">△</div>
					<div class="accordion-copy">
						<h2>Issues & Warnings</h2>
						<p>{{ issuesSummary() }}</p>
						@if (!issuesOpen() && issuePreview()) {
							<p class="issue-preview">{{ issuePreview() }}</p>
						}
					</div>
					<div class="accordion-actions">
						<button class="button secondary small" type="button" (click)="toggleIssues()">{{ issuesActionLabel() }}</button>
						<button class="chevron-button" type="button" (click)="toggleIssues()" [attr.aria-label]="issuesActionLabel()">{{ issuesOpen() ? '⌃' : '⌄' }}</button>
					</div>
				</div>
				@if (issuesOpen()) {
					<div class="issues-panel">
						<section class="issue-group warnings-group">
							<h3>Warnings</h3>
							@if (warningIssues().length === 0) { <p class="empty-group">No warnings.</p> }
							<ul class="issues-list">
								@for (issue of warningIssues(); track issue.severity + issue.code + issue.message) {
									<li [class.warning]="issue.severity === 'warning'" [class.error]="issue.severity === 'error'"><strong>{{ issueLabel(issue) }}</strong><span>{{ issue.message }}</span>@if (isMappingIssue(issue)) { <button class="button ghost small" type="button" (click)="mappingUserOpen = true">Review in Mapping Review</button> }</li>
								}
							</ul>
						</section>
						<section class="issue-group info-group">
							<h3>Unknowns / Info</h3>
							@if (infoIssues().length === 0) { <p class="empty-group">No info messages.</p> }
							<ul class="issues-list">
								@for (issue of infoIssues(); track issue.severity + issue.code + issue.message) {
									<li class="info"><strong>{{ issueLabel(issue) }}</strong><span>{{ issue.message }}</span></li>
								}
							</ul>
						</section>
					</div>
				}
			</section>

			@if (jsonOpen) {
				<section class="card json-card"><h2>Advanced JSON</h2><pre>{{ analysisJson() }}</pre></section>
			}

			<div class="source-review-actions">
				<a class="button ghost back-button" routerLink="/projects/details"><span aria-hidden="true">←</span> Back to Project Details</a>
				<button class="button primary continue-button" type="button" [disabled]="!canContinue()" (click)="continueToGenerate()">Continue to Generate <span aria-hidden="true">→</span></button>
			</div>
		}

	`,
	styles: [
		`
		:host { display: block; margin: 0 auto; max-width: 1360px; min-width: 0; width: min(100%, 1360px); }
		.source-review-header, .selected-source-card, .accordion-header, .source-review-actions { align-items: center; display: flex; gap: var(--space-4); justify-content: space-between; }
		.source-review-header { margin: 0 0 1rem; }
		.source-review-title h1 { font-size: clamp(1.7rem, 2vw, 2rem); letter-spacing: -0.03em; margin: 0 0 .35rem; }
		.source-review-title p, .selected-source-copy p, .accordion-header p { color: var(--color-text-soft); margin: 0; }
		.review-status, .review-badge { align-items: center; border-radius: 999px; display: inline-flex; font-weight: 800; gap: .45rem; white-space: nowrap; }
		.review-status { background: rgba(20, 27, 36, .58); border: 1px solid rgba(101,222,119,0.28); color: var(--color-success); font-size: .85rem; padding: .5rem .8rem; }
		.review-status .status-glyph { background: var(--color-success); border-radius: 999px; box-shadow: 0 0 0 4px rgba(101,222,119,.14); height: .55rem; width: .55rem; }
		.review-status.attention { border-color: rgba(246,180,80,.35); color: var(--color-warning); }
		.review-status.attention .status-glyph { background: var(--color-warning); box-shadow: 0 0 0 4px rgba(246,180,80,.14); }
		.review-status.failed { border-color: rgba(255,107,122,.35); color: var(--color-danger); }
		.review-status.failed .status-glyph { background: var(--color-danger); box-shadow: 0 0 0 4px rgba(255,107,122,.14); }

		.card { box-shadow: 0 16px 52px rgba(0,0,0,.22); }
		.selected-source-card { background: linear-gradient(180deg, rgba(24,32,43,.88), rgba(17,23,31,.86)); display: grid; grid-template-columns: 4.9rem minmax(16rem, 1fr) minmax(16rem, .7fr) auto; margin-bottom: .85rem; padding: 1.25rem; }
		.file-icon { align-items: center; background: linear-gradient(135deg, rgba(151,83,229,.35), rgba(151,83,229,.14)); border: 1px solid rgba(203,162,255,.28); border-radius: .85rem; color: var(--color-accent-soft); display: grid; font-size: .9rem; font-weight: 900; height: 4.25rem; justify-items: center; position: relative; width: 4.25rem; }
		.file-icon::before { border: 2px solid currentColor; border-radius: .25rem; content: ""; height: 2.35rem; opacity: .95; width: 1.75rem; }
		.file-icon::after { border-color: currentColor currentColor transparent transparent; border-style: solid; border-width: .45rem; content: ""; position: absolute; right: 1.12rem; top: .96rem; }
		.file-icon span { background: rgba(13,17,23,.92); border: 1px solid rgba(203,162,255,.36); border-radius: 999px; bottom: .68rem; font-size: .68rem; line-height: 1; padding: .28rem .34rem; position: absolute; }
		.file-icon.midi span { font-size: .58rem; }
		.selected-source-copy { min-width: 0; }
		.selected-source-copy .eyebrow { color: var(--color-accent-soft); font-size: .77rem; letter-spacing: .04em; margin: 0 0 .55rem; text-transform: none; }
		.source-name-row { align-items: center; display: flex; flex-wrap: wrap; gap: .6rem; }
		.source-name-row h2 { font-size: 1.18rem; letter-spacing: -.01em; margin: 0; }
		.source-kind-chip { background: rgba(151,83,229,.24); border: 1px solid rgba(151,83,229,.3); border-radius: .48rem; color: var(--color-accent-soft); font-size: .77rem; font-weight: 800; padding: .2rem .5rem; }
		.source-path { color: var(--color-muted) !important; font-size: .86rem; margin-top: .55rem !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.source-meta { display: grid; gap: 1.25rem; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0; }
		.source-meta div { display: grid; gap: .45rem; }
		.source-meta dt, .summary-list dt { color: var(--color-muted); font-size: .78rem; font-weight: 600; }
		.source-meta dd { color: var(--color-text-soft); font-size: .92rem; margin: 0; }
		.source-card-side { align-items: end; display: grid; gap: 1rem; justify-items: end; }
		.source-actions { display: flex; flex-wrap: wrap; gap: .6rem; justify-content: end; }
		.button.small { min-height: 2.35rem; padding: .48rem .75rem; }

		.summary-grid { display: grid; gap: .85rem; grid-template-columns: minmax(0, .95fr) minmax(0, .95fr) minmax(28rem, 1.45fr); margin-bottom: .85rem; }
		.summary-card { min-height: 13.4rem; padding: 1.05rem 1rem; }
		.summary-card h2, .table-card h2, .accordion-card h2 { font-size: 1rem; letter-spacing: -.01em; margin: 0; }
		.help-dot { border: 1px solid rgba(203,213,225,.42); border-radius: 999px; color: var(--color-muted); display: inline-grid; font-size: .62rem; height: .95rem; margin-left: .25rem; place-items: center; width: .95rem; }
		.summary-list { display: grid; gap: .58rem; grid-template-columns: 1fr; margin: .9rem 0 0; }
		.summary-list div { align-items: center; display: grid; gap: .75rem; grid-template-columns: minmax(9.5rem, 1fr) auto; }
		.summary-list dt { align-items: center; display: inline-flex; gap: .55rem; }
		.summary-list dt span { color: var(--color-accent-soft); display: inline-grid; font-size: 1rem; width: 1rem; }
		.summary-list dt.warning-label span { color: var(--color-warning); }
		.summary-list dd { color: var(--color-text-soft); font-size: .9rem; margin: 0; text-align: right; }
		.piece-summary-card { overflow: hidden; }
		.piece-summary { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); margin-top: 1.35rem; }
		.piece-item { align-items: center; border-left: 1px solid rgba(197,209,225,.09); display: grid; gap: .48rem; justify-items: center; min-width: 0; padding: .1rem .35rem .2rem; text-align: center; }
		.piece-item:first-child { border-left: 0; }
		.piece-icon { align-items: center; display: inline-grid; height: 2rem; justify-items: center; position: relative; width: 2.25rem; }
		.piece-icon::before, .piece-icon::after, .piece-icon i { background: linear-gradient(135deg, #c795ff, #8f51de); border: 1px solid rgba(217,190,255,.45); box-shadow: 0 0 1rem rgba(151,83,229,.26); content: ""; display: block; }
		.kick .piece-icon::before { border-radius: 50%; height: 1.55rem; width: 1.55rem; }
		.kick .piece-icon::after { background: transparent; border-left: 2px solid #a66cff; border-top: 2px solid #a66cff; box-shadow: none; height: .72rem; position: absolute; right: .18rem; top: .18rem; transform: rotate(17deg); width: .72rem; }
		.snare .piece-icon::before { border-radius: 50%; height: .65rem; width: 1.9rem; }
		.snare .piece-icon::after { border-radius: 0 0 45% 45%; height: .65rem; margin-top: -.2rem; width: 1.9rem; }
		.hihat_closed .piece-icon::before, .hihat_open .piece-icon::before, .crash .piece-icon::before, .ride .piece-icon::before { border-radius: 50%; height: .36rem; transform: rotate(-4deg); width: 1.85rem; }
		.hihat_open .piece-icon::before { transform: rotate(-12deg); }
		.crash .piece-icon::before, .ride .piece-icon::before { width: 1.7rem; }
		.hihat_closed .piece-icon::after, .hihat_open .piece-icon::after, .crash .piece-icon::after, .ride .piece-icon::after { background: rgba(166,108,255,.85); border: 0; box-shadow: none; height: .85rem; width: .08rem; }
		.toms .piece-icon { grid-template-columns: repeat(3, .6rem); width: 2.35rem; }
		.toms .piece-icon::before, .toms .piece-icon::after, .toms .piece-icon i { border-radius: .2rem; height: 1rem; width: .58rem; }
		.piece-item strong { color: var(--color-text-soft); font-size: .79rem; font-weight: 600; line-height: 1.15; min-height: 1.8rem; }
		.piece-item span:last-child { color: var(--color-text); font-size: .95rem; font-weight: 500; }

		.table-card, .accordion-card { margin-bottom: .85rem; }
		.table-card { margin-top: 0; padding: 1rem; }
		.table-header p { color: var(--color-muted); font-size: .84rem; margin: .2rem 0 0; }
		.selected-count, .track-table-footer span:first-child { color: var(--color-accent-soft); font-size: .86rem; font-weight: 800; }
		.table-frame { background: rgba(255,255,255,.025); border: 1px solid rgba(197,209,225,.09); border-radius: .55rem; margin-top: .8rem; overflow: hidden; }
		table { border-collapse: collapse; color: var(--color-text-soft); font-size: .86rem; width: 100%; }
		th, td { border-bottom: 1px solid rgba(197,209,225,.08); padding: .48rem .75rem; text-align: left; vertical-align: middle; }
		th { background: rgba(255,255,255,.035); color: var(--color-muted); font-size: .72rem; font-weight: 700; letter-spacing: .035em; text-transform: uppercase; }
		tbody tr:last-child td { border-bottom: 0; }
		tbody tr.selected-row { background: linear-gradient(90deg, rgba(151,83,229,.18), rgba(151,83,229,.08)); }
		input[type="checkbox"] { accent-color: var(--color-accent); min-width: auto; padding: 0; }
		.confidence-pill { border-radius: .35rem; font-size: .75rem; padding: .18rem .55rem; }
		.confidence-pill.strong { background: rgba(101,222,119,.16); border-color: rgba(101,222,119,.16); color: #65de77; }
		.confidence-pill.medium { background: rgba(246,180,80,.18); border-color: rgba(246,180,80,.18); color: var(--color-warning); }
		.confidence-pill.weak { background: rgba(246,180,80,.12); border-color: rgba(246,180,80,.12); color: #c8a35c; }
		.confidence-pill.na { background: rgba(148,163,184,.11); border-color: rgba(148,163,184,.12); color: var(--color-muted); }
		.status-badge, .mapping-status, .mapping-piece-pill { border-radius: .38rem; display: inline-flex; font-size: .76rem; font-weight: 800; padding: .18rem .55rem; }
		.status-badge { color: var(--color-text-soft); }
		.status-badge.auto { background: rgba(151,83,229,.19); border: 1px solid rgba(151,83,229,.32); color: var(--color-accent-soft); }
		.status-badge.low { color: var(--color-warning); }
		.track-table-footer { align-items: center; display: flex; justify-content: space-between; padding-top: .65rem; }
		.track-table-footer span:last-child { color: var(--color-text-soft); font-size: .86rem; }

		.accordion-card { padding: .9rem 1rem; }
		.accordion-card.open { border-color: rgba(166,108,255,.30); }
		.accordion-card.attention { border-color: rgba(246,180,80,.22); }
		.accordion-header { min-height: 2.6rem; }
		.accordion-copy { min-width: 0; }
		.accordion-title-row { align-items: center; display: flex; flex-wrap: wrap; gap: 1rem; }
		.accordion-copy p { color: var(--color-text-soft); font-size: .86rem; margin-top: .25rem; }
		.profile-line { color: var(--color-muted) !important; margin-top: .05rem !important; }
		.review-badge { color: var(--color-success); font-size: .82rem; }
		.review-badge > span { border: 1px solid currentColor; border-radius: 999px; display: inline-grid; height: 1.18rem; place-items: center; width: 1.18rem; }
		.review-badge.warning { color: var(--color-warning); }
		.accordion-actions { align-items: center; display: flex; gap: .7rem; }
		.chevron-button { background: transparent; border: 0; color: var(--color-text-soft); min-height: 2rem; min-width: 2rem; padding: .2rem; }
		.mapping-frame { margin-top: .85rem; }
		.mapping-table select { max-width: 15rem; min-height: 2.15rem; min-width: 11rem; padding: .35rem .65rem; width: 100%; }
		.source-kind-mini { align-items: center; display: inline-flex; gap: .35rem; font-weight: 800; }
		.source-kind-mini::before { color: var(--color-accent-soft); content: "♪"; font-size: 1.05rem; }
		.source-kind-mini.gpif::before { border: 1px solid var(--color-accent-soft); border-radius: 999px; content: "GP"; font-size: .52rem; padding: .12rem .18rem; }
		.mapping-piece-pill { background: rgba(151,83,229,.13); border: 1px solid rgba(151,83,229,.28); color: var(--color-accent-soft); }
		.mapping-piece-pill.unmapped { color: var(--color-muted); }
		.mapping-status { background: rgba(148,163,184,.1); color: var(--color-text-soft); }
		.mapping-status.override { background: rgba(101,222,119,.13); color: var(--color-success); }
		.mapping-status.ignore { background: rgba(148,163,184,.12); color: var(--color-text-soft); }
		.mapping-status.unmapped { background: rgba(246,180,80,.13); color: var(--color-warning); }
		.mapping-details-grid { display: grid; gap: .85rem; grid-template-columns: 1fr 1fr; margin-top: .85rem; }
		.mini-card h3 { font-size: .95rem; margin: 0 0 .75rem; }
		.override-metrics { display: grid; gap: .55rem; grid-template-columns: repeat(4, minmax(0, 1fr)); }
		.override-metrics span { background: rgba(255,255,255,.035); border: 1px solid rgba(197,209,225,.09); border-radius: .5rem; color: var(--color-muted); display: grid; font-size: .74rem; gap: .15rem; padding: .55rem; text-align: center; }
		.override-metrics strong { color: var(--color-text); font-size: 1.15rem; }
		.overrides-summary p, .profile-card p { font-size: .82rem; margin: .65rem 0 0; }
		.profile-card { display: grid; gap: .75rem; grid-template-columns: 1fr auto; }
		.profile-actions { align-content: center; display: grid; gap: .55rem; }
		.profile-hint { color: var(--color-muted) !important; }

		.issues-header { justify-content: start; }
		.issue-icon { color: var(--color-warning); font-size: 1.05rem; margin-right: .25rem; }
		.issues-header .accordion-actions { margin-left: auto; }
		.issue-preview { color: var(--color-text-soft); font-size: .84rem; margin-top: .32rem !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.issues-panel { display: grid; gap: .85rem; grid-template-columns: 1fr 1fr; margin-top: .75rem; max-height: 13.5rem; overflow-y: auto; padding-right: .35rem; }
		.issue-group { background: rgba(255,255,255,.025); border: 1px solid rgba(197,209,225,.08); border-radius: .58rem; min-width: 0; padding: .75rem; }
		.issue-group h3 { font-size: .88rem; margin: 0 0 .55rem; }
		.empty-group { color: var(--color-muted); font-size: .82rem; margin: 0; }
		.issues-list { display: grid; gap: .45rem; list-style: none; margin: 0; padding: 0; }
		.issues-list li { align-items: center; background: rgba(255,255,255,.025); border: 1px solid rgba(197,209,225,.08); border-radius: .45rem; display: grid; gap: .55rem; grid-template-columns: minmax(8rem, .35fr) 1fr auto; padding: .48rem .55rem; }
		.issues-list li strong { color: var(--color-warning); font-size: .76rem; text-transform: capitalize; }
		.issues-list li span { color: var(--color-text-soft); font-size: .8rem; }
		.issues-list li.info { opacity: .8; }
		.issues-list li.info strong { color: var(--color-accent-soft); }
		.issues-list li.warning { border-color: rgba(246,180,80,.23); }
		.issues-list li.error { border-color: rgba(255,107,122,.32); }

		.json-card pre { max-height: 24rem; overflow: auto; white-space: pre-wrap; }
		.source-review-actions { margin-top: 1.35rem; }
		.back-button { min-width: 16rem; }
		.continue-button { min-width: 24rem; }
		.sr-only { clip: rect(0,0,0,0); border: 0; height: 1px; margin: -1px; overflow: hidden; padding: 0; position: absolute; width: 1px; }
		@media (max-width: 1420px) { :host { max-width: none; width: 100%; } .selected-source-card { grid-template-columns: 4.9rem minmax(14rem, 1fr) minmax(13rem, .65fr); } .source-card-side { grid-column: 2 / -1; grid-template-columns: 1fr auto; align-items: center; } }
		@media (max-width: 1180px) { .summary-grid, .mapping-details-grid, .issues-panel { grid-template-columns: 1fr; } .summary-grid { grid-template-columns: 1fr; } .piece-summary { grid-template-columns: repeat(4, minmax(0, 1fr)); } .selected-source-card { grid-template-columns: 4.9rem minmax(0, 1fr); } .source-meta, .source-card-side { grid-column: 2; grid-template-columns: 1fr; justify-items: start; } .source-actions { justify-content: start; } }
		@media (max-width: 760px) { .source-review-header, .source-review-actions, .accordion-header { align-items: stretch; flex-direction: column; } .piece-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); } .continue-button, .back-button { min-width: 0; width: 100%; } .profile-card { grid-template-columns: 1fr; } }

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
	issuesUserOpen = false;
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
		if (this.isSelected(trackIndex)) {
			return this.state().selectedTracks.length === 1 ? "Auto-selected" : "Selected";
		}
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

	issuesNeedAttention(): boolean {
		return this.reviewIssues().some((issue) => issue.severity === "error");
	}

	issuesOpen(): boolean {
		return this.issuesNeedAttention() || this.issuesUserOpen;
	}

	toggleIssues(): void {
		if (this.issuesOpen() && !this.issuesNeedAttention()) {
			this.issuesUserOpen = false;
			return;
		}
		this.issuesUserOpen = true;
	}

	issuesActionLabel(): string {
		return this.issuesOpen() && !this.issuesNeedAttention()
			? "Hide Details"
			: "Review Issues";
	}

	mappingSummary(): string {
		const coverage = this.state().normalizationPreview?.mappingCoverage;
		const overrides = this.overrideCount();
		const pending = this.mappingReviewCounts();
		const pendingLabel =
			pending.unresolvedCandidates > 0 || pending.unresolvedUnknown > 0
				? ` · Pending review: ${this.formatNumber(pending.unresolvedCandidates)} candidates · ${this.formatNumber(pending.unresolvedUnknown)} unknown`
				: "";
		if (coverage) {
			return `Mapped events ${this.formatNumber(coverage.mappedEventCount)} · Candidate events ${this.formatNumber(coverage.candidateEventCount)} · Ignored known events ${this.formatNumber(coverage.ignoredEventCount)} · Unknown events ${this.formatNumber(coverage.unknownEventCount)} · ${overrides} overrides${pendingLabel}`;
		}
		const rows = this.mappingRows();
		const unknown = this.unknownCount();
		return `${rows.length - unknown} mapped sources · ${unknown} unknown · ${overrides} overrides${pendingLabel}`;
	}

	mappingCoverageSummary(): string | undefined {
		const coverage = this.state().normalizationPreview?.mappingCoverage;
		if (!coverage) return undefined;
		return `Atlas ${coverage.atlasVersion} · Sources: ${coverage.mappedSourceCount} mapped, ${coverage.candidateSourceCount} candidates, ${coverage.ignoredSourceCount} ignored known, ${coverage.unknownSourceCount} unknown`;
	}

	mappingStatusLabel(): string {
		switch (this.mappingAttentionState()) {
			case "manual-mapping-needed":
				return "Manual mapping needed";
			case "review-recommended":
				return "Review recommended";
			case "known-percussion-ignored":
				return "Known percussion ignored";
			default:
				return "Automatic mapping ready";
		}
	}

	mappingDetectedMeaning(row: MappingRow): string {
		if (row.action === "candidate") return row.suggestedPiece ? `${this.pieceLabel(row.suggestedPiece)} candidate` : "Candidate";
		if (row.action === "ignore") return row.label ?? "Known ignored percussion";
		if (!row.automaticPiece || row.automaticPiece === "unknown") return "Unknown";
		return this.pieceLabel(row.automaticPiece);
	}

	mappingCurrentMapping(row: MappingRow): string {
		const override = this.state().mappingOverrides[row.key];
		if (override?.target.kind === "ignore") return "Ignored";
		if (override?.target.kind === "piece") return this.pieceLabel(override.target.piece);
		if (row.action === "candidate") return row.suggestedPiece ? `Review: ${this.pieceLabel(row.suggestedPiece)}` : "Review candidate";
		if (row.action === "ignore") return "Ignored known";
		if (!row.automaticPiece || row.automaticPiece === "unknown") return "Unmapped";
		return this.pieceLabel(row.automaticPiece);
	}

	mappingStatusLabelForRow(row: MappingRow): string {
		const override = this.state().mappingOverrides[row.key];
		if (override?.target.kind === "ignore") return "Ignore";
		if (override?.target.kind === "piece") return "Override";
		if (row.action === "candidate") return "Candidate";
		if (row.action === "ignore") return "Ignore";
		if (!row.automaticPiece || row.automaticPiece === "unknown") return "Unmapped";
		return "Default";
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
	changedMappingCount(): number {
		return Object.values(this.state().mappingOverrides).filter(
			(override) => override.target.kind === "piece",
		).length;
	}
	warningCount(): number {
		return this.issueSeverityCounts().warnings;
	}
	issueCount(): number {
		return this.reviewIssues().length;
	}
	issueSeverityCounts(): IssueSeverityCounts {
		return this.reviewIssues().reduce(
			(counts, issue) => {
				if (issue.severity === "error") counts.errors += 1;
				else if (issue.severity === "warning") counts.warnings += 1;
				else counts.info += 1;
				return counts;
			},
			{ errors: 0, warnings: 0, info: 0 },
		);
	}
	issuesSummary(): string {
		const counts = this.issueSeverityCounts();
		if (this.issueCount() === 0) return "0 warnings · 0 issues · All good";
		const parts = [
			counts.errors > 0
				? `${counts.errors} ${counts.errors === 1 ? "error" : "errors"}`
				: undefined,
			counts.warnings > 0
				? `${counts.warnings} ${counts.warnings === 1 ? "warning" : "warnings"}`
				: undefined,
			counts.info > 0
				? `${counts.info} ${counts.info === 1 ? "info message" : "info messages"}`
				: undefined,
		].filter((part): part is string => Boolean(part));
		const suffix =
			counts.errors > 0 || counts.warnings > 0
				? "Review recommended"
				: "No blocking issues";
		return `${parts.join(" · ")} · ${suffix}`;
	}
	issuePreview(): string | undefined {
		const issue = this.sortedReviewIssues().find(
			(item) => item.severity === "error" || item.severity === "warning",
		);
		if (issue) return `${issue.code} — ${issue.message}`;
		const info = this.issueSeverityCounts().info;
		return info > 0 ? `No blocking issues · ${info} info messages` : undefined;
	}
	mappingReviewCounts(): ReturnType<typeof mappingReviewCounts> {
		return mappingReviewCounts({
			rows: this.mappingRows(),
			overrides: this.state().mappingOverrides,
		});
	}

	mappingAttentionState(): ReturnType<typeof mappingAttentionState> {
		return mappingAttentionState({
			rows: this.mappingRows(),
			overrides: this.state().mappingOverrides,
		});
	}

	unknownCount(): number {
		return this.mappingReviewCounts().unknown;
	}
	candidateCount(): number {
		return this.mappingReviewCounts().candidates;
	}
	ignoredKnownCount(): number {
		return this.mappingReviewCounts().ignoredKnown;
	}

	mappingSourceValue(row: MappingRow): string {
		const value = row.label ?? row.sourceValue;
		return row.sourceKind === "gpif" && /^MIDI\s+\d+/i.test(value)
			? `GPIF articulation (${value})`
			: value;
	}

	isMappingIssue(issue: ProjectIssue): boolean {
		if (issue.severity === "info") return false;
		return (
			/unknown|unmapped|mapping/i.test(issue.code) ||
			/(unknown|unmapped|mapping|articulation|rimshot|side[- ]?stick|midi note|note \d+)/i.test(
				issue.message,
			) ||
			Boolean(
				issue.details?.["notes"] || issue.details?.["unknownArticulations"],
			)
		);
	}

	displayIssues(): DisplayIssue[] {
		const grouped = new Map<string, DisplayIssue>();
		for (const issue of this.sortedReviewIssues()) {
			const key = this.issueGroupKey(issue);
			const existing = grouped.get(key);
			if (existing) {
				existing.count += 1;
			} else {
				grouped.set(key, { ...issue, count: 1 });
			}
		}
		return Array.from(grouped.values());
	}

	warningIssues(): DisplayIssue[] {
		return this.displayIssues().filter((issue) => issue.severity !== "info");
	}

	infoIssues(): DisplayIssue[] {
		return this.displayIssues().filter((issue) => issue.severity === "info");
	}

	issueLabel(issue: DisplayIssue): string {
		const base = `${issue.severity} · ${issue.code}`;
		return issue.count > 1 ? `${base} · ${issue.count} similar` : base;
	}

	sortedReviewIssues(): ProjectIssue[] {
		const severityRank: Record<ProjectIssue["severity"], number> = {
			error: 0,
			warning: 1,
			info: 2,
		};
		return [...this.reviewIssues()].sort(
			(left, right) =>
				severityRank[left.severity] - severityRank[right.severity] ||
				left.code.localeCompare(right.code) ||
				left.message.localeCompare(right.message),
		);
	}

	issueGroupKey(issue: ProjectIssue): string {
		if (issue.severity !== "info")
			return `${issue.severity}:${issue.code}:${issue.message}`;
		return `${issue.severity}:${issue.code}:${issue.message.replace(/\d+/g, "#")}`;
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

	pieceEntries(): Array<{ kind: string; label: string; count: number }> {
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
			kind: key,
			label,
			count:
				key === "toms"
					? (summary["tom_high"] ?? 0) +
						(summary["tom_mid"] ?? 0) +
						(summary["tom_floor"] ?? 0)
					: (summary[key] ?? 0),
		}));
	}

	trackNotesSummaryLabel(): string {
		let knownTotal = 0;
		let knownCount = 0;
		let unknownCount = 0;
		for (const track of this.trackRows()) {
			if (typeof track.noteCount === "number" && Number.isFinite(track.noteCount)) {
				knownTotal += track.noteCount;
				knownCount += 1;
			} else {
				unknownCount += 1;
			}
		}
		if (unknownCount === 0) return `Total Notes: ${this.formatNumber(knownTotal)}`;
		if (knownCount > 0) return `Known Notes: ${this.formatNumber(knownTotal)}`;
		return "Total Notes: n/a";
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
