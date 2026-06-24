import { CommonModule } from "@angular/common";
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	Input,
	OnDestroy,
	ViewChild,
	computed,
	signal,
} from "@angular/core";
import type { ChartPreviewData } from "../../../../services/desktop-bridge.service";
import { formatTime } from "../../../../services/desktop-preview-model";
import {
	HIGHWAY_SPEED_PRESETS,
	type HighwayFrameData,
	type HighwaySourceNote,
	type HighwaySpeedPresetId,
} from "../../highway/highway-model";
import {
	buildHighwayGeometry,
	buildHighwaySourceNotes,
	filterVisibleHighwayNotes,
	projectHighwayLines,
	projectHighwayNotes,
	visibleChartWindow,
} from "../../highway/highway-projection";
import { HighwayRenderer } from "../../highway/highway-renderer";
import {
	buildHighwayTimingMap,
	enumerateMusicalLines,
	musicalPositionAtTick,
	tickAtChartSeconds,
	type HighwayTimingMap,
} from "../../highway/highway-timing";

@Component({
	selector: "chdg-preview-highway",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule],
	templateUrl: "./preview-highway.component.html",
	styleUrl: "./preview-highway.component.css",
})
export class PreviewHighwayComponent implements AfterViewInit, OnDestroy {
	@ViewChild("container") private readonly containerRef?: ElementRef<HTMLDivElement>;
	@ViewChild("canvas") private readonly canvasRef?: ElementRef<HTMLCanvasElement>;

	private readonly renderer = new HighwayRenderer();
	private readonly _chartData = signal<ChartPreviewData | null>(null);
	private readonly _currentTime = signal(0);
	private readonly _previewOffsetMs = signal(0);
	private readonly _isPlaying = signal(false);
	private readonly _seekEpoch = signal(0);
	private readonly _preset = signal<HighwaySpeedPresetId>("normal");
	private readonly _hudEnabled = signal(true);
	private readonly fps = signal<number | null>(null);
	private readonly limitationText = signal<string | null>(null);
	private readonly visibleNoteCount = signal(0);
	private readonly reducedMotion = signal(false);

	private sourceNotes: HighwaySourceNote[] = [];
	private timingMap: HighwayTimingMap | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private animationFrameId: number | null = null;
	private ctx: CanvasRenderingContext2D | null = null;
	private frameCount = 0;
	private fpsWindowStartedAt = 0;
	private lastRenderedFrame: HighwayFrameData | null = null;

	constructor(private readonly document: Document = globalThis.document) {}

	@Input() set chartData(value: ChartPreviewData | null) {
		this._chartData.set(value);
		this.sourceNotes = buildHighwaySourceNotes(value?.noteEvents ?? []);
		this.timingMap = value
			? buildHighwayTimingMap({
					resolution: value.resolution,
					tempos: value.timing.tempos,
					timeSignatures: value.timing.timeSignatures,
				})
			: null;
		this.requestSingleRender();
	}

	@Input() set currentTime(value: number) {
		const nextTime = Number.isFinite(value) ? Math.max(0, value) : 0;
		const previousTime = this._currentTime();
		this._currentTime.set(nextTime);
		if (this.shouldRenderForCurrentTimeChange(previousTime, nextTime)) {
			this.requestSingleRender();
		}
	}

	@Input() set previewOffsetMs(value: number) {
		this._previewOffsetMs.set(Number.isFinite(value) ? value : 0);
		this.requestSingleRender();
	}

	@Input() set isPlaying(value: boolean) {
		this._isPlaying.set(value);
		this.syncAnimationLoop();
		this.requestSingleRender();
	}

	@Input() set seekEpoch(value: number) {
		this._seekEpoch.set(value);
		this.requestSingleRender();
	}

	@Input() set preset(value: HighwaySpeedPresetId) {
		this._preset.set(value);
		this.requestSingleRender();
	}

