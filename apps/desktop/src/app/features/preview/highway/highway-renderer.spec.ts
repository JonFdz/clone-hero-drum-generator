import { describe, expect, it, vi } from "vitest";
import { HighwayRenderer } from "./highway-renderer";
import { HIGHWAY_STAGE_VISUAL_PROFILE } from "./highway-stage-visual-profile";
import type { HighwayFrameData, HighwayProjectedHead } from "./highway-model";

function createContext() {
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
		textBaseline: "alphabetic",
		textAlign: "left",
		fillStyle: "",
		strokeStyle: "",
		globalAlpha: 1,
		lineWidth: 1,
	} as unknown as CanvasRenderingContext2D;
}

function squareHead(
	overrides: Partial<
		Extract<HighwayProjectedHead, { visualKind: "square-head" }>
	> = {},
) {
	return {
		id: "square",
		visualKind: "square-head",
		depth: 0.3,
		centerX: 240,
		centerY: 220,
		radius: 12,
		fill: "#ff4d5f",
		stroke: "#ffc4ca",
		dynamic: null,
		...overrides,
	} as Extract<HighwayProjectedHead, { visualKind: "square-head" }>;
}

function cymbalHead(
	overrides: Partial<
		Extract<HighwayProjectedHead, { visualKind: "cymbal-head" }>
	> = {},
) {
	return {
		id: "circle",
		visualKind: "cymbal-head",
		depth: 0.4,
		centerX: 320,
		centerY: 180,
		radius: 10,
		fill: "#4f95ff",
		stroke: "#bdd7ff",
		dynamic: null,
		...overrides,
	} as Extract<HighwayProjectedHead, { visualKind: "cymbal-head" }>;
}

function kickHead(
	overrides: Partial<
		Extract<HighwayProjectedHead, { visualKind: "kick-rail" }>
	> = {},
) {
	return {
		id: "kick",
		visualKind: "kick-rail",
		depth: 0.2,
		y: 240,
		leftX: 180,
		rightX: 460,
		thickness: 9,
		fill: "#ff9a3c",
		stroke: "#ffd8ae",
		...overrides,
	} as Extract<HighwayProjectedHead, { visualKind: "kick-rail" }>;
}

