import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import type { ValidationCategory, ValidationItem } from "@chdg/project";
import { DesktopGenerateStateService } from "../../services/desktop-generate-state.service";
import { DesktopProjectStateService } from "../../services/desktop-project-state.service";
import { DesktopValidationService } from "../../services/desktop-validation.service";

@Component({
	selector: "chdg-validation-page",
	standalone: true,
	imports: [CommonModule, RouterModule],
	template: `
    <header class="page-header">
      <p class="eyebrow">Validation</p>
      <h1>Validation checklist</h1>
      <p>Review project readiness before generating the Clone Hero song folder.</p>
    </header>

    <div class="grid validation-grid">
      <section class="card summary-card" [class.ready]="summary().canGenerate" [class.blocked]="!summary().canGenerate">
        <p class="eyebrow">Overall readiness</p>
        <h2>{{ summary().canGenerate ? "Can generate" : "Cannot generate yet" }}</h2>
        <p>{{ summary().canGenerate ? "No blocking errors were found. Review warnings before generation." : "Blocking errors must be fixed before generation starts." }}</p>
        <div class="stats-row">
          <div><strong>{{ summary().errorCount }}</strong><span>Errors</span></div>
          <div><strong>{{ summary().warningCount }}</strong><span>Warnings</span></div>
          <div><strong>{{ summary().infoCount }}</strong><span>Info</span></div>
        </div>
        <p class="field-hint">Last checked: {{ formatCheckedAt(summary().checkedAt) }}</p>
      </section>

      <section class="card">
        <h2>Project summary</h2>
        <dl class="summary-list compact">
          <dt>Project</dt><dd>{{ projectState.state().projectName }}</dd>
          <dt>Source</dt><dd>{{ generateState.state().sourcePath || "Not selected" }}</dd>
          <dt>Audio</dt><dd>{{ generateState.state().audioPath || "Not selected" }}</dd>
          <dt>Output</dt><dd>{{ generateState.state().outputDir || "Not selected" }}</dd>
          <dt>Tracks</dt><dd>{{ generateState.state().selectedTracks.length ? generateState.state().selectedTracks.join(", ") : "None" }}</dd>
          <dt>Output status</dt><dd>{{ projectState.outputStatus() }}</dd>
        </dl>
      </section>
    </div>

    <section class="card checklist-card">
      <div class="split-row">
        <div>
          <h2>Checklist</h2>
          <p>Errors block generation. Warnings and info are non-blocking.</p>
        </div>
        <a class="button secondary" routerLink="/generate">Review Generate page</a>
      </div>

      <div class="category-strip">
        <button type="button" class="button ghost small" [class.active]="selectedCategory === 'all'" (click)="selectedCategory = 'all'">All</button>
        <button type="button" class="button ghost small" *ngFor="let category of categories" [class.active]="selectedCategory === category" (click)="selectedCategory = category">{{ category }}</button>
      </div>

      <div class="validation-sections">
        <section *ngIf="itemsBySeverity('error').length > 0">
          <h3>Errors</h3>
          <ul class="validation-list"><li *ngFor="let item of itemsBySeverity('error')" class="validation-row error"><ng-container *ngTemplateOutlet="itemTpl; context: { $implicit: item }" /></li></ul>
        </section>
        <section *ngIf="itemsBySeverity('warning').length > 0">
          <h3>Warnings</h3>
          <ul class="validation-list"><li *ngFor="let item of itemsBySeverity('warning')" class="validation-row warning"><ng-container *ngTemplateOutlet="itemTpl; context: { $implicit: item }" /></li></ul>
        </section>
        <section *ngIf="itemsBySeverity('info').length > 0">
          <h3>Info</h3>
          <ul class="validation-list"><li *ngFor="let item of itemsBySeverity('info')" class="validation-row info"><ng-container *ngTemplateOutlet="itemTpl; context: { $implicit: item }" /></li></ul>
        </section>
      </div>
    </section>

    <ng-template #itemTpl let-item>
      <div>
        <div class="row-title"><strong>{{ item.title }}</strong><span class="pill" [class.danger]="item.severity === 'error'" [class.warning]="item.severity === 'warning'">{{ item.category }} · {{ item.severity }}</span></div>
        <p>{{ item.message }}</p>
      </div>
      @if (item.fixAction?.route) {
        <a class="button ghost small" [routerLink]="item.fixAction?.route">{{ item.fixAction?.label }}</a>
      }
    </ng-template>
  `,
	styles: [
		`
    .validation-grid { grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); margin-bottom: var(--space-5); }
    .summary-card.ready { border-color: rgba(101, 222, 119, 0.42); }
    .summary-card.blocked { border-color: rgba(255, 107, 122, 0.45); }
    .stats-row { display: grid; gap: var(--space-3); grid-template-columns: repeat(3, 1fr); margin: var(--space-5) 0; }
    .stats-row div { background: rgba(255, 255, 255, 0.03); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: grid; gap: var(--space-2); padding: var(--space-4); }
    .stats-row strong { font-size: 2rem; }
    .stats-row span { color: var(--color-muted); font-weight: 800; text-transform: uppercase; }
    .checklist-card { max-height: calc(100vh - 18rem); overflow: auto; }
    .category-strip { display: flex; flex-wrap: wrap; gap: var(--space-2); margin: var(--space-4) 0 var(--space-5); }
    .button.small { min-height: 2rem; padding: 0.35rem 0.7rem; }
    .button.active { border-color: rgba(166, 108, 255, 0.8); color: var(--color-accent-soft); }
    .validation-sections { display: grid; gap: var(--space-5); }
    .validation-list { display: grid; gap: var(--space-3); list-style: none; margin: 0; padding: 0; }
    .validation-row { align-items: center; border: 1px solid var(--color-border); border-radius: var(--radius-md); display: grid; gap: var(--space-4); grid-template-columns: 1fr auto; padding: var(--space-4); }
    .validation-row.error { border-color: rgba(255, 107, 122, 0.45); }
    .validation-row.warning { border-color: rgba(246, 180, 80, 0.4); }
    .validation-row.info { border-color: rgba(166, 108, 255, 0.28); }
    .row-title { align-items: center; display: flex; flex-wrap: wrap; gap: var(--space-3); justify-content: space-between; }
    .row-title + p { margin: var(--space-2) 0 0; overflow-wrap: anywhere; }
    .pill.danger { background: rgba(255, 107, 122, 0.15); border-color: rgba(255, 107, 122, 0.35); color: var(--color-danger); }
    .pill.warning { background: rgba(246, 180, 80, 0.15); border-color: rgba(246, 180, 80, 0.35); color: var(--color-warning); }
  `,
	],
})
export class ValidationPageComponent {
	readonly summary = this.validationService.summary;
	selectedCategory: ValidationCategory | "all" = "all";
	readonly categories: ValidationCategory[] = [
		"project",
		"source",
		"audio",
		"output",
		"tracks",
		"metadata",
		"offset",
		"ffmpeg",
		"generation",
		"chart",
	];

	constructor(
		readonly validationService: DesktopValidationService,
		readonly generateState: DesktopGenerateStateService,
		readonly projectState: DesktopProjectStateService,
	) {}

	itemsBySeverity(severity: ValidationItem["severity"]): ValidationItem[] {
		return this.summary().items.filter(
			(item) =>
				item.severity === severity &&
				(this.selectedCategory === "all" ||
					item.category === this.selectedCategory),
		);
	}

	formatCheckedAt(value: string): string {
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
	}
}