	@Input() set hudEnabled(value: boolean) {
		this._hudEnabled.set(value);
		this.requestSingleRender();
	}

	readonly accessibleSummary = computed(() => {
		const timeText = formatTime(Math.round(this._currentTime() * 2) / 2);
		const frame = this.lastRenderedFrame;
		const tick = frame?.hud.tick ?? null;
		const beat = frame?.hud.beat ?? null;
		const measure = frame?.hud.measure ?? null;
		const limitation = this.limitationText();
		return [
			"Highway experimental mode.",
			`Time ${timeText}.`,
			`Tick ${tick ?? "unavailable"}.`,
			`Beat ${beat ?? "unavailable"}.`,
			`Measure ${measure ?? "unavailable"}.`,
			`Visible notes ${this.visibleNoteCount()}.`,
			limitation ?? "",
		]
			.filter(Boolean)
			.join(" ");
	});

	ngAfterViewInit(): void {
		const canvas = this.canvasRef?.nativeElement;
		if (!canvas) return;
		this.ctx = canvas.getContext("2d");
		if (!this.ctx) {
			this.limitationText.set(
				"Canvas 2D preview is unavailable in this environment.",
			);
			return;
		}
		this.reducedMotion.set(this.prefersReducedMotion());
		this.observeResize();
		this.syncCanvasSize();
		this.requestSingleRender();
		this.syncAnimationLoop();
	}

	ngOnDestroy(): void {
		this.stopAnimationLoop();
		this.resizeObserver?.disconnect();
		this.resizeObserver = null;
	}

	private observeResize(): void {
		const container = this.containerRef?.nativeElement;
		if (!container || typeof ResizeObserver === "undefined") return;
		this.resizeObserver = new ResizeObserver(() => {
			this.syncCanvasSize();
			this.requestSingleRender();
		});
		this.resizeObserver.observe(container);
	}

	private syncCanvasSize(): void {
		const canvas = this.canvasRef?.nativeElement;
		const container = this.containerRef?.nativeElement;
		if (!canvas || !container) return;
		const rect = container.getBoundingClientRect();
		const cssWidth = Math.max(0, Math.round(rect.width));
		const cssHeight = Math.max(0, Math.round(rect.height));
		const dpr = this.devicePixelRatio();
		canvas.width = Math.round(cssWidth * dpr);
		canvas.height = Math.round(cssHeight * dpr);
		canvas.style.width = `${cssWidth}px`;
		canvas.style.height = `${cssHeight}px`;
	}

	private syncAnimationLoop(): void {
		if (!this.ctx) return;
		if (this._isPlaying() && !this.reducedMotion()) {
			if (this.animationFrameId !== null) return;
			this.fpsWindowStartedAt = this.now();
			const tick = () => {
				this.renderFrame();
				this.animationFrameId = this.windowRef()?.requestAnimationFrame(tick) ?? null;
			};
			this.animationFrameId =
				this.windowRef()?.requestAnimationFrame(tick) ?? null;
			return;
		}
		this.stopAnimationLoop();
	}

	private stopAnimationLoop(): void {
		if (this.animationFrameId === null) return;
		this.windowRef()?.cancelAnimationFrame(this.animationFrameId);
		this.animationFrameId = null;
	}

	private requestSingleRender(): void {
		if (this.animationFrameId !== null && !this.reducedMotion()) return;
		this.renderFrame();
	}

	private shouldRenderForCurrentTimeChange(
		previousTime: number,
		nextTime: number,
	): boolean {
		if (!this.reducedMotion()) return true;
		if (!this._isPlaying()) return true;
		return previousTime === nextTime;
	}

	private renderFrame(): void {
		const canvas = this.canvasRef?.nativeElement;
		const ctx = this.ctx;
		if (!canvas || !ctx) return;
		const geometry = buildHighwayGeometry(
			Number.parseInt(canvas.style.width || "0", 10),
			Number.parseInt(canvas.style.height || "0", 10),
		);
		const limitation = this.resolveLimitationText(geometry.minimumReadable);
		const frame = this.buildFrameData(geometry, limitation);
		this.renderer.draw(ctx, frame, this.devicePixelRatio());
		this.lastRenderedFrame = frame;
		this.sampleFps();
	}

