import { CommonModule } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	type ElementRef,
	EventEmitter,
	Input,
	Output,
	computed,
	signal,
	ViewChild,
} from "@angular/core";
import type { ChartPreviewData } from "../../../services/desktop-bridge.service";
import {
	deriveAdjacentSections,
	deriveCurrentSection,
	deriveSectionNavigationItems,
	formatTime,
	type PreviewSectionNavigationItem,
} from "../../../services/desktop-preview-model";
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
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, PreviewFooterStatsComponent],
	templateUrl: "./preview-chart-stage.component.html",
	styleUrl: "./preview-chart-stage.component.css",
})
export class PreviewChartStageComponent {
	@ViewChild("chartSvg") private readonly chartSvg?: ElementRef<SVGSVGElement>;

	@Input() audioSourceLabel = "unknown";
	@Input() noteCount = 0;

	private readonly _waveformOverview = signal<WaveformOverview | null>(null);
	private readonly _chartData = signal<ChartPreviewData | null>(null);
	private readonly _currentTime = signal(0);
	private readonly _duration = signal(0);
	private readonly _previewOffsetMs = signal(0);
	private readonly _waveformStatus = signal<
		"idle" | "loading" | "ready" | "error" | "empty"
	>("idle");
	private readonly _waveformError = signal<string | null>(null);

	@Input() set waveformOverview(value: WaveformOverview | null) {
		this._waveformOverview.set(value);
	}
	get waveformOverview(): WaveformOverview | null {
		return this._waveformOverview();
	}

	@Input() set chartData(value: ChartPreviewData | null) {
		this._chartData.set(value);
	}
	get chartData(): ChartPreviewData | null {
		return this._chartData();
	}

	@Input() set currentTime(value: number) {
		this._currentTime.set(value);
	}
	get currentTime(): number {
		return this._currentTime();
	}

	@Input() set duration(value: number) {
		this._duration.set(value);
	}
	get duration(): number {
		return this._duration();
	}

	@Input() set previewOffsetMs(value: number) {
		this._previewOffsetMs.set(value);
	}
	get previewOffsetMs(): number {
		return this._previewOffsetMs();
	}

	@Input() set waveformStatus(
		value: "idle" | "loading" | "ready" | "error" | "empty",
	) {
		this._waveformStatus.set(value);
	}
	get waveformStatus(): "idle" | "loading" | "ready" | "error" | "empty" {
		return this._waveformStatus();
	}

	@Input() set waveformError(value: string | null) {
		this._waveformError.set(value);
	}
	get waveformError(): string | null {
		return this._waveformError();
	}

	@Output() seek = new EventEmitter<number>();

	readonly chartX = 170;
	readonly chartY = 58;
	readonly chartWidth = 1060;
	readonly chartHeight = 455;
	readonly rowHeight = 56;
	readonly lanes = PREVIEW_LANES;
	private scrubbingPointerId: number | null = null;

	readonly viewport = computed<PreviewViewport>(() =>
		computePreviewViewport(this._currentTime(), this._duration()),
	);

	readonly allNotes = computed<PreviewNote[]>(() =>
		adaptChartPreviewDataToPreviewNotes(
			this._chartData(),
			this._previewOffsetMs(),
		),
	);

	readonly visibleNotes = computed<PreviewNote[]>(() =>
		filterVisiblePreviewNotes(this.allNotes(), this.viewport()),
	);

	readonly verticalTicks = computed<number[]>(() =>
		Array.from({ length: 9 }, (_, index) => index / 8),
	);

	readonly timeTicks = computed<
		Array<{ seconds: number; major: boolean }>
	>(() => {
		const viewport = this.viewport();
		if (viewport.endSeconds <= viewport.startSeconds) return [];
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
	});

	readonly waveformPath = computed<string>(() => {
		const overview = this._waveformOverview();
		const viewport = this.viewport();
		if (
			!overview?.buckets.length ||
			viewport.endSeconds <= viewport.startSeconds
		) {
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
	});

	readonly sectionItems = computed<PreviewSectionNavigationItem[]>(() =>
		deriveSectionNavigationItems(
			this._chartData(),
			this._previewOffsetMs(),
		),
	);

	readonly currentSection = computed<
		PreviewSectionNavigationItem | undefined
	>(() =>
		deriveCurrentSection(
			this._chartData(),
			this._currentTime(),
			this._previewOffsetMs(),
		),
	);

	readonly adjacentSections = computed<{
		previous?: PreviewSectionNavigationItem;
		next?: PreviewSectionNavigationItem;
	}>(() => deriveAdjacentSections(this.sectionItems(), this._currentTime()));

	readonly playheadX = computed<number>(() =>
		this.xForSeconds(this._currentTime()),
	);

	laneY(index: number): number {
		return this.chartY + index * this.rowHeight + this.rowHeight / 2;
	}

	xForSeconds(seconds: number): number {
		return (
			this.chartX +
			(projectSecondsToPercent(seconds, this.viewport()) / 100) *
				this.chartWidth
		);
	}

	noteX(note: PreviewNote): number {
		return this.xForSeconds(note.seconds);
	}

	noteY(note: PreviewNote): number {
		const index = this.lanes.findIndex((lane) => lane.id === note.laneId);
		return this.laneY(Math.max(0, index));
	}

	diamondPoints(cx: number, cy: number, radius: number): string {
		return `${cx},${cy - radius} ${cx + radius},${cy} ${cx},${cy + radius} ${cx - radius},${cy}`;
	}

	formatTick(seconds: number): string {
		return formatTime(seconds);
	}

	onStagePointerDown(event: PointerEvent): void {
		this.scrubbingPointerId = event.pointerId;
		(event.currentTarget as SVGRectElement).setPointerCapture(
			event.pointerId,
		);
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

	seekToSection(section: PreviewSectionNavigationItem | undefined): void {
		if (!section) return;
		this.seek.emit(section.effectiveSeconds);
	}

	onSectionSelect(event: Event): void {
		const select = event.target as HTMLSelectElement | null;
		const index = select ? Number(select.value) : Number.NaN;
		const section = this.sectionItems().find(
			(item) => item.index === index,
		);
		this.seekToSection(section);
	}

	trackSection(_index: number, section: PreviewSectionNavigationItem): number {
		return section.index;
	}

	private clientXToChartSeconds(event: PointerEvent): number {
		const svg = this.chartSvg?.nativeElement;
		if (!svg) return this._currentTime();
		const point = svg.createSVGPoint();
		point.x = event.clientX;
		point.y = event.clientY;
		const screenCtm = svg.getScreenCTM();
		if (!screenCtm) return this._currentTime();
		const svgPoint = point.matrixTransform(screenCtm.inverse());
		const percent = (svgPoint.x - this.chartX) / this.chartWidth;
		return projectPercentToSeconds(percent, this.viewport());
	}
}
