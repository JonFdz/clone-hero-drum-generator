import { CommonModule } from "@angular/common";
import { Component, NO_ERRORS_SCHEMA, Input } from "@angular/core";
import {
	PREVIEW_LANES,
	projectSecondsToPercent,
	type PreviewNote,
	type PreviewViewport,
} from "../../../services/preview-chart-stage-model";

@Component({
	selector: "g[chdg-preview-note-layer]",
	standalone: true,
	schemas: [NO_ERRORS_SCHEMA],
	imports: [CommonModule],
	template: `
		<ng-container *ngFor="let note of notes; trackBy: trackNote">
			<g [attr.transform]="'translate(' + noteX(note) + ' ' + noteY(note) + ')'">
				<circle *ngIf="note.shape === 'circle'" r="12" [attr.fill]="note.color" class="note-fill" />
				<polygon *ngIf="note.shape === 'diamond'" points="0,-13 13,0 0,13 -13,0" [attr.fill]="note.color" class="note-fill" />
				<circle r="16" fill="none" [attr.stroke]="note.color" class="note-ring" />
				<circle *ngIf="note.open" r="7" fill="rgba(4, 10, 24, 0.84)" />
			</g>
		</ng-container>
	`,
	styles: [
		`
			:host .note-fill { stroke: rgba(255, 255, 255, 0.9); stroke-width: 2; filter: drop-shadow(0 0 9px currentColor); }
			:host .note-ring { stroke-width: 2; opacity: 0.6; }
		`,
	],
})
export class PreviewNoteLayerComponent {
	@Input() notes: readonly PreviewNote[] = [];
	@Input({ required: true }) viewport!: PreviewViewport;
	@Input() chartX = 170;
	@Input() chartY = 58;
	@Input() chartWidth = 1060;
	@Input() rowHeight = 56;

	noteX(note: PreviewNote): number {
		return (
			this.chartX +
			(projectSecondsToPercent(note.seconds, this.viewport) / 100) *
				this.chartWidth
		);
	}

	noteY(note: PreviewNote): number {
		const index = PREVIEW_LANES.findIndex((lane) => lane.id === note.laneId);
		return (
			this.chartY + Math.max(0, index) * this.rowHeight + this.rowHeight / 2
		);
	}

	trackNote(_index: number, note: PreviewNote): string {
		return note.id;
	}
}
