import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
} from "@angular/core";
import type { SelectedSourceView } from "../../source-review-view.model";

@Component({
	selector: "chdg-source-review-selected-source",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./source-review-selected-source.component.html",
	styleUrl: "./source-review-selected-source.component.css",
})
export class SourceReviewSelectedSourceComponent {
	@Input({ required: true }) view!: SelectedSourceView;
	@Output() refresh = new EventEmitter<void>();
	@Output() toggleJson = new EventEmitter<void>();
}
