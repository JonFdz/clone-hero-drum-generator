import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterModule } from "@angular/router";
import type { ValidationItem, ValidationSummary } from "@chdg/project/browser";
export type ChecklistFilter = "all" | ValidationItem["severity"];
export type ChecklistRow = ValidationItem & { icon: string };
@Component({ selector: "chdg-qa-checklist", standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule, RouterModule], templateUrl: "./qa-checklist.component.html", styleUrl: "./qa-checklist.component.css" })
export class QaChecklistComponent { @Input({ required: true }) summary!: ValidationSummary; @Input({ required: true }) rows!: ChecklistRow[]; @Input({ required: true }) filter!: ChecklistFilter; @Input() hasOnlyInfoChecks = false; @Output() filterChange = new EventEmitter<ChecklistFilter>(); }
