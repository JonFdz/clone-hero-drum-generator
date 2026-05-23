import { CommonModule } from "@angular/common";
import { Component, NO_ERRORS_SCHEMA, Input } from "@angular/core";
import { formatTime } from "../../../services/desktop-preview-model";
import {
	projectSecondsToPercent,
	type PreviewViewport,
} from "../../../services/preview-chart-stage-model";

@Component({
	selector: "g[chdg-preview-time-ruler]",
	standalone: true,
	schemas: [NO_ERRORS_SCHEMA],
	imports: [CommonModule],
	template: `
		<ng-container *ngFor="let tick of ticks()">
			<line
				[attr.x1]="xForSeconds(tick.seconds)"
				[attr.x2]="xForSeconds(tick.seconds)"
				[attr.y1]="tick.major ? 34 : 42"
				[attr.y2]="52"
				[class.major]="tick.major"
			/>
			<text
				*ngIf="tick.major"
				[attr.x]="xForSeconds(tick.seconds)"
				y="24"
				text-anchor="middle"
			>
				{{ format(tick.seconds) }}
			</text>
		</ng-container>
	`,
	styles: [
		`
			:host line { stroke: rgba(208, 218, 235, 0.28); stroke-width: 1; }
			:host line.major { stroke: rgba(226, 232, 244, 0.58); stroke-width: 1.4; }
			:host text { fill: #c9d1df; font-size: 15px; font-weight: 600; }
		`,
	],
})
export class PreviewTimeRulerComponent {
	@Input({ required: true }) viewport!: PreviewViewport;
	@Input() chartX = 170;
	@Input() chartWidth = 1060;

	ticks(): Array<{ seconds: number; major: boolean }> {
		const viewport = this.viewport;
		if (!viewport || viewport.endSeconds <= viewport.startSeconds) return [];
		const first = Math.ceil(viewport.startSeconds * 4) / 4;
		const ticks: Array<{ seconds: number; major: boolean }> = [];
		for (
			let seconds = first;
			seconds <= viewport.endSeconds + 0.001;
			seconds += 0.25
		) {
			const rounded = Math.round(seconds * 1000) / 1000;
			ticks.push({
				seconds: rounded,
				major: Math.abs(rounded - Math.round(rounded)) < 0.001,
			});
		}
		return ticks;
	}

	xForSeconds(seconds: number): number {
		return (
			this.chartX +
			(projectSecondsToPercent(seconds, this.viewport) / 100) * this.chartWidth
		);
	}

	format(seconds: number): string {
		return formatTime(seconds);
	}
}
