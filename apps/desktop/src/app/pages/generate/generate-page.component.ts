import { CommonModule } from "@angular/common";
import { Component, type OnInit, computed, signal } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import type {
	GeneratePackageResult,
	ValidationItem,
	ValidationSummary,
} from "@chdg/project/browser";
import { DesktopBridgeService } from "../../services/desktop-bridge.service";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { DesktopProjectStateService } from "../../services/desktop-project-state.service";
import { DesktopValidationService } from "../../services/desktop-validation.service";

type ChecklistFilter = "all" | ValidationItem["severity"];
type ConfigRowStatus = "ok" | "warning" | "missing";

type ConfigRow = {
	icon: string;
	label: string;
	value: string;
	status: ConfigRowStatus;
	route?: string;
};

type OutputFileRow = {
	icon: string;
	name: string;
	path?: string;
};

const severityRank: Record<ValidationItem["severity"], number> = {
	error: 0,
	warning: 1,
	info: 2,
};

@Component({
	selector: "chdg-generate-page",
	standalone: true,
	imports: [CommonModule, RouterModule],
	template: `
    <header class="generate-header">
      <div>
        <h1>Generate</h1>
        <p>Validate project readiness and create the Clone Hero package.</p>
      </div>
      <div class="readiness-pill" [class.warning]="statusTone() === 'warning'" [class.danger]="statusTone() === 'danger'" [class.running]="statusTone() === 'running'">
        <span class="readiness-icon" aria-hidden="true">{{ statusIcon() }}</span>
        <span>
          <strong>{{ statusLabel() }}</strong>
          <small>{{ statusDetail() }}</small>
        </span>
      </div>
    </header>

    @if (autosaveWarning()) {
      <section class="card message warning autosave-warning">
        <h2>Autosave warning</h2>
        <p>{{ autosaveWarning() }}</p>
      </section>
    }

    <div class="generate-grid top-grid">
      <section class="card validation-report" [class.ready]="summary().canGenerate" [class.blocked]="summary().errorCount > 0">
        <h2>Validation Report</h2>
        <div class="report-body">
          <div class="report-status">
            <span class="large-status-icon" aria-hidden="true">{{ statusIcon() }}</span>
            <div>
              <strong>{{ reportLabel() }}</strong>
              <p>{{ reportMessage() }}</p>
            </div>
          </div>
          <div class="report-counts" aria-label="Validation counts">
            <div><strong>{{ summary().errorCount }}</strong><span class="danger-text">Errors</span></div>
            <div><strong>{{ summary().warningCount }}</strong><span class="warning-text">Warnings</span></div>
            <div><strong>{{ summary().infoCount }}</strong><span class="info-text">Info</span></div>
          </div>
        </div>
        <footer class="report-meta">
          <span>Checked at: <strong>{{ formatCheckedAt(summary().checkedAt) }}</strong></span>
          <span>Validator: <strong>Desktop Validator</strong></span>
          <span>Version: <strong>1.8.0</strong></span>
        </footer>
      </section>

      <section class="card config-card">
        <h2>Generation Configuration</h2>
        <div class="config-list">
          @for (row of configRows(); track row.label) {
            <div class="config-row">
              <span class="config-icon" aria-hidden="true">{{ row.icon }}</span>
              <span class="config-label">{{ row.label }}</span>
              <span class="config-value">{{ row.value }}</span>
              <span class="config-status" [class.warning]="row.status === 'warning'" [class.missing]="row.status === 'missing'" aria-hidden="true">{{ statusGlyph(row.status) }}</span>
            </div>
          }
        </div>
      </section>
    </div>

    <div class="generate-grid middle-grid">
      <section class="card checklist-card" [class.compact]="hasOnlyInfoChecks()">
        <div class="card-heading">
          <div>
            <h2>QA Checklist</h2>
            <p>Errors block generation. Warnings and info are non-blocking.</p>
          </div>
          @if (hasOnlyInfoChecks()) {
            <span class="pill success">All checks passed</span>
          }
        </div>

        @if (hasOnlyInfoChecks()) {
          <div class="empty-state small">
            <strong>All checks passed</strong>
            <span>{{ summary().infoCount }} informational checks available.</span>
          </div>
        } @else {
          <div class="check-filter" aria-label="Checklist severity filter">
            <button type="button" class="button ghost small" [class.active]="checklistFilter() === 'all'" (click)="checklistFilter.set('all')">All <span>{{ summary().items.length }}</span></button>
            <button type="button" class="button ghost small danger-filter" [class.active]="checklistFilter() === 'error'" (click)="checklistFilter.set('error')">Errors <span>{{ summary().errorCount }}</span></button>
            <button type="button" class="button ghost small warning-filter" [class.active]="checklistFilter() === 'warning'" (click)="checklistFilter.set('warning')">Warnings <span>{{ summary().warningCount }}</span></button>
            <button type="button" class="button ghost small info-filter" [class.active]="checklistFilter() === 'info'" (click)="checklistFilter.set('info')">Info <span>{{ summary().infoCount }}</span></button>
          </div>

          <div class="checklist-table" role="table" aria-label="Validation checklist">
            <div class="checklist-header" role="row">
              <span>Status</span>
              <span>Check</span>
              <span>Category</span>
              <span>Message</span>
              <span>Action</span>
            </div>
            <div class="checklist-scroll">
              @for (item of filteredChecklistItems(); track item.id + item.message) {
                <div class="checklist-row" role="row" [class.error]="item.severity === 'error'" [class.warning]="item.severity === 'warning'" [class.info]="item.severity === 'info'">
                  <span class="severity-icon" [attr.aria-label]="item.severity">{{ severityIcon(item.severity) }}</span>
                  <strong>{{ item.title }}</strong>
                  <span class="category-badge">{{ item.category }}</span>
                  <span class="check-message">{{ item.message }}</span>
                  @if (item.fixAction?.route) {
                    <a class="button ghost small" [routerLink]="item.fixAction?.route">{{ item.fixAction?.label }}</a>
                  } @else {
                    <span class="muted-action">—</span>
                  }
                </div>
              }
            </div>
          </div>
        }
      </section>

      <section class="card steps-card">
        <h2>Generation Steps</h2>
        <ol class="steps-list">
          @for (step of generationSteps; track step) {
            <li>
              <span class="step-number">{{ $index + 1 }}</span>
              <span>{{ step }}</span>
              <span class="step-state" [class.running]="generationStepState() === 'Running'" [class.completed]="generationStepState() === 'Completed'" [class.failed]="generationStepState() === 'Failed'">{{ generationStepState() }}</span>
            </li>
          }
        </ol>
      </section>
    </div>

    <div class="generate-grid lower-grid">
      <section class="card log-card">
        <div class="card-heading inline">
          <h2>Generation Log</h2>
        </div>
        @if (state().errorMessage) {
          <div class="inline-error">{{ state().errorMessage }}</div>
        }
        @if (state().logs.length === 0) {
          <div class="empty-state">
            <span aria-hidden="true">▱</span>
            <strong>No generation actions yet.</strong>
            <small>Logs will appear here when you start generation.</small>
          </div>
        } @else {
          <ul class="log-list scroll-list">
            @for (log of state().logs; track $index) {
              <li>{{ log }}</li>
            }
          </ul>
        }
      </section>

      <section class="card output-card">
        <h2>Output Files Preview</h2>
        @if (state().generationResult; as result) {
          <div class="output-list">
            @for (file of outputFileRows(result); track file.name) {
              <div class="output-row">
                <span aria-hidden="true">{{ file.icon }}</span>
                <strong>{{ file.name }}</strong>
                <span>{{ compactPath(file.path) }}</span>
                <span class="config-status" aria-hidden="true">✓</span>
              </div>
            }
          </div>
          <div class="metrics-grid">
            <div><span>Hits</span><strong>{{ result.hitCount }}</strong></div>
            <div><span>Mapped</span><strong>{{ result.mappedNoteCount }}</strong></div>
            <div><span>Deduped</span><strong>{{ result.deduplicatedCount }}</strong></div>
            <div><span>Tracks</span><strong>{{ result.selectedTracks.length }}</strong></div>
          </div>
        } @else {
          <div class="empty-state output-empty">
            <span aria-hidden="true">▭</span>
            <strong>No output files yet.</strong>
            <small>Run generation to create notes.chart, song.ini, and song.ogg.</small>
          </div>
        }
      </section>
    </div>

    <div class="generate-action-bar">
      <a class="button ghost" routerLink="/source-review">‹ Back to Source Review</a>
      <button class="button secondary" type="button" [disabled]="!canOpenOutputFolder()" (click)="openOutputFolder()">▭ Open Output Folder</button>
      <button class="button secondary" type="button" [disabled]="!canOpenPreview()" (click)="openPreview()">▷ Open Preview</button>
      <button class="button primary" type="button" [disabled]="!canStartGeneration()" (click)="generate(false)">{{ generateActionLabel() }}</button>
    </div>
  `,
	styles: [
		`
    .generate-header { align-items: flex-start; display: flex; gap: var(--space-5); justify-content: space-between; margin-bottom: var(--space-5); }
    .generate-header h1 { margin-bottom: var(--space-2); }
    .generate-header p { margin-bottom: 0; }
    .readiness-pill { align-items: center; background: rgba(20, 27, 36, 0.78); border: 1px solid rgba(101, 222, 119, 0.22); border-radius: 999px; display: inline-flex; gap: var(--space-3); min-width: 18rem; padding: 0.8rem 1rem; }
    .readiness-pill strong { color: var(--color-success); display: block; }
    .readiness-pill small { color: var(--color-muted); display: block; margin-top: 0.15rem; }
    .readiness-pill.warning { border-color: rgba(246, 180, 80, 0.34); }
    .readiness-pill.warning strong { color: var(--color-warning); }
    .readiness-pill.danger { border-color: rgba(255, 107, 122, 0.38); }
    .readiness-pill.danger strong { color: var(--color-danger); }
    .readiness-pill.running strong { color: var(--color-accent-soft); }
    .readiness-icon, .large-status-icon { align-items: center; border: 2px solid currentColor; border-radius: 999px; color: var(--color-success); display: inline-flex; font-weight: 900; justify-content: center; }
    .readiness-icon { height: 2rem; width: 2rem; }
    .large-status-icon { background: rgba(101, 222, 119, 0.12); font-size: 1.25rem; height: 3rem; width: 3rem; }
    .readiness-pill.warning .readiness-icon, .readiness-pill.warning .large-status-icon { color: var(--color-warning); }
    .readiness-pill.danger .readiness-icon, .readiness-pill.danger .large-status-icon { color: var(--color-danger); }
    .autosave-warning { margin-bottom: var(--space-5); }
    .generate-grid { display: grid; gap: var(--space-5); margin-bottom: var(--space-5); }
    .top-grid { grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr); }
    .middle-grid, .lower-grid { grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr); }
    .validation-report, .config-card, .checklist-card, .steps-card, .log-card, .output-card { min-width: 0; }
    .validation-report.ready { border-color: rgba(101, 222, 119, 0.22); }
    .validation-report.blocked { border-color: rgba(255, 107, 122, 0.34); }
    .report-body { align-items: center; display: grid; gap: var(--space-5); grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.72fr); }
    .report-status { align-items: center; display: flex; gap: var(--space-4); }
    .report-status strong { color: var(--color-success); display: block; font-size: 1.05rem; margin-bottom: var(--space-2); }
    .report-status p { margin: 0; }
    .report-counts { display: grid; grid-template-columns: repeat(3, 1fr); }
    .report-counts div { border-left: 1px solid var(--color-border); display: grid; gap: var(--space-2); justify-items: center; padding: var(--space-3); }
    .report-counts strong { font-size: 1.7rem; }
    .report-counts span { font-weight: 900; }
    .danger-text { color: var(--color-danger); }
    .warning-text { color: var(--color-warning); }
    .info-text { color: #45b5ff; }
    .report-meta { border-top: 1px solid var(--color-border); color: var(--color-muted); display: flex; flex-wrap: wrap; gap: var(--space-5); margin: var(--space-5) calc(var(--space-6) * -1) calc(var(--space-6) * -1); padding: var(--space-4) var(--space-6); }
    .report-meta strong { color: var(--color-text-soft); }
    .config-list { display: grid; }
    .config-row { align-items: center; border-top: 1px solid var(--color-border); display: grid; gap: var(--space-3); grid-template-columns: 1.25rem minmax(8rem, 0.48fr) minmax(0, 1fr) 1.5rem; min-height: 2rem; padding: 0.42rem 0; }
    .config-row:first-child { border-top: 0; }
    .config-icon { color: var(--color-accent-soft); }
    .config-label { color: var(--color-text-soft); }
    .config-value { color: var(--color-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .config-status { color: var(--color-success); font-weight: 900; text-align: right; }
    .config-status.warning { color: var(--color-warning); }
    .config-status.missing { color: var(--color-danger); }
    .card-heading { align-items: flex-start; display: flex; gap: var(--space-4); justify-content: space-between; margin-bottom: var(--space-4); }
    .card-heading h2, .card-heading p { margin-bottom: 0; }
    .card-heading.inline { align-items: center; }
    .pill.success { background: rgba(101, 222, 119, 0.16); border-color: rgba(101, 222, 119, 0.34); color: var(--color-success); }
    .check-filter { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-4); }
    .button.small { min-height: 2rem; padding: 0.35rem 0.7rem; }
    .button.active { border-color: rgba(166, 108, 255, 0.82); color: var(--color-accent-soft); }
    .danger-filter { color: var(--color-danger); }
    .warning-filter { color: var(--color-warning); }
    .info-filter { color: #45b5ff; }
    .checklist-table { overflow: hidden; }
    .checklist-header, .checklist-row { display: grid; gap: var(--space-3); grid-template-columns: 4rem minmax(9rem, 0.75fr) minmax(6rem, 0.36fr) minmax(0, 1.2fr) minmax(8rem, auto); }
    .checklist-header { border-bottom: 1px solid var(--color-border); color: var(--color-muted); font-size: 0.74rem; font-weight: 900; padding: 0 0 var(--space-3); text-transform: uppercase; }
    .checklist-scroll { max-height: 15.5rem; overflow: auto; }
    .checklist-row { align-items: center; border-bottom: 1px solid rgba(197, 209, 225, 0.08); color: var(--color-text-soft); padding: var(--space-3) 0; }
    .severity-icon { font-size: 1.1rem; }
    .checklist-row.error .severity-icon { color: var(--color-danger); }
    .checklist-row.warning .severity-icon { color: var(--color-warning); }
    .checklist-row.info .severity-icon { color: #45b5ff; }
    .category-badge { background: rgba(151, 83, 229, 0.18); border: 1px solid rgba(151, 83, 229, 0.26); border-radius: var(--radius-sm); color: var(--color-accent-soft); font-size: 0.78rem; font-weight: 800; padding: 0.2rem 0.45rem; width: fit-content; }
    .check-message { overflow-wrap: anywhere; }
    .muted-action { color: var(--color-muted); text-align: center; }
    .steps-list { display: grid; gap: var(--space-3); list-style: none; margin: 0; padding: 0; }
    .steps-list li { align-items: center; display: grid; gap: var(--space-3); grid-template-columns: 2rem 1fr auto; }
    .step-number { align-items: center; border: 1px solid var(--color-accent); border-radius: 999px; color: var(--color-accent-soft); display: inline-flex; font-weight: 900; height: 1.5rem; justify-content: center; width: 1.5rem; }
    .step-state { background: rgba(255, 255, 255, 0.04); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text-soft); font-size: 0.78rem; font-weight: 800; padding: 0.24rem 0.55rem; }
    .step-state.running { color: var(--color-accent-soft); }
    .step-state.completed { background: rgba(101, 222, 119, 0.12); border-color: rgba(101, 222, 119, 0.24); color: var(--color-success); }
    .step-state.failed { background: rgba(255, 107, 122, 0.12); border-color: rgba(255, 107, 122, 0.24); color: var(--color-danger); }
    .empty-state { align-items: center; border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-muted); display: grid; justify-items: center; min-height: 7rem; padding: var(--space-5); text-align: center; }
    .empty-state strong { color: var(--color-text-soft); }
    .empty-state small, .empty-state span { color: var(--color-muted); }
    .empty-state.small { min-height: 5rem; }
    .scroll-list { max-height: 10rem; overflow: auto; }
    .inline-error { border: 1px solid rgba(255, 107, 122, 0.35); border-radius: var(--radius-md); color: var(--color-danger); margin-bottom: var(--space-4); padding: var(--space-3); }
    .log-list li { color: var(--color-text-soft); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.86rem; }
    .output-list { display: grid; gap: var(--space-2); margin-bottom: var(--space-4); }
    .output-row { align-items: center; border-bottom: 1px solid rgba(197, 209, 225, 0.08); display: grid; gap: var(--space-3); grid-template-columns: 1.5rem minmax(7rem, 0.5fr) minmax(0, 1fr) 1.5rem; padding: var(--space-2) 0; }
    .output-row span:first-child { color: var(--color-accent-soft); }
    .output-row span:nth-child(3) { color: var(--color-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .metrics-grid { background: rgba(255, 255, 255, 0.03); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: grid; grid-template-columns: repeat(4, 1fr); padding: var(--space-3); }
    .metrics-grid div { display: grid; gap: var(--space-1, 0.25rem); justify-items: center; }
    .metrics-grid span { color: var(--color-muted); font-size: 0.78rem; }
    .metrics-grid strong { color: var(--color-text); }
    .generate-action-bar { align-items: center; background: rgba(20, 27, 36, 0.82); border: 1px solid var(--color-border); border-radius: var(--radius-lg); bottom: 0; display: grid; gap: var(--space-4); grid-template-columns: minmax(12rem, 0.8fr) minmax(12rem, 0.9fr) minmax(12rem, 0.9fr) minmax(16rem, 1.4fr); padding: var(--space-4); position: sticky; z-index: 2; }
    .generate-action-bar .button.primary { width: 100%; }
    @media (max-width: 1180px) {
      .top-grid, .middle-grid, .lower-grid { grid-template-columns: 1fr; }
      .generate-action-bar { grid-template-columns: 1fr 1fr; }
    }
  `,
	],
})
export class GeneratePageComponent implements OnInit {
	readonly state = this.generateState.state;
	readonly project = this.projectState.state;
	readonly checklistFilter = signal<ChecklistFilter>("all");
	readonly autosaveWarning = signal<string | null>(null);
	private readonly validationRun = signal(0);
	readonly summary = computed<ValidationSummary>(() => {
		this.validationRun();
		return this.validationService.validateNow();
	});

