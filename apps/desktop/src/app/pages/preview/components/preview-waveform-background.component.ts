import { CommonModule } from "@angular/common";
import { Component, NO_ERRORS_SCHEMA, Input } from "@angular/core";
import type { WaveformOverview } from "../../../services/desktop-waveform-overview";
import {
	projectSecondsToPercent,
	type PreviewViewport,
} from "../../../services/preview-chart-stage-model";

@Component({
	selector: "g[chdg-preview-waveform-background]",
	standalone: true,
	schemas: [NO_ERRORS_SCHEMA],
	imports: [CommonModule],
	template: `
		<path *ngIf="path()" [attr.d]="path()" class="waveform" />
	`,
	styles: [
		`
			:host .waveform {
				fill: rgba(139, 92, 246, 0.18);
				stroke: rgba(168, 85, 247, 0.34);
				stroke-width: 1;
			}
		`,
	],
})
export class PreviewWaveformBackgroundComponent {
	@Input() waveformOverview: WaveformOverview | null = null;
	@Input({ required: true }) viewport!: PreviewViewport;
	@Input() chartX = 170;
	@Input() chartWidth = 1060;
	@Input() chartY = 58;
	@Input() chartHeight = 455;

	path(): string {
		const overview = this.waveformOverview;
		if (!overview?.buckets.length || !this.viewport) return "";
		const centerY = this.chartY + this.chartHeight / 2;
		const amplitude = this.chartHeight * 0.42;
		const buckets = overview.buckets.filter(
			(bucket) =>
				bucket.endSeconds >= this.viewport.startSeconds &&
				bucket.startSeconds <= this.viewport.endSeconds,
		);
		if (buckets.length === 0) return "";

		const topPoints: string[] = [];
		const bottomPoints: string[] = [];
		for (const bucket of buckets) {
			const seconds = (bucket.startSeconds + bucket.endSeconds) / 2;
			const x =
				this.chartX +
				(projectSecondsToPercent(seconds, this.viewport) / 100) *
					this.chartWidth;
			topPoints.push(
				`${x.toFixed(2)},${(centerY - Math.max(0, bucket.max) * amplitude).toFixed(2)}`,
			);
			bottomPoints.push(
				`${x.toFixed(2)},${(centerY - Math.min(0, bucket.min) * amplitude).toFixed(2)}`,
			);
		}
		return `M ${topPoints.join(" L ")} L ${bottomPoints.reverse().join(" L ")} Z`;
	}
}