	private buildFrameData(
		geometry: ReturnType<typeof buildHighwayGeometry>,
		limitation: string | null,
	): HighwayFrameData {
		const preset = HIGHWAY_SPEED_PRESETS.find(
			(candidate) => candidate.id === this._preset(),
		)!;
		const previewOffsetSeconds = this._previewOffsetMs() / 1000;
		const window = visibleChartWindow({
			playbackSeconds: this._currentTime(),
			previewOffsetSeconds,
			preset,
		});
		const visibleNotes = filterVisibleHighwayNotes(
			this.sourceNotes,
			window.startChartSeconds,
			window.endChartSeconds,
		);
		this.visibleNoteCount.set(visibleNotes.length);
		const notes = geometry.minimumReadable
			? projectHighwayNotes({
					notes: visibleNotes,
					playbackSeconds: this._currentTime(),
					previewOffsetSeconds,
					preset,
					geometry,
				})
			: [];
		const chartSecondsAtPlayback = Math.max(
			0,
			this._currentTime() - previewOffsetSeconds,
		);
		const tick =
			this.timingMap === null
				? null
				: Math.round(tickAtChartSeconds(this.timingMap, chartSecondsAtPlayback));
		const musicalPosition =
			this.timingMap && tick !== null
				? musicalPositionAtTick(this.timingMap, tick)
				: null;
		const lines =
			this.timingMap && geometry.minimumReadable
				? projectHighwayLines({
						lines: enumerateMusicalLines(this.timingMap, {
							startSeconds: window.startChartSeconds,
							endSeconds: window.endChartSeconds,
						}),
						playbackSeconds: this._currentTime(),
						previewOffsetSeconds,
						preset,
						geometry,
					})
				: [];
		this.limitationText.set(limitation);
		return {
			cssWidth: geometry.cssWidth,
			cssHeight: geometry.cssHeight,
			geometry,
			notes,
			lines,
			hudEnabled: this._hudEnabled(),
			limitationText: limitation,
			hud: {
				currentTimeSeconds: this._currentTime(),
				tick,
				beat: musicalPosition?.beat ?? null,
				measure: musicalPosition?.measure ?? null,
				fps: this.fps(),
			},
		};
	}

	private resolveLimitationText(minimumReadable: boolean): string | null {
		if (!minimumReadable) {
			return "Canvas area is too small for a readable highway preview.";
		}
		if (!this._chartData()?.noteEvents.length) {
			return "No generated notes.chart note data is available for the highway preview.";
		}
		if (this.timingMap === null) {
			return "Tempo timing is unavailable, so tick, beat, and measure data cannot be shown reliably.";
		}
		if (this.timingMap.meterLimitation) {
			return this.timingMap.meterLimitation;
		}
		return this._chartData()?.limitations[0] ?? null;
	}

	private prefersReducedMotion(): boolean {
		return !!this.windowRef()?.matchMedia?.("(prefers-reduced-motion: reduce)")
			.matches;
	}

	private devicePixelRatio(): number {
		const value = this.windowRef()?.devicePixelRatio ?? 1;
		return Math.min(Math.max(value, 1), 2);
	}

	private windowRef(): Window | null {
		return this.document.defaultView;
	}

	private sampleFps(): void {
		if (!this._isPlaying()) return;
		this.frameCount += 1;
		const now = this.now();
		const elapsed = now - this.fpsWindowStartedAt;
		if (elapsed < 500) return;
		this.fps.set((this.frameCount * 1000) / elapsed);
		this.frameCount = 0;
		this.fpsWindowStartedAt = now;
	}

	private now(): number {
		return this.windowRef()?.performance?.now?.() ?? Date.now();
	}
}