	readonly generationSteps = [
		"Parse Source",
		"Normalize Drums",
		"Merge Selected Tracks",
		"Write notes.chart",
		"Write song.ini",
		"Convert Audio to song.ogg",
		"Finalize Package",
	];

	constructor(
		private readonly bridge: DesktopBridgeService,
		private readonly generateState: DesktopGenerateStateService,
		private readonly validationService: DesktopValidationService,
		private readonly projectState: DesktopProjectStateService,
		private readonly router: Router,
	) {}

	ngOnInit(): void {
		this.runValidation();
	}

	runValidation(): ValidationSummary {
		this.validationRun.update((value) => value + 1);
		return this.summary();
	}

	filteredChecklistItems(): ValidationItem[] {
		const filter = this.checklistFilter();
		return this.sortedChecklistItems().filter(
			(item) => filter === "all" || item.severity === filter,
		);
	}

	sortedChecklistItems(): ValidationItem[] {
		return [...this.summary().items].sort(
			(a, b) => severityRank[a.severity] - severityRank[b.severity],
		);
	}

	hasOnlyInfoChecks(): boolean {
		const summary = this.summary();
		return summary.errorCount === 0 && summary.warningCount === 0;
	}

	statusLabel(): string {
		if (this.state().status === "generating") return "Generating…";
		if (this.state().generationResult) return "Generated";
		if (this.project().outputStatus === "failed") return "Failed";
		if (this.summary().errorCount > 0) return "Cannot generate yet";
		if (this.summary().warningCount > 0) return "Ready with warnings";
		return "Ready to generate";
	}

