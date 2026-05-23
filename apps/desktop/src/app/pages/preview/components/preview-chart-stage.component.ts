import { CommonModule } from "@angular/common";
import { Component, NO_ERRORS_SCHEMA, Input } from "@angular/core";
import type { NormalizationPreview } from "@chdg/project/browser";
import type { ChartPreviewData } from "../../../services/desktop-bridge.service";
import type { WaveformOverview } from "../../../services/desktop-waveform-overview";
import {
	adaptChartPreviewDataToPreviewNotes,
	computePreviewViewport,
	filterVisiblePreviewNotes,
	type PreviewNote,
	type PreviewViewport,
} from "../../../services/preview-chart-stage-model";
import { PreviewFooterStatsComponent } from "./preview-footer-stats.component";
import { PreviewLaneGridComponent } from "./preview-lane-grid.component";
import { PreviewLaneLabelsComponent } from "./preview-lane-labels.component";
import { PreviewNoteLayerComponent } from "./preview-note-layer.component";
import { PreviewPlayheadComponent } from "./preview-playhead.component";
import { PreviewTimeRulerComponent } from "./preview-time-ruler.component";
import { PreviewWaveformBackgroundComponent } from "./preview-waveform-background.component";

@Component({
	selector: "chdg-preview-chart-stage",
	standalone: true,
	schemas: [NO_ERRORS_SCHEMA],
	imports: [
		CommonModule,
		PreviewFooterStatsComponent,
		PreviewLaneGridComponent,
		PreviewLaneLabelsComponent,
		PreviewNoteLayerComponent,
		PreviewPlayheadComponent,
		PreviewTimeRulerComponent,
		PreviewWaveformBackgroundComponent,
	],
	template: `
		<section class="chart-stage-card">
			<div class="stage-copy">
				<h2>Chart Preview</h2>
				<p>Left-to-right Expert Pro Drums review with one waveform background behind all lanes.</p>
			</div>
			<div class="stage-shell">
				<svg viewBox="0 0 1240 555" preserveAspectRatio="none" role="img" aria-label="Preview chart highway">
					<defs>
						<linearGradient id="stageFade" x1="0" x2="1" y1="0" y2="0">
							<stop offset="0" stop-color="#020817" stop-opacity="0" />
							<stop offset="0.08" stop-color="#020817" stop-opacity="1" />
							<stop offset="0.92" stop-color="#020817" stop-opacity="1" />
							<stop offset="1" stop-color="#020817" stop-opacity="0" />
						</linearGradient>
					</defs>
					<rect x="0" y="0" width="1240" height="555" rx="18" class="svg-bg" />
					<g chdg-preview-lane-grid [chartX]="chartX" [chartY]="chartY" [chartWidth]="chartWidth" [chartHeight]="chartHeight" [rowHeight]="rowHeight" />
					<g chdg-preview-waveform-background [waveformOverview]="waveformOverview" [viewport]="viewport()" [chartX]="chartX" [chartY]="chartY" [chartWidth]="chartWidth" [chartHeight]="chartHeight" />
					<rect [attr.x]="chartX" [attr.y]="chartY" [attr.width]="chartWidth" [attr.height]="chartHeight" fill="url(#stageFade)" opacity="0.32" />
					<g chdg-preview-time-ruler [viewport]="viewport()" [chartX]="chartX" [chartWidth]="chartWidth" />
					<g chdg-preview-lane-labels [chartY]="chartY" [rowHeight]="rowHeight" />
					<g chdg-preview-note-layer [notes]="visibleNotes()" [viewport]="viewport()" [chartX]="chartX" [chartY]="chartY" [chartWidth]="chartWidth" [rowHeight]="rowHeight" />
					<g chdg-preview-playhead [currentTime]="currentTime" [viewport]="viewport()" [chartX]="chartX" [chartY]="chartY" [chartWidth]="chartWidth" [chartHeight]="chartHeight" />
				</svg>
				<div class="waveform-message" *ngIf="waveformStatus === 'loading'">Loading waveform preview…</div>
				<div class="waveform-message warning" *ngIf="waveformStatus === 'error'">Waveform decode failed; notes and audio controls remain available.</div>
				<div class="empty-notes" *ngIf="allNotes().length === 0">No chart preview notes available yet.</div>
			</div>
			<chdg-preview-footer-stats
				[audioSourceLabel]="audioSourceLabel"
				[duration]="duration"
				[noteCount]="noteCount || allNotes().length"
				[waveformStatus]="waveformStatus"
				[waveformError]="waveformError"
			/>
		</section>
	`,
	styles: [
		`
			.chart-stage-card { background: linear-gradient(180deg, rgba(12, 20, 38, 0.96), rgba(8, 13, 27, 0.92)); border: 1px solid rgba(120, 142, 176, 0.2); border-radius: 1rem; display: grid; gap: 1rem; padding: 1rem; }
			.stage-copy { align-items: end; display: flex; justify-content: space-between; gap: 1rem; }
			.stage-copy h2 { margin: 0; }
			.stage-copy p { margin: 0; text-align: right; }
			.stage-shell { min-height: 32rem; position: relative; }
			svg { display: block; height: 100%; min-height: 32rem; width: 100%; }
			.svg-bg { fill: #020817; stroke: rgba(120, 142, 176, 0.18); stroke-width: 1; }
			.waveform-message, .empty-notes { background: rgba(4, 10, 24, 0.72); border: 1px solid rgba(197, 209, 225, 0.12); border-radius: 999px; color: #cbd5e1; left: 50%; padding: 0.5rem 0.8rem; position: absolute; top: 1rem; transform: translateX(-50%); }
			.waveform-message.warning { color: #fbbf24; }
			.empty-notes { top: 50%; }
			@media (max-width: 980px) { .stage-copy { align-items: start; display: grid; } .stage-copy p { text-align: left; } }
		`,
	],
})
export class PreviewChartStageComponent {
	@Input() waveformOverview: WaveformOverview | null = null;
	@Input() chartData: ChartPreviewData | null = null;
	@Input() normalizationPreview: NormalizationPreview | undefined;
	@Input() currentTime = 0;
	@Input() duration = 0;
	@Input() previewOffsetMs = 0;
	@Input() audioSourceLabel = "unknown";
	@Input() noteCount = 0;
	@Input() waveformStatus: "idle" | "loading" | "ready" | "error" | "empty" =
		"idle";
	@Input() waveformError: string | null = null;

	readonly chartX = 170;
	readonly chartY = 58;
	readonly chartWidth = 1060;
	readonly chartHeight = 455;
	readonly rowHeight = 56;

	viewport(): PreviewViewport {
		return computePreviewViewport(this.currentTime, this.duration);
	}

	allNotes(): PreviewNote[] {
		return adaptChartPreviewDataToPreviewNotes(
			this.chartData,
			this.normalizationPreview,
			this.duration,
			this.previewOffsetMs,
		);
	}

	visibleNotes(): PreviewNote[] {
		return filterVisiblePreviewNotes(this.allNotes(), this.viewport());
	}
}
