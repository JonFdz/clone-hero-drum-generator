import { Component, NO_ERRORS_SCHEMA, Input } from "@angular/core";
import { formatTime } from "../../../services/desktop-preview-model";
import {
	projectSecondsToPercent,
	type PreviewViewport,
} from "../../../services/preview-chart-stage-model";

@Component({
	selector: "g[chdg-preview-playhead]",
	standalone: true,
	schemas: [NO_ERRORS_SCHEMA],
	template: `
		<line
			[attr.x1]="x()"
			[attr.x2]="x()"
			[attr.y1]="chartY - 8"
			[attr.y2]="chartY + chartHeight"
			class="playhead-line"
		/>
		<circle [attr.cx]="x()" [attr.cy]="chartY - 8" r="7" class="playhead-dot" />
		<text [attr.x]="x()" y="24" text-anchor="middle" class="playhead-label">{{ label() }}</text>
	`,
	styles: [
		`
			:host .playhead-line { stroke: #8b5cf6; stroke-width: 2; filter: drop-shadow(0 0 10px #8b5cf6); }
			:host .playhead-dot { fill: #8b5cf6; }
			:host .playhead-label { fill: #a855f7; font-size: 16px; font-weight: 900; }
		`,
	],
})
export class PreviewPlayheadComponent {
	@Input() currentTime = 0;
	@Input({ required: true }) viewport!: PreviewViewport;
	@Input() chartX = 170;
	@Input() chartY = 58;
	@Input() chartWidth = 1060;
	@Input() chartHeight = 455;

	x(): number {
		return (
			this.chartX +
			(projectSecondsToPercent(this.currentTime, this.viewport) / 100) *
				this.chartWidth
		);
	}

	label(): string {
		return formatTime(this.currentTime);
	}
}
