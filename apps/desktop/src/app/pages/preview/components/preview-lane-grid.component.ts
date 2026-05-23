import { CommonModule } from "@angular/common";
import { Component, NO_ERRORS_SCHEMA, Input } from "@angular/core";
import { PREVIEW_LANES } from "../../../services/preview-chart-stage-model";

@Component({
	selector: "g[chdg-preview-lane-grid]",
	standalone: true,
	schemas: [NO_ERRORS_SCHEMA],
	imports: [CommonModule],
	template: `
		<rect
			[attr.x]="chartX"
			[attr.y]="chartY"
			[attr.width]="chartWidth"
			[attr.height]="chartHeight"
			class="chart-bg"
		/>
		<ng-container *ngFor="let lane of lanes; let index = index">
			<line
				[attr.x1]="chartX"
				[attr.x2]="chartX + chartWidth"
				[attr.y1]="laneY(index)"
				[attr.y2]="laneY(index)"
				[attr.stroke]="lane.color"
				class="lane-line"
			/>
		</ng-container>
		<ng-container *ngFor="let tick of verticalTicks()">
			<line
				[attr.x1]="chartX + chartWidth * tick"
				[attr.x2]="chartX + chartWidth * tick"
				[attr.y1]="chartY"
				[attr.y2]="chartY + chartHeight"
				class="grid-line"
			/>
		</ng-container>
	`,
	styles: [
		`
			:host .chart-bg { fill: rgba(4, 10, 24, 0.76); }
			:host .lane-line { stroke-width: 1.25; opacity: 0.66; filter: drop-shadow(0 0 5px currentColor); }
			:host .grid-line { stroke: rgba(220, 227, 241, 0.07); stroke-width: 1; }
		`,
	],
})
export class PreviewLaneGridComponent {
	@Input() chartX = 170;
	@Input() chartY = 58;
	@Input() chartWidth = 1060;
	@Input() chartHeight = 455;
	@Input() rowHeight = 56;
	readonly lanes = PREVIEW_LANES;

	laneY(index: number): number {
		return this.chartY + index * this.rowHeight + this.rowHeight / 2;
	}

	verticalTicks(): number[] {
		return Array.from({ length: 9 }, (_, index) => index / 8);
	}
}
