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
		createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
		beginPath: vi.fn(),
		moveTo: vi.fn(),
		lineTo: vi.fn(),
		closePath: vi.fn(),
		fill: vi.fn(),
		stroke: vi.fn(),
		arc: vi.fn(),
		fillText: vi.fn(),
		font: "",
		fillStyle: "",
		strokeStyle: "",
		lineWidth: 1,
	} as unknown as CanvasRenderingContext2D;
}

function createComponent(options?: {
	matchMediaMatches?: boolean;
	devicePixelRatio?: number;
	requestAnimationFrame?: (callback: FrameRequestCallback) => number;
	cancelAnimationFrame?: (id: number) => void;
}) {
	const requestAnimationFrame =
		options?.requestAnimationFrame ?? vi.fn(() => 123);
	const cancelAnimationFrame =
		options?.cancelAnimationFrame ?? vi.fn();
	const document = {
		defaultView: {
			devicePixelRatio: options?.devicePixelRatio ?? 3,
			matchMedia: vi.fn(() => ({ matches: options?.matchMediaMatches ?? false })),
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
		getBoundingClientRect: () => ({ width: 480, height: 360 }),
	} as HTMLDivElement;
	(component as never).canvasRef = { nativeElement: canvas };
	(component as never).containerRef = { nativeElement: container };
	return { component, canvas, context, requestAnimationFrame, cancelAnimationFrame };
}

describe("PreviewHighwayComponent", () => {
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
			noteEvents: [{ tick: 192, lane: 1, seconds: 1 }],
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

		expect(component.accessibleSummary()).toContain("Tick unavailable");
		vi.unstubAllGlobals();
	});
});