	statusDetail(): string {
		if (this.state().status === "generating") return "Package generation is running.";
		if (this.state().generationResult) {
			return `Completed: ${this.formatCheckedAt(this.state().lastGeneratedAt ?? this.summary().checkedAt)}`;
		}
		if (this.project().outputStatus === "failed") return "Generation failed. Review the log.";
		return `Last checked: ${this.formatCheckedAt(this.summary().checkedAt)}`;
	}

	statusTone(): "success" | "warning" | "danger" | "running" {
		if (this.state().status === "generating") return "running";
		if (this.state().generationResult) return "success";
		if (this.project().outputStatus === "failed") return "danger";
		if (this.summary().errorCount > 0) return "danger";
		if (this.summary().warningCount > 0) return "warning";
		return "success";
	}

	statusIcon(): string {
		switch (this.statusTone()) {
			case "danger":
				return "!";
			case "warning":
				return "!";
			case "running":
				return "…";
			default:
				return "✓";
		}
	}

	reportLabel(): string {
		return this.statusLabel() === "Generating…" ? "Ready to generate" : this.statusLabel();
	}

	reportMessage(): string {
		if (this.state().generationResult) return "Package generated successfully. Ready for preview.";
		if (this.summary().errorCount > 0) return "Fix blocking errors before generating.";
		if (this.summary().warningCount > 0) return "Warnings are present, but generation is allowed.";
		return "No blocking issues found. You can generate your Clone Hero package.";
	}

