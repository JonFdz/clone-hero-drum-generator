import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { MappingProfileApplyMode } from "@chdg/project/browser";
import type {
	ApplyModeOption,
	MappingProfileView,
} from "../../source-review-view.model";

/**
 * Presentational Mapping Profiles section for Source Review.
 * Owns no state/services: emits semantic intents (select, set apply mode,
 * create/update/edit/delete requests, apply) and renders precomputed
 * presentation values. No bridge access.
 */
@Component({
	selector: "chdg-source-review-mapping-profiles",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, FormsModule],
	templateUrl: "./source-review-mapping-profiles.component.html",
	styleUrl: "./source-review-mapping-profiles.component.css",
})
export class SourceReviewMappingProfilesComponent {
	@Input({ required: true }) profiles!: MappingProfileView[];
	@Input() selectedProfile: MappingProfileView | null = null;
	@Input({ required: true }) applyMode!: MappingProfileApplyMode;
	@Input({ required: true }) applyModeOptions!: ApplyModeOption[];
	@Input({ required: true }) status!: string;
	@Input() error: string | undefined;
	@Input({ required: true }) overrideCount!: number;

	@Output() selectProfile = new EventEmitter<string>();
	@Output() setApplyMode = new EventEmitter<MappingProfileApplyMode>();
	@Output() requestCreate = new EventEmitter<void>();
	@Output() requestUpdate = new EventEmitter<void>();
	@Output() requestEdit = new EventEmitter<void>();
	@Output() requestDelete = new EventEmitter<void>();
	@Output() apply = new EventEmitter<void>();
}
