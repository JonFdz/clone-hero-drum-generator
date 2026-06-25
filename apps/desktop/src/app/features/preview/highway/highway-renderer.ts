import type {
	HighwayFrameData,
	HighwayProjectedHead,
	HighwayProjectedLine,
	HighwayProjectedSustain,
	HighwayTarget,
} from "./highway-model";

export class HighwayRenderer {
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
		this.drawHeads(ctx, frame.heads);
		this.drawHitLineAndTargets(ctx, frame);
		if (frame.hudEnabled) this.drawHud(ctx, frame);
		if (frame.limitationText) this.drawOverlay(ctx, frame);
	}

	private drawBackground(
		ctx: CanvasRenderingContext2D,
		frame: HighwayFrameData,
	): void {
		ctx.fillStyle = "#040816";
		ctx.fillRect(0, 0, frame.cssWidth, frame.cssHeight);
	}

	private drawRoad(ctx: CanvasRenderingContext2D, frame: HighwayFrameData): void {
		const { geometry } = frame;
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
		gradient.addColorStop(0, "#15243d");
		gradient.addColorStop(1, "#0b1222");
		ctx.beginPath();
		ctx.moveTo(leftTop, geometry.horizonY);
		ctx.lineTo(rightTop, geometry.horizonY);
		ctx.lineTo(rightBottom, geometry.hitLineY);
		ctx.lineTo(leftBottom, geometry.hitLineY);
		ctx.closePath();
		ctx.fillStyle = gradient;
		ctx.fill();
		ctx.strokeStyle = "rgba(135, 170, 255, 0.38)";
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	private drawLaneDividers(
		ctx: CanvasRenderingContext2D,
		frame: HighwayFrameData,
	): void {
		ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
		ctx.lineWidth = 1;
		for (const divider of frame.laneDividers) {
			ctx.beginPath();
			ctx.moveTo(divider.startX, frame.geometry.horizonY);
			ctx.lineTo(divider.endX, frame.geometry.hitLineY);
			ctx.stroke();
		}
	}

	private drawMusicalLines(
		ctx: CanvasRenderingContext2D,
		lines: readonly HighwayProjectedLine[],
	): void {
		for (const line of lines) {
			ctx.strokeStyle =
				line.kind === "measure"
					? "rgba(255, 255, 255, 0.34)"
					: "rgba(255, 255, 255, 0.16)";
			ctx.lineWidth = line.kind === "measure" ? 2 : 1;
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
	}

	private drawHeads(
		ctx: CanvasRenderingContext2D,
		heads: readonly HighwayProjectedHead[],
	): void {
		for (const head of heads) {
			if (head.visualKind === "kick-rail") {
				const thickness = head.thickness;
				ctx.fillStyle = head.fill;
				ctx.fillRect(head.leftX, head.y - thickness / 2, head.rightX - head.leftX, thickness);
				ctx.strokeStyle = head.stroke;
				ctx.lineWidth = 2;
				ctx.strokeRect?.(head.leftX, head.y - thickness / 2, head.rightX - head.leftX, thickness);
				continue;
			}
			if (head.dynamic === "ghost") {
				ctx.save();
				ctx.globalAlpha = 0.48;
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
		ctx.beginPath();
		ctx.moveTo(head.centerX - half, head.centerY - half);
		ctx.lineTo(head.centerX + half, head.centerY - half);
		ctx.lineTo(head.centerX + half, head.centerY + half);
		ctx.lineTo(head.centerX - half, head.centerY + half);
		ctx.closePath();
		ctx.fillStyle = head.fill;
		ctx.fill();
		ctx.strokeStyle = head.stroke;
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	private drawCircleHead(
		ctx: CanvasRenderingContext2D,
		head: Extract<HighwayProjectedHead, { visualKind: "cymbal-head" }>,
	): void {
		ctx.beginPath();
		ctx.arc(head.centerX, head.centerY, head.radius, 0, Math.PI * 2);
		ctx.fillStyle = head.fill;
		ctx.fill();
		ctx.strokeStyle = head.stroke;
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	private drawAccent(
		ctx: CanvasRenderingContext2D,
		head: Extract<HighwayProjectedHead, { visualKind: "square-head" | "cymbal-head" }>,
	): void {
		ctx.save();
		ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
		ctx.lineWidth = 2;
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
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = 3;
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
			this.drawTarget(ctx, target);
		}
	}

	private drawTarget(ctx: CanvasRenderingContext2D, target: HighwayTarget): void {
		ctx.beginPath();
		ctx.moveTo(target.leftX, target.bottomY);
		ctx.lineTo(target.rightX, target.bottomY);
		ctx.lineTo(target.rightX - 5, target.topY);
		ctx.lineTo(target.leftX + 5, target.topY);
		ctx.closePath();
		ctx.fillStyle = target.fill;
		ctx.fill();
		ctx.strokeStyle = target.stroke;
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	private drawHud(ctx: CanvasRenderingContext2D, frame: HighwayFrameData): void {
		const { hud } = frame;
		const lines = [
			`Time ${hud.currentTimeSeconds.toFixed(2)}s`,
			`Tick ${hud.tick ?? "—"}`,
			`Beat ${hud.beat ?? "—"}`,
			`Measure ${hud.measure ?? "—"}`,
			`FPS ${hud.fps === null ? "—" : hud.fps.toFixed(0)}`,
		];
		ctx.fillStyle = "rgba(4, 8, 22, 0.78)";
		ctx.fillRect(16, 16, 156, 116);
		ctx.fillStyle = "#d7e4ff";
		ctx.font = "12px sans-serif";
		lines.forEach((line, index) => {
			ctx.fillText(line, 28, 40 + index * 18);
		});
	}

	private drawOverlay(ctx: CanvasRenderingContext2D, frame: HighwayFrameData): void {
		ctx.fillStyle = "rgba(4, 8, 22, 0.72)";
		ctx.fillRect(0, frame.cssHeight - 54, frame.cssWidth, 54);
		ctx.fillStyle = "#ffd6a8";
		ctx.font = "13px sans-serif";
		ctx.fillText(frame.limitationText ?? "", 16, frame.cssHeight - 22);
	}
}
