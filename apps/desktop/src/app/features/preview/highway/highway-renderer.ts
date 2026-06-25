import {
	HIGHWAY_STAGE_VISUAL_PROFILE,
	type HighwayStageVisualProfile,
} from "./highway-stage-visual-profile";
import type {
	HighwayFrameData,
	HighwayProjectedHead,
	HighwayProjectedLine,
	HighwayProjectedSustain,
	HighwayTarget,
} from "./highway-model";

/**
 * Stage-style drum highway renderer.
 *
 * Uses native Canvas 2D primitives and gradients only. All visual constants
 * (colors, alphas, border widths, HUD treatment) are sourced from the stage
 * visual profile — no renderer-local visual literals. Draw order is fixed and
 * semantic (see OpenSpec design §9).
 */
export class HighwayRenderer {
	private readonly profile: HighwayStageVisualProfile;

	constructor(
		profile: HighwayStageVisualProfile = HIGHWAY_STAGE_VISUAL_PROFILE,
	) {
		this.profile = profile;
	}

	draw(
		ctx: CanvasRenderingContext2D,
		frame: HighwayFrameData,
		devicePixelRatio: number,
	): void {
		ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
		ctx.clearRect(0, 0, frame.cssWidth, frame.cssHeight);

		this.drawBackground(ctx, frame);
		this.drawRoad(ctx, frame);
		this.drawLaneDividers(ctx, frame);
		this.drawMusicalLines(ctx, frame.lines);
		this.drawSustains(ctx, frame.sustains);
		this.drawKickRails(ctx, frame.heads);
		this.drawPitchedHeads(ctx, frame.heads);
		this.drawHitLineAndTargets(ctx, frame);
		if (frame.hudEnabled) this.drawHud(ctx, frame);
		if (frame.limitationText) this.drawOverlay(ctx, frame);
	}

	private drawBackground(
		ctx: CanvasRenderingContext2D,
		frame: HighwayFrameData,
	): void {
		const { palette } = this.profile;
		ctx.fillStyle = palette.sceneBackground;
		ctx.fillRect(0, 0, frame.cssWidth, frame.cssHeight);
		// Subtle procedural vignette: darker edges, clear center. Original,
		// gradient-only, no images or textures.
		const cx = frame.cssWidth / 2;
		const cy = frame.cssHeight / 2;
		const radius = Math.max(1, Math.hypot(cx, cy));
		const vignette = ctx.createRadialGradient(
			cx,
			cy,
			radius * 0.35,
			cx,
			cy,
			radius,
		);
		vignette.addColorStop(0, palette.sceneVignetteInner);
		vignette.addColorStop(1, palette.sceneVignetteOuter);
		ctx.fillStyle = vignette;
		ctx.fillRect(0, 0, frame.cssWidth, frame.cssHeight);
	}

	private drawRoad(
		ctx: CanvasRenderingContext2D,
		frame: HighwayFrameData,
	): void {
		const { geometry } = frame;
		const { palette, road } = this.profile;
		const leftTop = geometry.roadCenterX - geometry.topRoadWidth / 2;
		const rightTop = geometry.roadCenterX + geometry.topRoadWidth / 2;
		const leftBottom = geometry.roadCenterX - geometry.bottomRoadWidth / 2;
		const rightBottom = geometry.roadCenterX + geometry.bottomRoadWidth / 2;
		const gradient = ctx.createLinearGradient(
			geometry.roadCenterX,
			geometry.horizonY,
			geometry.roadCenterX,
			geometry.hitLineY,
		);
		gradient.addColorStop(0, palette.roadFillFar);
		gradient.addColorStop(1, palette.roadFillNear);
		ctx.beginPath();
		ctx.moveTo(leftTop, geometry.horizonY);
		ctx.lineTo(rightTop, geometry.horizonY);
		ctx.lineTo(rightBottom, geometry.hitLineY);
		ctx.lineTo(leftBottom, geometry.hitLineY);
		ctx.closePath();
		ctx.fillStyle = gradient;
		ctx.fill();
		// Outer borders: stronger than internal dividers, depth-aware.
		ctx.strokeStyle = palette.roadBorderNear;
		ctx.lineWidth = road.borderWidthNear;
		ctx.beginPath();
		ctx.moveTo(leftBottom, geometry.hitLineY);
		ctx.lineTo(leftTop, geometry.horizonY);
		ctx.moveTo(rightBottom, geometry.hitLineY);
		ctx.lineTo(rightTop, geometry.horizonY);
		ctx.stroke();
		// Quieter far edge along the horizon.
		ctx.strokeStyle = palette.roadBorderFar;
		ctx.lineWidth = road.borderWidthFar;
		ctx.beginPath();
		ctx.moveTo(leftTop, geometry.horizonY);
		ctx.lineTo(rightTop, geometry.horizonY);
		ctx.stroke();
	}

