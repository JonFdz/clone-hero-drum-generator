import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import type { ValidationSummary } from "@chdg/project/browser";

@Component({
	selector: "chdg-validation-report",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./validation-report.component.html",
	styleUrl: "./validation-report.component.css",
})
export class ValidationReportComponent {
	@Input({ required: true }) summary!: ValidationSummary;
	@Input({ required: true }) icon!: string;
	@Input({ required: true }) label!: string;
	@Input({ required: true }) message!: string;
	@Input({ required: true }) checkedAt!: string;
}
