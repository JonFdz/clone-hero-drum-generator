import {
	HIGHWAY_LANES,
	type HighwayFrameData,
	type HighwayProjectedLine,
	type HighwayProjectedNote,
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
		this.drawNotes(ctx, frame.notes);
		this.drawHitLine(ctx, frame);
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
		const { geometry } = frame;
		ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
		ctx.lineWidth = 1;
		for (let lane = 1; lane < HIGHWAY_LANES.length; lane += 1) {
			const topX =
				geometry.roadCenterX - geometry.topRoadWidth / 2 +
				(geometry.topRoadWidth / HIGHWAY_LANES.length) * lane;
			const bottomX =
				geometry.roadCenterX - geometry.bottomRoadWidth / 2 +
				(geometry.bottomRoadWidth / HIGHWAY_LANES.length) * lane;
			ctx.beginPath();
			ctx.moveTo(topX, geometry.horizonY);
			ctx.lineTo(bottomX, geometry.hitLineY);
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

	private drawNotes(
		ctx: CanvasRenderingContext2D,
		notes: readonly HighwayProjectedNote[],
	): void {
		for (const note of notes) {
			const style = HIGHWAY_LANES[note.lane]!;
			ctx.beginPath();
			ctx.arc(note.centerX, note.centerY, note.radius, 0, Math.PI * 2);
			ctx.fillStyle = style.fill;
			ctx.fill();
			ctx.strokeStyle = style.stroke;
			ctx.lineWidth = 2;
			ctx.stroke();
		}
	}

	private drawHitLine(ctx: CanvasRenderingContext2D, frame: HighwayFrameData): void {
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