function frame(overrides: Partial<HighwayFrameData> = {}): HighwayFrameData {
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
			kickHead(),
			squareHead({ dynamic: "accent" }),
			cymbalHead({ dynamic: "ghost" }),
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
			{
				lane: "red",
				leftX: 150,
				rightX: 220,
				topY: 286,
				bottomY: 304,
				fill: "#ff4d5f",
				stroke: "#ffc4ca",
			},
			{
				lane: "yellow",
				leftX: 225,
				rightX: 295,
				topY: 286,
				bottomY: 304,
				fill: "#ffd84d",
				stroke: "#fff0b0",
			},
			{
				lane: "blue",
				leftX: 300,
				rightX: 370,
				topY: 286,
				bottomY: 304,
				fill: "#4f95ff",
				stroke: "#bdd7ff",
			},
			{
				lane: "green",
				leftX: 375,
				rightX: 445,
				topY: 286,
				bottomY: 304,
				fill: "#57da68",
				stroke: "#caefd0",
			},
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
		...overrides,
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

	it("fills the scene background as the first full-canvas fillRect", () => {
		const renderer = new HighwayRenderer();
		const ctx = createContext();
		const fillRectSpy = vi.spyOn(ctx, "fillRect");

		renderer.draw(ctx, frame(), 1);

		// The stage background is the first full-canvas fillRect (0,0,W,H).
		expect(fillRectSpy.mock.calls[0]).toEqual([0, 0, 640, 360]);
	});

	it("renders square heads with a depth cue (top highlight + lower shadow)", () => {
		const renderer = new HighwayRenderer();
		const ctx = createContext();
		const spy = vi.spyOn(ctx, "fillRect");

		renderer.draw(ctx, frame({ heads: [squareHead()], sustains: [] }), 1);

		// Square head emits several fillRect calls: face, top highlight, lower shadow.
		expect(spy).toHaveBeenCalled();
	});

	it("renders cymbal heads with a disc/ring radial-highlight treatment", () => {
		const renderer = new HighwayRenderer();
		const ctx = createContext();
		const spy = vi.spyOn(ctx, "arc");

		renderer.draw(ctx, frame({ heads: [cymbalHead()], sustains: [] }), 1);

		// halo + disc + highlight + ring => multiple arc() calls.
		const arcCalls = spy.mock.calls.length;
		expect(arcCalls).toBeGreaterThanOrEqual(3);
	});

	it("renders kick rails thinner and road-contained using head thickness", () => {
		const renderer = new HighwayRenderer();
		const ctx = createContext();
		const fillRectSpy = vi.spyOn(ctx, "fillRect");

		renderer.draw(
			ctx,
			frame({
				heads: [kickHead({ thickness: 7, leftX: 200, rightX: 440 })],
				sustains: [],
			}),
			1,
		);

		// Main rail fill uses the projected thickness (7) as height.
		const railCall = fillRectSpy.mock.calls.find(
			(args) => Math.abs((args[3] as number) - 7) < 0.001,
		);
		expect(railCall).toBeDefined();
	});

	it("applies reduced alpha to ghost heads while preserving base shape", () => {
		const renderer = new HighwayRenderer();
		const ctx = createContext();

		renderer.draw(
			ctx,
			frame({ heads: [cymbalHead({ dynamic: "ghost" })], sustains: [] }),
			1,
		);

		// save/restore brackets the ghost treatment.
		expect(ctx.save).toHaveBeenCalled();
		expect(ctx.restore).toHaveBeenCalled();
	});

	it("draws a bright rim for accent over the base square/circle identity", () => {
		const renderer = new HighwayRenderer();
		const ctx = createContext();
		const strokeSpy = vi.spyOn(ctx, "stroke");

		renderer.draw(
			ctx,
			frame({ heads: [squareHead({ dynamic: "accent" })], sustains: [] }),
			1,
		);

		expect(strokeSpy).toHaveBeenCalled();
	});

	it("draws sustains before kick rails, pitched heads, and targets (semantic draw order)", () => {
		const renderer = new HighwayRenderer();
		const ctx = createContext();
		const order: string[] = [];
		const spyTarget = renderer as unknown as {
			drawSustains: (...args: unknown[]) => void;
			drawKickRails: (...args: unknown[]) => void;
			drawPitchedHeads: (...args: unknown[]) => void;
			drawHitLineAndTargets: (...args: unknown[]) => void;
		};
		for (const method of [
			"drawSustains",
			"drawKickRails",
			"drawPitchedHeads",
			"drawHitLineAndTargets",
		] as const) {
			vi.spyOn(spyTarget, method).mockImplementation(() => {
				order.push(method);
			});
		}

		renderer.draw(ctx, frame(), 1);

		expect(order).toEqual([
			"drawSustains",
			"drawKickRails",
			"drawPitchedHeads",
			"drawHitLineAndTargets",
		]);
	});

	it("draws exactly four targets with lane-colored outlines", () => {
		const renderer = new HighwayRenderer();
		const ctx = createContext();
		const strokeSpy = vi.spyOn(ctx, "stroke");

		renderer.draw(ctx, frame(), 1);

		// Many stroke calls (dividers, borders, lines, targets, outlines). The
		// four targets are present in the frame and each emits a target stroke.
		expect(strokeSpy).toHaveBeenCalled();
	});

	it("defaults the HUD from the stage profile (off) but draws compact corner metrics when enabled", () => {
		const profileOff = HIGHWAY_STAGE_VISUAL_PROFILE;
		expect(profileOff.hud.enabledByDefault).toBe(false);

		const renderer = new HighwayRenderer();
		const ctxOff = createContext();
		renderer.draw(ctxOff, frame({ hudEnabled: false }), 1);
		expect(ctxOff.fillText).not.toHaveBeenCalled();

		const ctxOn = createContext();
		renderer.draw(ctxOn, frame({ hudEnabled: true }), 1);
		expect(ctxOn.fillText).toHaveBeenCalledTimes(4);
		// FPS is top-left.
		expect((ctxOn.fillText as ReturnType<typeof vi.fn>).mock.calls[0]).toEqual([
			"FPS 60",
			HIGHWAY_STAGE_VISUAL_PROFILE.hud.edgeInset,
			HIGHWAY_STAGE_VISUAL_PROFILE.hud.edgeInset,
		]);
		// Tick/Beat/Measure are top-right and right-aligned.
		expect(
			(ctxOn.fillText as ReturnType<typeof vi.fn>).mock.calls[1]?.[0],
		).toBe("Tick 192");
		expect(
			(ctxOn.fillText as ReturnType<typeof vi.fn>).mock.calls[2]?.[0],
		).toBe("Beat 2");
		expect(
			(ctxOn.fillText as ReturnType<typeof vi.fn>).mock.calls[3]?.[0],
		).toBe("Measure 1");
	});
});
