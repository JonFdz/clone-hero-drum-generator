import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
} from "@angular/core";

/** Advanced JSON preview for source review diagnostics. Presentational only. */
@Component({
	selector: "chdg-source-review-advanced",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./source-review-advanced.component.html",
	styleUrl: "./source-review-advanced.component.css",
})
export class SourceReviewAdvancedComponent {
	@Input() open = false;
	@Input() json = "";
	@Output() hide = new EventEmitter<void>();
}
