import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
} from "@angular/core";
import type { TrackRowView } from "../../source-review-view.model";

@Component({
	selector: "chdg-source-review-track-list",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./source-review-track-list.component.html",
	styleUrl: "./source-review-track-list.component.css",
})
export class SourceReviewTrackListComponent {
	@Input({ required: true }) rows!: TrackRowView[];
	@Input({ required: true }) selectedCountLabel!: string;
	@Input({ required: true }) notesSummaryLabel!: string;
	@Output() toggleTrack = new EventEmitter<number>();
}
