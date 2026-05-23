import { CommonModule } from "@angular/common";
import { Component, NO_ERRORS_SCHEMA, Input } from "@angular/core";
import {
	PREVIEW_LANES,
	type PreviewLane,
} from "../../../services/preview-chart-stage-model";

@Component({
	selector: "g[chdg-preview-lane-labels]",
	standalone: true,
	schemas: [NO_ERRORS_SCHEMA],
	imports: [CommonModule],
	template: `
		<ng-container *ngFor="let lane of lanes; let index = index">
			<g [attr.transform]="'translate(0 ' + laneY(index) + ')'">
				<circle cx="38" cy="0" r="15" [attr.stroke]="lane.color" fill="rgba(4, 12, 28, 0.86)" stroke-width="2" />
				<polygon
					*ngIf="lane.shape === 'diamond'"
					[attr.points]="diamondPoints(38, 0, 10)"
					[attr.fill]="lane.color"
				/>
				<circle *ngIf="lane.shape === 'circle'" cx="38" cy="0" r="8" [attr.fill]="lane.color" />
				<text x="70" y="-2" [attr.fill]="lane.color" class="primary">{{ lane.label }}</text>
				<text *ngIf="lane.sublabel" x="70" y="16" [attr.fill]="lane.color" class="secondary">({{ lane.sublabel }})</text>
			</g>
		</ng-container>
	`,
	styles: [
		`
			:host text { font-family: inherit; }
			:host .primary { font-size: 17px; font-weight: 900; letter-spacing: 0.02em; }
			:host .secondary { font-size: 13px; font-weight: 700; opacity: 0.9; }
		`,
	],
})
export class PreviewLaneLabelsComponent {
	@Input() chartY = 58;
	@Input() rowHeight = 56;
	readonly lanes: readonly PreviewLane[] = PREVIEW_LANES;

	laneY(index: number): number {
		return this.chartY + index * this.rowHeight + this.rowHeight / 2;
	}

	diamondPoints(cx: number, cy: number, radius: number): string {
		return `${cx},${cy - radius} ${cx + radius},${cy} ${cx},${cy + radius} ${cx - radius},${cy}`;
	}
}
