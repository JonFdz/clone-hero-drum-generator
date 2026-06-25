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
		gradient.addColorStop(0.62, "#09101a");
		gradient.addColorStop(1, palette.roadFillNear);
		ctx.beginPath();
		ctx.moveTo(leftTop, geometry.horizonY);
		ctx.lineTo(rightTop, geometry.horizonY);
		ctx.lineTo(rightBottom, geometry.hitLineY);
		ctx.lineTo(leftBottom, geometry.hitLineY);
		ctx.closePath();
		ctx.fillStyle = gradient;
		ctx.fill();
		ctx.save();
		ctx.strokeStyle = `rgba(170, 188, 222, ${road.borderGlowAlpha})`;
		ctx.lineWidth = road.borderWidthNear + 1.8;
		ctx.beginPath();
		ctx.moveTo(leftBottom, geometry.hitLineY);
		ctx.lineTo(leftTop, geometry.horizonY);
		ctx.moveTo(rightBottom, geometry.hitLineY);
		ctx.lineTo(rightTop, geometry.horizonY);
		ctx.stroke();
		ctx.restore();
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
			const gradient = ctx.createLinearGradient(x, top, x, top + thickness);
			gradient.addColorStop(0, "rgba(255, 196, 120, 0.92)");
			gradient.addColorStop(0.28, head.fill);
			gradient.addColorStop(1, "rgba(176, 86, 26, 0.96)");
			ctx.fillStyle = gradient;
			ctx.fillRect(x, top, width, thickness);
			ctx.fillStyle = `rgba(255, 255, 255, ${this.profile.notes.kickHighlightAlpha})`;
			ctx.fillRect(x, top, width, Math.max(1, thickness * 0.24));
			ctx.fillStyle = `rgba(0, 0, 0, ${this.profile.notes.kickShadowAlpha})`;
			ctx.fillRect(
				x,
				top + thickness - Math.max(1, thickness * 0.28),
				width,
				Math.max(1, thickness * 0.28),
			);
			ctx.strokeStyle = head.stroke;
			ctx.lineWidth = this.profile.notes.kickOutlineWidth;
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
		const inset = Math.max(1, half * this.profile.notes.squareFaceInsetRatio);
		ctx.fillStyle = head.fill;
		ctx.fillRect(x, y, size, size);
		ctx.fillStyle = `rgba(255, 255, 255, ${this.profile.notes.squareHighlightAlpha})`;
		ctx.fillRect(x, y, size, Math.max(1, half * 0.24));
		ctx.fillStyle = `rgba(0, 0, 0, ${this.profile.notes.squareShadowAlpha})`;
		ctx.fillRect(x, y + size - Math.max(1, half * 0.3), size, Math.max(1, half * 0.3));
		ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
		ctx.fillRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
		ctx.strokeStyle = head.stroke;
		ctx.lineWidth = 1.2;
		ctx.strokeRect(x, y, size, size);
	}
	private drawCircleHead(
		ctx: CanvasRenderingContext2D,
		head: Extract<HighwayProjectedHead, { visualKind: "cymbal-head" }>,
	): void {
		ctx.beginPath();
		ctx.arc(head.centerX, head.centerY, head.radius + 1.2, 0, Math.PI * 2);
		ctx.fillStyle = `rgba(255, 255, 255, ${this.profile.notes.circleHaloAlpha})`;
		ctx.fill();
		const disc = ctx.createRadialGradient(
			head.centerX - head.radius * 0.25,
			head.centerY - head.radius * 0.25,
			head.radius * 0.2,
			head.centerX,
			head.centerY,
			head.radius,
		);
		disc.addColorStop(0, "rgba(255, 255, 255, 0.18)");
		disc.addColorStop(0.38, head.fill);
		disc.addColorStop(1, "rgba(18, 24, 40, 0.42)");
		ctx.beginPath();
		ctx.arc(head.centerX, head.centerY, head.radius, 0, Math.PI * 2);
		ctx.fillStyle = disc;
		ctx.fill();
		ctx.beginPath();
		ctx.arc(
			head.centerX - head.radius * 0.32,
			head.centerY - head.radius * 0.34,
			head.radius * 0.36,
			0,
			Math.PI * 2,
		);
		ctx.fillStyle = `rgba(255, 255, 255, ${this.profile.notes.circleHighlightAlpha})`;
		ctx.fill();
		ctx.beginPath();
		ctx.arc(head.centerX, head.centerY, head.radius * 0.82, 0, Math.PI * 2);
		ctx.strokeStyle = `rgba(0, 0, 0, ${this.profile.notes.circleInnerShadeAlpha})`;
		ctx.lineWidth = 1;
		ctx.stroke();
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
		const zoneLeft = geometry.roadCenterX - geometry.bottomRoadWidth / 2;
		const zoneRight = geometry.roadCenterX + geometry.bottomRoadWidth / 2;
		const platformTop = geometry.hitLineY - targets.platformHeight;
		const platformBottom = geometry.hitLineY + targets.platformDepth;
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(zoneLeft, platformBottom);
		ctx.lineTo(zoneRight, platformBottom);
		ctx.lineTo(zoneRight - 10, platformTop);
		ctx.lineTo(zoneLeft + 10, platformTop);
		ctx.closePath();
		ctx.globalAlpha = targets.platformAlpha;
		ctx.fillStyle = "#02060d";
		ctx.fill();
		ctx.globalAlpha = 1;
		ctx.strokeStyle = `rgba(210, 220, 238, ${targets.platformEdgeAlpha})`;
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.moveTo(zoneLeft + 10, platformTop);
		ctx.lineTo(zoneRight - 10, platformTop);
		ctx.stroke();
		ctx.restore();
		ctx.strokeStyle = palette.hitLine;
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.moveTo(zoneLeft, geometry.hitLineY);
		ctx.lineTo(zoneRight, geometry.hitLineY);
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
		ctx.save();
		const taper = this.profile.targets.topTaperInset;
		const gradient = ctx.createLinearGradient(0, target.topY, 0, target.bottomY);
		gradient.addColorStop(0, "rgba(18, 24, 36, 0.96)");
		gradient.addColorStop(1, this.profile.palette.targetInterior);
		ctx.beginPath();
		ctx.moveTo(target.leftX, target.bottomY);
		ctx.lineTo(target.rightX, target.bottomY);
		ctx.lineTo(target.rightX - taper, target.topY);
		ctx.lineTo(target.leftX + taper, target.topY);
		ctx.closePath();
		ctx.globalAlpha = interiorAlpha;
		ctx.fillStyle = gradient;
		ctx.fill();
		ctx.globalAlpha = 1;
		ctx.strokeStyle = `rgba(255, 255, 255, ${this.profile.targets.neutralOutlineAlpha})`;
		ctx.lineWidth = outlineWidth + 1.2;
		ctx.stroke();
		ctx.strokeStyle = target.stroke;
		ctx.lineWidth = outlineWidth;
		ctx.stroke();
		ctx.strokeStyle = target.stroke;
		ctx.globalAlpha = this.profile.targets.laneGlowAlpha;
		ctx.lineWidth = outlineWidth + 2.8;
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