	configRows(): ConfigRow[] {
		const state = this.state();
		const metadata = state.metadata;
		const offset = state.offsetMs ?? 0;
		return [
			{
				icon: "▧",
				label: "Source File",
				value: compactPath(state.sourcePath) || "Not selected",
				status: state.sourcePath ? "ok" : "missing",
				route: "/source-review",
			},
			{
				icon: "♫",
				label: "Audio File",
				value: compactPath(state.audioPath) || "Not selected",
				status: state.audioPath ? "ok" : "missing",
				route: "/projects/details",
			},
			{
				icon: "♬",
				label: "Selected Tracks",
				value: state.selectedTracks.length
					? `${state.selectedTracks.length} track${state.selectedTracks.length === 1 ? "" : "s"}`
					: "None",
				status: state.selectedTracks.length > 0 ? "ok" : "missing",
				route: "/source-review",
			},
			{
				icon: "▭",
				label: "Output Folder",
				value: compactPath(state.outputDir) || "Not selected",
				status: state.outputDir ? "ok" : "missing",
				route: "/projects/details",
			},
			{
				icon: "◇",
				label: "Song",
				value: metadata.name || fallbackSongName(state.sourcePath),
				status: "ok",
				route: "/projects/details",
			},
			{
				icon: "♙",
				label: "Artist",
				value: metadata.artist || "Not set",
				status: metadata.artist ? "ok" : "warning",
				route: "/projects/details",
			},
			{
				icon: "▣",
				label: "Album",
				value: metadata.album || "Not set",
				status: "ok",
				route: "/projects/details",
			},
			{
				icon: "◴",
				label: "Offset",
				value: `${offset} ms`,
				status: "ok",
				route: "/projects/details",
			},
		];
	}

