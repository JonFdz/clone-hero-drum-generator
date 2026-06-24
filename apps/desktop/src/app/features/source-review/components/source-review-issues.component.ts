import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
} from "@angular/core";
import type { DisplayIssueView } from "../source-review-view.model";

@Component({
	selector: "chdg-source-review-issues",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./source-review-issues.component.html",
	styleUrl: "./source-review-issues.component.css",
})
export class SourceReviewIssuesComponent {
	@Input({ required: true }) open!: boolean;
	@Input({ required: true }) needAttention!: boolean;
	@Input({ required: true }) warningCount!: number;
	@Input({ required: true }) actionLabel!: string;
	@Input({ required: true }) summary!: string;
	@Input() preview?: string;
	@Input({ required: true }) warningIssues!: DisplayIssueView[];
	@Input({ required: true }) infoIssues!: DisplayIssueView[];

	@Output() toggleOpen = new EventEmitter<void>();
	@Output() reviewInMapping = new EventEmitter<void>();
}
