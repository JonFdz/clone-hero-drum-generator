import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import type { GeneratePackageResult } from "@chdg/project/browser";
export type OutputFileRow = { icon: string; name: string; path?: string; compactPath: string };
@Component({ selector: "chdg-output-preview", standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, imports: [CommonModule], templateUrl: "./output-preview.component.html", styleUrl: "./output-preview.component.css" })
export class OutputPreviewComponent { @Input() result: GeneratePackageResult | null | undefined = null; @Input({ required: true }) files!: OutputFileRow[]; }
