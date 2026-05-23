import { CommonModule } from "@angular/common";
import {
	Component,
	type ElementRef,
	EventEmitter,
	Input,
	Output,
	ViewChild,
} from "@angular/core";
import type { NormalizationPreview } from "@chdg/project/browser";
import type { ChartPreviewData } from "../../../services/desktop-bridge.service";
import { formatTime } from "../../../services/desktop-preview-model";
import type { WaveformOverview } from "../../../services/desktop-waveform-overview";
import {
	PREVIEW_LANES,
	adaptChartPreviewDataToPreviewNotes,
	computePreviewViewport,
	filterVisiblePreviewNotes,
	projectPercentToSeconds,
	projectSecondsToPercent,
	type PreviewLane,
	type PreviewNote,
	type PreviewViewport,
} from "../../../services/preview-chart-stage-model";
import { PreviewFooterStatsComponent } from "./preview-footer-stats.component";

@Component({
	selector: "chdg-preview-chart-stage",
	standalone: true,
	imports: [CommonModule, PreviewFooterStatsComponent],
	template: `
		<section class="chart-stage-card">
			<div class="stage-copy">
				<h2>Chart Preview</h2>
				<p>Click or drag the chart to scrub timing.</p>
			</div>
			<div class="stage-shell">
				<svg #chartSvg viewBox="0 0 1240 555" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Preview chart highway">
					<defs>
						<linearGradient id="stageFade" x1="0" x2="1" y1="0" y2="0">
							<stop offset="0" stop-color="#020817" stop-opacity="0" />
							<stop offset="0.08" stop-color="#020817" stop-opacity="1" />
							<stop offset="0.92" stop-color="#020817" stop-opacity="1" />
							<stop offset="1" stop-color="#020817" stop-opacity="0" />
						</linearGradient>
					</defs>

					<rect x="0" y="0" width="1240" height="555" rx="18" class="svg-bg" />

					<!-- Lane grid: rendered inline so all children stay in the SVG namespace. -->
					<rect [attr.x]="chartX" [attr.y]="chartY" [attr.width]="chartWidth" [attr.height]="chartHeight" class="chart-bg" />
					<ng-container *ngFor="let tick of verticalTicks()">
						<line
							[attr.x1]="chartX + chartWidth * tick"
							[attr.x2]="chartX + chartWidth * tick"
							[attr.y1]="chartY"
							[attr.y2]="chartY + chartHeight"
							class="grid-line"
						/>
					</ng-container>
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

					<!-- One global waveform background behind all lanes. It is optional and never blocks grid/notes/playhead. -->
					<path *ngIf="waveformPath()" [attr.d]="waveformPath()" class="waveform" />
					<rect [attr.x]="chartX" [attr.y]="chartY" [attr.width]="chartWidth" [attr.height]="chartHeight" fill="url(#stageFade)" opacity="0.32" />

					<!-- Time ruler. -->
					<ng-container *ngFor="let tick of timeTicks()">
						<line
							[attr.x1]="xForSeconds(tick.seconds)"
							[attr.x2]="xForSeconds(tick.seconds)"
							[attr.y1]="tick.major ? 34 : 42"
							[attr.y2]="52"
							[class.ruler-major]="tick.major"
							class="ruler-tick"
						/>
						<text *ngIf="tick.major" [attr.x]="xForSeconds(tick.seconds)" y="24" text-anchor="middle" class="ruler-label">
							{{ formatTick(tick.seconds) }}
						</text>
					</ng-container>

					<!-- Lane labels. -->
					<ng-container *ngFor="let lane of lanes; let index = index">
						<g [attr.transform]="'translate(0 ' + laneY(index) + ')'">
							<circle cx="38" cy="0" r="15" [attr.stroke]="lane.color" fill="rgba(4, 12, 28, 0.86)" stroke-width="2" />
							<polygon *ngIf="lane.shape === 'diamond'" [attr.points]="diamondPoints(38, 0, 10)" [attr.fill]="lane.color" />
							<circle *ngIf="lane.shape === 'circle'" cx="38" cy="0" r="8" [attr.fill]="lane.color" />
							<text x="70" y="-2" [attr.fill]="lane.color" class="lane-primary">{{ lane.label }}</text>
							<text *ngIf="lane.sublabel" x="70" y="16" [attr.fill]="lane.color" class="lane-secondary">({{ lane.sublabel }})</text>
						</g>
					</ng-container>

					<!-- Notes. -->
					<ng-container *ngFor="let note of visibleNotes(); trackBy: trackNote">
						<g [attr.transform]="'translate(' + noteX(note) + ' ' + noteY(note) + ')'">
							<circle *ngIf="note.shape === 'circle'" r="12" [attr.fill]="note.color" class="note-fill" />
							<polygon *ngIf="note.shape === 'diamond'" points="0,-13 13,0 0,13 -13,0" [attr.fill]="note.color" class="note-fill" />
							<circle r="16" fill="none" [attr.stroke]="note.color" class="note-ring" />
							<circle *ngIf="note.open" r="7" fill="rgba(4, 10, 24, 0.84)" />
						</g>
					</ng-container>

					<!-- Playhead. -->
					<line [attr.x1]="playheadX()" [attr.x2]="playheadX()" [attr.y1]="chartY - 8" [attr.y2]="chartY + chartHeight" class="playhead-line" />
					<circle [attr.cx]="playheadX()" [attr.cy]="chartY - 8" r="7" class="playhead-dot" />
					<text [attr.x]="playheadX()" y="24" text-anchor="middle" class="playhead-label">{{ formatTick(currentTime) }}</text>

					<rect
						[attr.x]="chartX"
						[attr.y]="chartY"
						[attr.width]="chartWidth"
						[attr.height]="chartHeight"
						class="seek-hit-area"
						fill="transparent"
						pointer-events="all"
						(pointerdown)="onStagePointerDown($event)"
						(pointermove)="onStagePointerMove($event)"
						(pointerup)="onStagePointerUp($event)"
						(pointercancel)="onStagePointerUp($event)"
					/>
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
			.chart-stage-card { background: linear-gradient(180deg, rgba(12, 20, 38, 0.96), rgba(8, 13, 27, 0.92)); border: 1px solid rgba(120, 142, 176, 0.2); border-radius: 1rem; display: grid; gap: 0.65rem; padding: 0.85rem 1rem 1rem; }
			.stage-copy { align-items: center; display: flex; justify-content: space-between; gap: 1rem; }
			.stage-copy h2 { font-size: 1rem; margin: 0; }
			.stage-copy p { font-size: 0.82rem; margin: 0; text-align: right; }
			.stage-shell { aspect-ratio: 16 / 7; min-height: 22rem; position: relative; }
			svg { display: block; height: 100%; min-height: 22rem; width: 100%; }
			.svg-bg { fill: #020817; stroke: rgba(120, 142, 176, 0.18); stroke-width: 1; }
			.chart-bg { fill: rgba(4, 10, 24, 0.76); }
			.grid-line { stroke: rgba(220, 227, 241, 0.07); stroke-width: 1; }
			.lane-line { stroke-width: 1.25; opacity: 0.66; }
			.waveform { fill: rgba(139, 92, 246, 0.18); stroke: rgba(168, 85, 247, 0.34); stroke-width: 1; }
			.ruler-tick { stroke: rgba(208, 218, 235, 0.28); stroke-width: 1; }
			.ruler-tick.ruler-major { stroke: rgba(226, 232, 244, 0.58); stroke-width: 1.4; }
			.ruler-label { fill: #c9d1df; font-size: 15px; font-weight: 600; }
			.lane-primary { font-size: 17px; font-weight: 900; letter-spacing: 0.02em; }
			.lane-secondary { font-size: 13px; font-weight: 700; opacity: 0.9; }
			.note-fill { stroke: rgba(255, 255, 255, 0.9); stroke-width: 2; }
			.note-ring { stroke-width: 2; opacity: 0.6; }
			.playhead-line { stroke: #8b5cf6; stroke-width: 2; }
			.playhead-dot { fill: #8b5cf6; }
			.playhead-label { fill: #a855f7; font-size: 16px; font-weight: 900; }
			.seek-hit-area { cursor: ew-resize; }
			.waveform-message, .empty-notes { background: rgba(4, 10, 24, 0.72); border: 1px solid rgba(197, 209, 225, 0.12); border-radius: 999px; color: #cbd5e1; left: 50%; padding: 0.5rem 0.8rem; position: absolute; top: 1rem; transform: translateX(-50%); }
			.waveform-message.warning { color: #fbbf24; }
			.empty-notes { top: 50%; }
			@media (max-width: 980px) { .stage-copy { align-items: start; display: grid; } .stage-copy p { text-align: left; } }
		`,
	],
})
export class PreviewChartStageComponent {
	@ViewChild("chartSvg") private readonly chartSvg?: ElementRef<SVGSVGElement>;
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
	@Output() seek = new EventEmitter<number>();

