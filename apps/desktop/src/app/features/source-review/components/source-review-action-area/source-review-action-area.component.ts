import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";

/** Dormant Source Review action area with read-only back navigation. */
@Component({
	selector: "chdg-source-review-action-area",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./source-review-action-area.component.html",
	styleUrl: "./source-review-action-area.component.css",
})
export class SourceReviewActionAreaComponent {
	@Output() back = new EventEmitter<void>();
}
