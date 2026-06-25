import "@angular/compiler";
import { describe, expect, it, vi } from "vitest";
import { PreviewHighwayComponent } from "./preview-highway.component";

class FakeResizeObserver {
	static lastInstance: FakeResizeObserver | null = null;
	disconnect = vi.fn();
	observe = vi.fn();

	constructor() {
		FakeResizeObserver.lastInstance = this;
	}
}

function createCanvasContext() {
	return {
		setTransform: vi.fn(),
		clearRect: vi.fn(),
		fillRect: vi.fn(),
		strokeRect: vi.fn(),
		createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
		createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
		beginPath: vi.fn(),
		moveTo: vi.fn(),
		lineTo: vi.fn(),
		closePath: vi.fn(),
		fill: vi.fn(),
		stroke: vi.fn(),
		arc: vi.fn(),
		fillText: vi.fn(),
		save: vi.fn(),
		restore: vi.fn(),
		font: "",
		fillStyle: "",
		strokeStyle: "",
		globalAlpha: 1,
		lineWidth: 1,
	} as unknown as CanvasRenderingContext2D;
}

function previewNoteEvent(
	tick: number,
	lane: number,
	seconds: number,
	length = 0,
) {
	return {
		tick,
		lane,
		length,
		seconds,
		endSeconds: seconds + length / 192 / 2,
	};
}

function createComponent(options?: {
	matchMediaMatches?: boolean;
	devicePixelRatio?: number;
	requestAnimationFrame?: (callback: FrameRequestCallback) => number;
	cancelAnimationFrame?: (id: number) => void;
}) {
	const requestAnimationFrame =
		options?.requestAnimationFrame ?? vi.fn(() => 123);
	const cancelAnimationFrame = options?.cancelAnimationFrame ?? vi.fn();
	const document = {
		defaultView: {
			devicePixelRatio: options?.devicePixelRatio ?? 3,
			matchMedia: vi.fn(() => ({
				matches: options?.matchMediaMatches ?? false,
			})),
			requestAnimationFrame,
			cancelAnimationFrame,
			performance: { now: vi.fn(() => 1000) },
		},
	} as unknown as Document;
	const component = new PreviewHighwayComponent(document);
	const context = createCanvasContext();
	const canvas = {
		style: { width: "480px", height: "360px" },
		width: 0,
		height: 0,
		getContext: vi.fn(() => context),
	} as unknown as HTMLCanvasElement;
	const container = {
		clientWidth: 480,
		clientHeight: 360,
		getBoundingClientRect: vi.fn(() => ({ width: 999, height: 999 })),
	} as unknown as HTMLDivElement;
	const refs = component as unknown as {
		canvasRef?: { nativeElement: HTMLCanvasElement };
		containerRef?: { nativeElement: HTMLDivElement };
	};
	refs.canvasRef = { nativeElement: canvas };
	refs.containerRef = { nativeElement: container };
	return {
		component,
		canvas,
		context,
		requestAnimationFrame,
		cancelAnimationFrame,
	};
}