	readonly chartX = 170;
	readonly chartY = 58;
	readonly chartWidth = 1060;
	readonly chartHeight = 455;
	readonly rowHeight = 56;
	readonly lanes = PREVIEW_LANES;
	private scrubbingPointerId: number | null = null;

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

	verticalTicks(): number[] {
		return Array.from({ length: 9 }, (_, index) => index / 8);
	}

	timeTicks(): Array<{ seconds: number; major: boolean }> {
		const viewport = this.viewport();
		if (viewport.endSeconds <= viewport.startSeconds) return [];
		const first = Math.ceil(viewport.startSeconds * 4) / 4;
		const ticks: Array<{ seconds: number; major: boolean }> = [];
		for (let seconds = first; seconds <= viewport.endSeconds + 0.001; seconds += 0.25) {
			const rounded = Math.round(seconds * 1000) / 1000;
			ticks.push({
				seconds: rounded,
				major: Math.abs(rounded - Math.round(rounded)) < 0.001,
			});
		}
		return ticks;
	}

	laneY(index: number): number {
		return this.chartY + index * this.rowHeight + this.rowHeight / 2;
	}

	xForSeconds(seconds: number): number {
		return (
			this.chartX +
			(projectSecondsToPercent(seconds, this.viewport()) / 100) * this.chartWidth
		);
	}