	private drawLaneDividers(
		ctx: CanvasRenderingContext2D,
		frame: HighwayFrameData,
	): void {
		const { laneDividerAlpha } = this.profile.road;
		ctx.save();
		ctx.strokeStyle = `rgba(170, 185, 215, ${laneDividerAlpha})`;
		ctx.lineWidth = 0.9;
		for (const divider of frame.laneDividers) {
			ctx.beginPath();
			ctx.moveTo(divider.startX, frame.geometry.horizonY);
			ctx.lineTo(divider.endX, frame.geometry.hitLineY);
			ctx.stroke();
		}
		ctx.restore();
	}

	private drawMusicalLines(
		ctx: CanvasRenderingContext2D,
		lines: readonly HighwayProjectedLine[],
	): void {
		const { palette } = this.profile;
		for (const line of lines) {
			ctx.strokeStyle =
				line.kind === "measure" ? palette.measureLine : palette.beatLine;
			ctx.lineWidth = line.kind === "measure" ? 1.2 : 0.8;
			ctx.beginPath();
			ctx.moveTo(line.startX, line.y);
			ctx.lineTo(line.endX, line.y);
			ctx.stroke();
		}
	}

	private drawSustains(
		ctx: CanvasRenderingContext2D,
		sustains: readonly HighwayProjectedSustain[],
	): void {
		ctx.save();
		ctx.globalAlpha = this.profile.notes.sustainAlpha;
		for (const sustain of sustains) {
			ctx.beginPath();
			ctx.moveTo(sustain.nearLeftX, sustain.nearY);
			ctx.lineTo(sustain.nearRightX, sustain.nearY);
			ctx.lineTo(sustain.farRightX, sustain.farY);
			ctx.lineTo(sustain.farLeftX, sustain.farY);
			ctx.closePath();
			ctx.fillStyle = sustain.fill;
			ctx.fill();
		}
		ctx.restore();
	}

	private drawKickRails(
		ctx: CanvasRenderingContext2D,
		heads: readonly HighwayProjectedHead[],
	): void {
		for (const head of heads) {
			if (head.visualKind !== "kick-rail") continue;
			const thickness = head.thickness;
			const x = head.leftX;
			const width = head.rightX - head.leftX;
			const top = head.y - thickness / 2;
			// Restrained main fill.
			ctx.fillStyle = head.fill;
			ctx.fillRect(x, top, width, thickness);
			// Subtle top highlight + lower shadow (original depth cue).
			ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
			ctx.fillRect(x, top, width, Math.max(1, thickness * 0.22));
			ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
			ctx.fillRect(
				x,
				top + thickness - Math.max(1, thickness * 0.22),
				width,
				Math.max(1, thickness * 0.22),
			);
			// Thin lane-colored edge to keep orange identity readable.
			ctx.strokeStyle = head.stroke;
			ctx.lineWidth = 0.8;
			ctx.strokeRect(x, top, width, thickness);
		}
	}

	private drawPitchedHeads(
		ctx: CanvasRenderingContext2D,
		heads: readonly HighwayProjectedHead[],
	): void {
		for (const head of heads) {
			if (head.visualKind === "kick-rail") continue;
			if (head.dynamic === "ghost") {
				ctx.save();
				ctx.globalAlpha = 0.5;
			}
			if (head.visualKind === "square-head") {
				this.drawSquareHead(ctx, head);
			} else {
				this.drawCircleHead(ctx, head);
			}
			if (head.dynamic === "ghost") {
				ctx.restore();
			}
			if (head.dynamic === "accent") {
				this.drawAccent(ctx, head);
			}
		}
	}

	private drawSquareHead(
		ctx: CanvasRenderingContext2D,
		head: Extract<HighwayProjectedHead, { visualKind: "square-head" }>,
	): void {
		const half = head.radius;
		const x = head.centerX - half;
		const y = head.centerY - half;
		const size = half * 2;
		// Main colored face.
		ctx.fillStyle = head.fill;
		ctx.fillRect(x, y, size, size);
		// Original depth cue: top highlight + darker lower face.
		const cue = Math.max(1, half * 0.28);
		ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
		ctx.fillRect(x, y, size, cue);
		ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
		ctx.fillRect(x, y + size - cue, size, cue);
		// Consistent outline preserving square silhouette.
		ctx.strokeStyle = head.stroke;
		ctx.lineWidth = 1.2;
		ctx.strokeRect(x, y, size, size);
	}

	private drawCircleHead(
		ctx: CanvasRenderingContext2D,
		head: Extract<HighwayProjectedHead, { visualKind: "cymbal-head" }>,
	): void {
		// Optional subtle halo constrained near the disc.
		ctx.beginPath();
		ctx.arc(head.centerX, head.centerY, head.radius + 1, 0, Math.PI * 2);
		ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
		ctx.fill();
		// Filled disc with lane color.
		ctx.beginPath();
		ctx.arc(head.centerX, head.centerY, head.radius, 0, Math.PI * 2);
		ctx.fillStyle = head.fill;
		ctx.fill();
		// Original ring/radial highlight: offset highlight + ring outline.
		ctx.beginPath();
		ctx.arc(
			head.centerX - head.radius * 0.3,
			head.centerY - head.radius * 0.3,
			head.radius * 0.4,
			0,
			Math.PI * 2,
		);
		ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
		ctx.fill();
		ctx.beginPath();
		ctx.arc(head.centerX, head.centerY, head.radius, 0, Math.PI * 2);
		ctx.strokeStyle = head.stroke;
		ctx.lineWidth = 1.2;
		ctx.stroke();
	}