describe("PreviewHighwayComponent", () => {
	it("sizes the canvas from container content-box dimensions, not border-box rect", () => {
		vi.stubGlobal("ResizeObserver", FakeResizeObserver as never);
		const { component, canvas } = createComponent();

		component.ngAfterViewInit();

		expect(canvas.style.width).toBe("480px");
		expect(canvas.style.height).toBe("360px");
		expect(canvas.width).toBe(960);
		expect(canvas.height).toBe(720);
		vi.unstubAllGlobals();
	});

	it("caps DPR-backed canvas resize at 2x", () => {
		vi.stubGlobal("ResizeObserver", FakeResizeObserver as never);
		const { component, canvas } = createComponent({ devicePixelRatio: 3 });

		component.ngAfterViewInit();

		expect(canvas.width).toBe(960);
		expect(canvas.height).toBe(720);
		vi.unstubAllGlobals();
	});

	it("cancels raf and disconnects observer on destroy", () => {
		vi.stubGlobal("ResizeObserver", FakeResizeObserver as never);
		const cancelAnimationFrame = vi.fn();
		const requestAnimationFrame = vi.fn(() => 55);
		const { component } = createComponent({
			requestAnimationFrame,
			cancelAnimationFrame,
		});

		component.isPlaying = true;
		component.ngAfterViewInit();
		component.ngOnDestroy();

		expect(cancelAnimationFrame).toHaveBeenCalledWith(55);
		expect(FakeResizeObserver.lastInstance?.disconnect).toHaveBeenCalled();
		vi.unstubAllGlobals();
	});

	it("does not start a continuous raf loop when reduced motion is preferred", () => {
		vi.stubGlobal("ResizeObserver", FakeResizeObserver as never);
		const requestAnimationFrame = vi.fn(() => 77);
		const { component } = createComponent({
			matchMediaMatches: true,
			requestAnimationFrame,
		});

		component.isPlaying = true;
		component.ngAfterViewInit();

		expect(requestAnimationFrame).not.toHaveBeenCalled();
		vi.unstubAllGlobals();
	});

	it("surfaces timing limitation summary when tempo data is unavailable", () => {
		vi.stubGlobal("ResizeObserver", FakeResizeObserver as never);
		const { component } = createComponent();
		component.chartData = {
			resolution: 192,
			offsetSeconds: 0,
			hasAccurateTiming: false,
			limitations: [],
			noteEvents: [previewNoteEvent(192, 1, 1)],
			sectionEvents: [],
			timing: {
				resolution: 192,
				offsetSeconds: 0,
				hasAccurateTiming: false,
				tempos: [],
				timeSignatures: [],
				sections: [],
				notes: { count: 1 },
				diagnostics: [],
				summary: {
					status: "warning",
					label: "warning",
					errorCount: 0,
					warningCount: 1,
					infoCount: 0,
					importantMessages: [],
				},
			},
		} as never;
		component.ngAfterViewInit();

		expect(component.accessibleSummary()).toContain(
			"read-only generated-chart playback preview",
		);
		expect(component.accessibleSummary()).toContain(
			"Tempo timing is unavailable",
		);
		vi.unstubAllGlobals();
	});

	it("does not continuously redraw from currentTime updates during reduced-motion playback", () => {
		vi.stubGlobal("ResizeObserver", FakeResizeObserver as never);
		const { component, context } = createComponent({
			matchMediaMatches: true,
		});
		component.chartData = {
			resolution: 192,
			offsetSeconds: 0,
			hasAccurateTiming: true,
			limitations: [],
			noteEvents: [previewNoteEvent(192, 1, 1)],
			sectionEvents: [],
			timing: {
				resolution: 192,
				offsetSeconds: 0,
				hasAccurateTiming: true,
				tempos: [{ tick: 0, bpm: 120, seconds: 0, source: "generated-chart" }],
				timeSignatures: [
					{
						tick: 0,
						numerator: 4,
						denominator: 4,
						seconds: 0,
						source: "generated-chart",
					},
				],
				sections: [],
				notes: {
					count: 1,
					firstTick: 192,
					lastTick: 192,
					firstSeconds: 1,
					lastSeconds: 1,
				},
				diagnostics: [],
				summary: {
					status: "ok",
					label: "ok",
					errorCount: 0,
					warningCount: 0,
					infoCount: 0,
					importantMessages: [],
				},
			},
		} as never;
		component.ngAfterViewInit();
		const initialDraws = (context.clearRect as ReturnType<typeof vi.fn>).mock
			.calls.length;

		component.isPlaying = true;
		const drawsAfterPlay = (context.clearRect as ReturnType<typeof vi.fn>).mock
			.calls.length;
		for (const time of [0.1, 0.2, 0.3, 0.4, 0.5]) {
			component.currentTime = time;
		}
		const drawsAfterPlaybackTicks = (
			context.clearRect as ReturnType<typeof vi.fn>
		).mock.calls.length;
		component.seekEpoch = 1;
		const drawsAfterSeek = (context.clearRect as ReturnType<typeof vi.fn>).mock
			.calls.length;

		expect(drawsAfterPlay).toBe(initialDraws + 1);
		expect(drawsAfterPlaybackTicks).toBe(drawsAfterPlay);
		expect(drawsAfterSeek).toBe(drawsAfterPlaybackTicks + 1);
		vi.unstubAllGlobals();
	});

	it("defaults the technical HUD to off and draws it compactly only when enabled", () => {
		vi.stubGlobal("ResizeObserver", FakeResizeObserver as never);
		const { component, context } = createComponent();
		component.chartData = {
			resolution: 192,
			offsetSeconds: 0,
			hasAccurateTiming: true,
			limitations: [],
			noteEvents: [previewNoteEvent(192, 1, 1)],
			sectionEvents: [],
			timing: {
				resolution: 192,
				offsetSeconds: 0,
				hasAccurateTiming: true,
				tempos: [{ tick: 0, bpm: 120, seconds: 0, source: "generated-chart" }],
				timeSignatures: [
					{
						tick: 0,
						numerator: 4,
						denominator: 4,
						seconds: 0,
						source: "generated-chart",
					},
				],
				sections: [],
				notes: {
					count: 1,
					firstTick: 192,
					lastTick: 192,
					firstSeconds: 1,
					lastSeconds: 1,
				},
				diagnostics: [],
				summary: {
					status: "ok",
					label: "ok",
					errorCount: 0,
					warningCount: 0,
					infoCount: 0,
					importantMessages: [],
				},
			},
		} as never;
		component.ngAfterViewInit();
		// With valid chart data there is no limitation overlay, so the stage
		// profile default (HUD hidden) means no HUD text is drawn.
		expect(context.fillText as ReturnType<typeof vi.fn>).not.toHaveBeenCalled();

		// Enabling the session-only toggle triggers a compact HUD render.
		component.hudEnabled = true;
		expect(context.fillText as ReturnType<typeof vi.fn>).toHaveBeenCalled();
		vi.unstubAllGlobals();
	});
});
