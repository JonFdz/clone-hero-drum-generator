import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
export type GenerationStepState =
	| "Pending"
	| "Running"
	| "Completed"
	| "Failed";
@Component({
	selector: "chdg-generation-steps",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./generation-steps.component.html",
	styleUrl: "./generation-steps.component.css",
})
export class GenerationStepsComponent {
	@Input({ required: true }) steps!: string[];
	@Input({ required: true }) state!: GenerationStepState;
}
