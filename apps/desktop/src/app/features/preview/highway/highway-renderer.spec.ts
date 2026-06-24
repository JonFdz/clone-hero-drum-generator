import { describe, expect, it, vi } from "vitest";
import { HighwayRenderer } from "./highway-renderer";
import type { HighwayFrameData } from "./highway-model";

function createContext() {
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

describe("HighwayRenderer", () => {
	it("draws a frame without throwing and emits note primitives", () => {
		const renderer = new HighwayRenderer();
		const ctx = createContext();
		const frame: HighwayFrameData = {
			cssWidth: 640,
			cssHeight: 360,
			geometry: {
				cssWidth: 640,
				cssHeight: 360,
				horizonY: 64,
				hitLineY: 300,
				roadCenterX: 320,
				topRoadWidth: 260,
				bottomRoadWidth: 500,
				minimumReadable: true,
			},
			notes: [
				{
					id: "a",
					lane: 1,
					centerX: 320,
					centerY: 240,
					radius: 12,
					depth: 0.4,
					effectiveSeconds: 1,
				},
			],
			lines: [
				{
					tick: 192,
					kind: "measure",
					startX: 120,
					endX: 520,
					y: 180,
					depth: 0.6,
				},
			],
			hudEnabled: true,
			limitationText: null,
			hud: {
				currentTimeSeconds: 1,
				tick: 192,
				beat: 2,
				measure: 1,
				fps: 60,
			},
		};

		renderer.draw(ctx, frame, 2);

		expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
		expect(ctx.arc).toHaveBeenCalled();
		expect(ctx.fillText).toHaveBeenCalled();
	});
});
