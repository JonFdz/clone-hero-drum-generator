import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import type {
	MappingFilterOption,
	MappingReviewRowViewWithControls,
} from "../../source-review-view.model";
import type { MappingReviewFilter } from "../../../../services/source-review-model";

@Component({
	selector: "chdg-source-review-mapping-review",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, FormsModule],
	templateUrl: "./source-review-mapping-review.component.html",
	styleUrl: "./source-review-mapping-review.component.css",
})
export class SourceReviewMappingReviewComponent {
	@Input({ required: true }) open!: boolean;
	@Input({ required: true }) needsAttention!: boolean;
	@Input({ required: true }) actionLabel!: string;
	@Input({ required: true }) statusLabel!: string;
	@Input({ required: true }) summary!: string;
	@Input() coverageSummary?: string;
	@Input({ required: true }) selectedProfileName: string | undefined;
	@Input({ required: true }) filters!: MappingFilterOption[];
	@Input({ required: true }) filterCountRecord!: Record<string, number>;
	@Input({ required: true }) filter!: MappingReviewFilter;
	@Input({ required: true }) rowsEmpty!: boolean;
	@Input({ required: true }) filteredRowsEmpty!: boolean;
	@Input({ required: true }) emptyFilterMessage!: string;
	@Input({ required: true }) filteredRows!: MappingReviewRowViewWithControls[];
	@Input({ required: true }) unknownCount!: number;
	@Input({ required: true }) ignoredKnownCount!: number;
	@Input({ required: true }) overrideCount!: number;
	@Input({ required: true }) changedCount!: number;
	@Input({ required: true }) ignoredCount!: number;

	@Output() toggleOpen = new EventEmitter<void>();
	@Output() setFilter = new EventEmitter<MappingReviewFilter>();
	@Output() applySuggestion =
		new EventEmitter<MappingReviewRowViewWithControls>();
	@Output() ignore = new EventEmitter<MappingReviewRowViewWithControls>();
	@Output() mapRow = new EventEmitter<{
		row: MappingReviewRowViewWithControls;
		value: string;
	}>();
	@Output() resetOverride =
		new EventEmitter<MappingReviewRowViewWithControls>();
}
