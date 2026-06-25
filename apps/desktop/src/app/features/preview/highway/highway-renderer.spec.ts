import { describe, expect, it, vi } from "vitest";
import { HighwayRenderer } from "./highway-renderer";
import type { HighwayFrameData } from "./highway-model";

function createContext() {
	return {
		setTransform: vi.fn(),
		clearRect: vi.fn(),
		fillRect: vi.fn(),
		strokeRect: vi.fn(),
		createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
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

function frame(): HighwayFrameData {
	return {
		cssWidth: 640,
		cssHeight: 360,
		geometry: {
			cssWidth: 640,
			cssHeight: 360,
			horizonY: 64,
			hitLineY: 300,
			roadCenterX: 320,
			topRoadWidth: 220,
			bottomRoadWidth: 500,
			pitchedLaneCount: 4,
			minimumReadable: true,
		},
		heads: [
			{
				id: "kick",
				visualKind: "kick-rail",
				depth: 0.2,
				y: 240,
				leftX: 180,
				rightX: 460,
				thickness: 10,
				fill: "#ff9a3c",
				stroke: "#ffd8ae",
			},
			{
				id: "square",
				visualKind: "square-head",
				depth: 0.3,
				centerX: 240,
				centerY: 220,
				radius: 12,
				fill: "#ff4d5f",
				stroke: "#ffc4ca",
				dynamic: "accent",
			},
			{
				id: "circle",
				visualKind: "cymbal-head",
				depth: 0.4,
				centerX: 320,
				centerY: 180,
				radius: 10,
				fill: "#4f95ff",
				stroke: "#bdd7ff",
				dynamic: "ghost",
			},
		],
		sustains: [
			{
				id: "kick-band",
				kind: "kick",
				depth: 0.25,
				nearLeftX: 180,
				nearRightX: 460,
				nearY: 240,
				farLeftX: 220,
				farRightX: 420,
				farY: 190,
				fill: "rgba(255, 154, 60, 0.32)",
			},
			{
				id: "pitched-tail",
				kind: "pitched",
				depth: 0.35,
				nearLeftX: 280,
				nearRightX: 340,
				nearY: 220,
				farLeftX: 300,
				farRightX: 330,
				farY: 170,
				fill: "#4f95ff",
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
		targets: [
			{ lane: "red", leftX: 150, rightX: 220, topY: 286, bottomY: 304, fill: "#ff4d5f", stroke: "#ffc4ca" },
			{ lane: "yellow", leftX: 225, rightX: 295, topY: 286, bottomY: 304, fill: "#ffd84d", stroke: "#fff0b0" },
			{ lane: "blue", leftX: 300, rightX: 370, topY: 286, bottomY: 304, fill: "#4f95ff", stroke: "#bdd7ff" },
			{ lane: "green", leftX: 375, rightX: 445, topY: 286, bottomY: 304, fill: "#57da68", stroke: "#caefd0" },
		],
		laneDividers: [
			{ startX: 250, endX: 205 },
			{ startX: 320, endX: 320 },
			{ startX: 390, endX: 435 },
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
}

describe("HighwayRenderer", () => {
	it("draws kick rails, sustains, square heads, circle heads, targets, and hud", () => {
		const renderer = new HighwayRenderer();
		const ctx = createContext();

		renderer.draw(ctx, frame(), 2);

		expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
		expect(ctx.fillRect).toHaveBeenCalled();
		expect(ctx.arc).toHaveBeenCalled();
		expect(ctx.fillText).toHaveBeenCalled();
		expect(ctx.save).toHaveBeenCalled();
		expect(ctx.restore).toHaveBeenCalled();
	});
});