	playheadX(): number {
		return this.xForSeconds(this.currentTime);
	}

	noteX(note: PreviewNote): number {
		return this.xForSeconds(note.seconds);
	}

	noteY(note: PreviewNote): number {
		const index = this.lanes.findIndex((lane) => lane.id === note.laneId);
		return this.laneY(Math.max(0, index));
	}

	waveformPath(): string {
		const overview = this.waveformOverview;
		const viewport = this.viewport();
		if (!overview?.buckets.length || viewport.endSeconds <= viewport.startSeconds) {
			return "";
		}
		const centerY = this.chartY + this.chartHeight / 2;
		const amplitude = this.chartHeight * 0.42;
		const buckets = overview.buckets.filter(
			(bucket) =>
				bucket.endSeconds >= viewport.startSeconds &&
				bucket.startSeconds <= viewport.endSeconds,
		);
		if (buckets.length === 0) return "";

		const topPoints: string[] = [];
		const bottomPoints: string[] = [];
		for (const bucket of buckets) {
			const seconds = (bucket.startSeconds + bucket.endSeconds) / 2;
			const x = this.xForSeconds(seconds);
			topPoints.push(
				`${x.toFixed(2)},${(centerY - Math.max(0, bucket.max) * amplitude).toFixed(2)}`,
			);
			bottomPoints.push(
				`${x.toFixed(2)},${(centerY - Math.min(0, bucket.min) * amplitude).toFixed(2)}`,
			);
		}
		return `M ${topPoints.join(" L ")} L ${bottomPoints.reverse().join(" L ")} Z`;
	}

	diamondPoints(cx: number, cy: number, radius: number): string {
		return `${cx},${cy - radius} ${cx + radius},${cy} ${cx},${cy + radius} ${cx - radius},${cy}`;
	}

	formatTick(seconds: number): string {
		return formatTime(seconds);
	}

	onStagePointerDown(event: PointerEvent): void {
		this.scrubbingPointerId = event.pointerId;
		(event.currentTarget as SVGRectElement).setPointerCapture(event.pointerId);
		this.seek.emit(this.clientXToChartSeconds(event));
	}

	onStagePointerMove(event: PointerEvent): void {
		if (this.scrubbingPointerId !== event.pointerId) return;
		this.seek.emit(this.clientXToChartSeconds(event));
	}

	onStagePointerUp(event: PointerEvent): void {
		if (this.scrubbingPointerId === event.pointerId) {
			this.scrubbingPointerId = null;
		}
		const target = event.currentTarget as SVGRectElement;
		if (target.hasPointerCapture(event.pointerId)) {
			target.releasePointerCapture(event.pointerId);
		}
	}

	trackNote(_index: number, note: PreviewNote): string {
		return note.id;
	}

	trackLane(_index: number, lane: PreviewLane): string {
		return lane.id;
	}

	private clientXToChartSeconds(event: PointerEvent): number {
		const svg = this.chartSvg?.nativeElement;
		if (!svg) return this.currentTime;
		const point = svg.createSVGPoint();
		point.x = event.clientX;
		point.y = event.clientY;
		const screenCtm = svg.getScreenCTM();
		if (!screenCtm) return this.currentTime;
		const svgPoint = point.matrixTransform(screenCtm.inverse());
		const percent = (svgPoint.x - this.chartX) / this.chartWidth;
		return projectPercentToSeconds(percent, this.viewport());
	}
}
