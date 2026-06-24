import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";

/** Source Review action area: back navigation and continue-to-generate. */
@Component({
	selector: "chdg-source-review-action-area",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./source-review-action-area.component.html",
	styleUrl: "./source-review-action-area.component.css",
})
export class SourceReviewActionAreaComponent {
	@Input({ required: true }) canContinue!: boolean;
	@Output() back = new EventEmitter<void>();
	@Output() continueToGenerate = new EventEmitter<void>();
}