	statusGlyph(status: ConfigRowStatus): string {
		if (status === "missing") return "×";
		if (status === "warning") return "⚠";
		return "✓";
	}

	severityIcon(severity: ValidationItem["severity"]): string {
		if (severity === "error") return "⚠";
		if (severity === "warning") return "⚠";
		return "ⓘ";
	}

	generationStepState(): "Pending" | "Running" | "Completed" | "Failed" {
		if (this.state().status === "generating") return "Running";
		if (this.project().outputStatus === "failed") return "Failed";
		if (this.state().generationResult) return "Completed";
		return "Pending";
	}

	outputFileRows(result: GeneratePackageResult): OutputFileRow[] {
		return [
			{ icon: "▧", name: "notes.chart", path: result.files.chart },
			{ icon: "▧", name: "song.ini", path: result.files.songIni },
			...(result.files.songOgg
				? [{ icon: "♫", name: "song.ogg", path: result.files.songOgg }]
				: []),
		];
	}

	compactPath(value: string | undefined): string {
		return compactPath(value);
	}

	formatCheckedAt(value: string): string {
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
	}

	canStartGeneration(): boolean {
		return this.state().status !== "generating" && this.summary().canGenerate;
	}

	canOpenOutputFolder(): boolean {
		return Boolean(this.state().generationResult?.outputDir ?? this.state().outputDir);
	}