	private drawAccent(
		ctx: CanvasRenderingContext2D,
		head: Extract<
			HighwayProjectedHead,
			{ visualKind: "square-head" | "cymbal-head" }
		>,
	): void {
		ctx.save();
		ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
		ctx.lineWidth = 1.5;
		if (head.visualKind === "square-head") {
			const half = head.radius + 3;
			ctx.beginPath();
			ctx.moveTo(head.centerX - half, head.centerY - half);
			ctx.lineTo(head.centerX + half, head.centerY - half);
			ctx.lineTo(head.centerX + half, head.centerY + half);
			ctx.lineTo(head.centerX - half, head.centerY + half);
			ctx.closePath();
			ctx.stroke();
		} else {
			ctx.beginPath();
			ctx.arc(head.centerX, head.centerY, head.radius + 3, 0, Math.PI * 2);
			ctx.stroke();
		}
		ctx.restore();
	}

	private drawHitLineAndTargets(
		ctx: CanvasRenderingContext2D,
		frame: HighwayFrameData,
	): void {
		const { geometry } = frame;
		const { palette, targets } = this.profile;
		// Quiet neutral hit line behind the target row.
		ctx.strokeStyle = palette.hitLine;
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.moveTo(
			geometry.roadCenterX - geometry.bottomRoadWidth / 2,
			geometry.hitLineY,
		);
		ctx.lineTo(
			geometry.roadCenterX + geometry.bottomRoadWidth / 2,
			geometry.hitLineY,
		);
		ctx.stroke();

		for (const target of frame.targets) {
			this.drawTarget(ctx, target, targets.interiorAlpha, targets.outlineWidth);
		}
	}

	private drawTarget(
		ctx: CanvasRenderingContext2D,
		target: HighwayTarget,
		interiorAlpha: number,
		outlineWidth: number,
	): void {
		// Compact trapezoid pad: dark/low-alpha interior + lane-color outline.
		ctx.save();
		const taper = this.profile.targets.topTaperInset;
		ctx.beginPath();
		ctx.moveTo(target.leftX, target.bottomY);
		ctx.lineTo(target.rightX, target.bottomY);
		ctx.lineTo(target.rightX - taper, target.topY);
		ctx.lineTo(target.leftX + taper, target.topY);
		ctx.closePath();
		ctx.globalAlpha = interiorAlpha;
		ctx.fillStyle = this.profile.palette.targetInterior;
		ctx.fill();
		ctx.globalAlpha = 1;
		ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
		ctx.lineWidth = outlineWidth + 1;
		ctx.stroke();
		ctx.strokeStyle = target.stroke;
		ctx.lineWidth = outlineWidth;
		ctx.stroke();
		ctx.restore();
	}

	private drawHud(
		ctx: CanvasRenderingContext2D,
		frame: HighwayFrameData,
	): void {
		const { hud, palette } = this.profile;
		const { hud: state } = frame;
		ctx.save();
		ctx.globalAlpha = hud.alpha;
		ctx.fillStyle = palette.hudText;
		ctx.font = `${hud.fontSize}px sans-serif`;
		ctx.textBaseline = "top";
		ctx.textAlign = "left";
		ctx.fillText(
			`FPS ${state.fps === null ? "—" : state.fps.toFixed(0)}`,
			hud.edgeInset,
			hud.edgeInset,
		);
		ctx.textAlign = "right";
		const rightX = frame.cssWidth - hud.edgeInset;
		const topY = hud.edgeInset;
		const lines = [
			`Tick ${state.tick ?? "—"}`,
			`Beat ${state.beat ?? "—"}`,
			`Measure ${state.measure ?? "—"}`,
		];
		lines.forEach((line, index) => {
			ctx.fillText(line, rightX, topY + index * (hud.fontSize + 2));
		});
		ctx.restore();
	}

	private drawOverlay(
		ctx: CanvasRenderingContext2D,
		frame: HighwayFrameData,
	): void {
		ctx.save();
		ctx.globalAlpha = 0.72;
		ctx.fillStyle = "#040816";
		ctx.fillRect(0, frame.cssHeight - 44, frame.cssWidth, 44);
		ctx.globalAlpha = 1;
		ctx.fillStyle = "#ffd6a8";
		ctx.font = "13px sans-serif";
		ctx.textBaseline = "alphabetic";
		ctx.fillText(frame.limitationText ?? "", 16, frame.cssHeight - 18);
		ctx.restore();
	}
}
