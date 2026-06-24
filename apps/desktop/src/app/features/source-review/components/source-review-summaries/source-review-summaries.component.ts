import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import type {
	CombinedSummaryView,
	PieceSummaryEntry,
	SummaryFact,
} from "../../source-review-view.model";

@Component({
	selector: "chdg-source-review-summaries",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./source-review-summaries.component.html",
	styleUrl: "./source-review-summaries.component.css",
})
export class SourceReviewSummariesComponent {
	@Input({ required: true }) sourceFacts!: SummaryFact[];
	@Input({ required: true }) combined!: CombinedSummaryView;
	@Input({ required: true }) pieceEntries!: PieceSummaryEntry[];
	@Input() hasPreview = false;
	@Input() buildingMessage = "";
}