	canOpenPreview(): boolean {
		return Boolean(this.state().generationResult);
	}

	generateActionLabel(): string {
		return this.state().generationResult ? "Regenerate" : "Start Generate";
	}

	async generate(overwriteKnownFiles: boolean): Promise<void> {
		this.autosaveWarning.set(null);
		const summary = this.runValidation();
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
			if (envelope.ok) {
				await this.autosaveGenerationResult();
				this.runValidation();
			}
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

	async openPreview(): Promise<void> {
		if (!this.canOpenPreview()) return;
		await this.router.navigateByUrl("/preview");
	}

	private async autosaveGenerationResult(): Promise<void> {
		const project = this.project();
		if (!project.projectFilePath) return;

		const payload = this.generateState.buildProjectStatePayload(
			project.projectName,
			project.projectFilePath,
		);
		const saved = await this.projectState.saveProject(payload);
		if (!saved) {
			this.autosaveWarning.set(
				"Generation completed, but CHDG could not autosave the project file. Use Save to persist the generated output status.",
			);
		}
	}
}

function compactPath(value: string | undefined): string {
	if (!value) return "";
	const normalized = value.replace(/\\/g, "/");
	const parts = normalized.split("/").filter(Boolean);
	return parts.at(-1) ?? value;
}

function fallbackSongName(sourcePath: string | undefined): string {
	const fileName = compactPath(sourcePath);
	if (!fileName) return "From source filename";
	return fileName.replace(/\.[^.]+$/, "");
}
