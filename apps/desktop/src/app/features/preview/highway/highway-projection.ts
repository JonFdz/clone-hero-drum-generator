import {
	HIGHWAY_LANES,
	type HighwayGeometry,
	type HighwayLaneId,
	type HighwayProjectedLine,
	type HighwayProjectedNote,
	type HighwaySourceNote,
	type HighwaySpeedPreset,
} from "./highway-model";
import type { HighwayMusicalLine } from "./highway-timing";

export function buildHighwaySourceNotes(
	noteEvents: ReadonlyArray<{ tick: number; lane: number; seconds: number }>,
): HighwaySourceNote[] {
	const occurrenceByTickLane = new Map<string, number>();
	return noteEvents
		.filter(isValidHighwayNoteEvent)
		.map((event) => {
			const key = `${event.tick}-${event.lane}`;
			const occurrence = occurrenceByTickLane.get(key) ?? 0;
			occurrenceByTickLane.set(key, occurrence + 1);
			return {
				id: `${event.tick}-${event.lane}-${occurrence}`,
				tick: event.tick,
				lane: event.lane,
				chartSeconds: event.seconds,
			} satisfies HighwaySourceNote;
		})
		.sort(
			(a, b) =>
				a.chartSeconds - b.chartSeconds ||
				a.tick - b.tick ||
				a.lane - b.lane ||
				a.id.localeCompare(b.id),
		);
}

export function filterVisibleHighwayNotes(
	notes: readonly HighwaySourceNote[],
	startChartSeconds: number,
	endChartSeconds: number,
): HighwaySourceNote[] {
	const start = lowerBound(notes, startChartSeconds);
	const end = upperBound(notes, endChartSeconds);
	return notes.slice(start, end);
}

export function buildHighwayGeometry(
	cssWidth: number,
	cssHeight: number,
): HighwayGeometry {
	const safeWidth = Math.max(0, cssWidth);
	const safeHeight = Math.max(0, cssHeight);
	const horizonY = safeHeight * 0.18;
	const hitLineY = safeHeight * 0.82;
	const topRoadWidth = Math.max(260, Math.min(safeWidth * 0.22, 260));
	const bottomRoadWidth = Math.max(260, Math.min(safeWidth * 0.84, 980));
	const horizonLaneWidth = topRoadWidth / HIGHWAY_LANES.length;
	const hitLineLaneWidth = bottomRoadWidth / HIGHWAY_LANES.length;
	return {
		cssWidth: safeWidth,
		cssHeight: safeHeight,
		horizonY,
		hitLineY,
		roadCenterX: safeWidth * 0.5,
		topRoadWidth,
		bottomRoadWidth,
		minimumReadable:
			safeHeight >= 280 &&
			horizonLaneWidth >= 14 &&
			hitLineLaneWidth >= 42,
	};
}

export function projectHighwayNotes(input: {
	notes: readonly HighwaySourceNote[];
	playbackSeconds: number;
	previewOffsetSeconds: number;
	preset: HighwaySpeedPreset;
	geometry: HighwayGeometry;
}): HighwayProjectedNote[] {
	return input.notes
		.map((note) => {
			const effectiveSeconds = note.chartSeconds + input.previewOffsetSeconds;
			const deltaSeconds = effectiveSeconds - input.playbackSeconds;
			const progress = clamp(
				deltaSeconds / input.preset.lookAheadSeconds,
				0,
				1,
			);
			const depth = easeOutCubic(progress);
			const centerY = lerp(input.geometry.hitLineY, input.geometry.horizonY, depth);
			const roadWidth = lerp(
				input.geometry.bottomRoadWidth,
				input.geometry.topRoadWidth,
				depth,
			);
			const laneWidth = roadWidth / HIGHWAY_LANES.length;
			const roadLeft = input.geometry.roadCenterX - roadWidth / 2;
			return {
				id: note.id,
				lane: note.lane,
				centerX: roadLeft + (note.lane + 0.5) * laneWidth,
				centerY,
				radius: lerp(18, 5, depth),
				depth,
				effectiveSeconds,
			} satisfies HighwayProjectedNote;
		})
		.sort(
			(a, b) =>
				a.centerY - b.centerY ||
				a.lane - b.lane ||
				a.id.localeCompare(b.id),
		);
}

export function projectHighwayLines(input: {
	lines: readonly HighwayMusicalLine[];
	playbackSeconds: number;
	previewOffsetSeconds: number;
	preset: HighwaySpeedPreset;
	geometry: HighwayGeometry;
}): HighwayProjectedLine[] {
	return input.lines
		.map((line) => {
			const effectiveSeconds = line.chartSeconds + input.previewOffsetSeconds;
			const deltaSeconds = effectiveSeconds - input.playbackSeconds;
			const progress = clamp(
				deltaSeconds / input.preset.lookAheadSeconds,
				0,
				1,
			);
			const depth = easeOutCubic(progress);
			const y = lerp(input.geometry.hitLineY, input.geometry.horizonY, depth);
			const roadWidth = lerp(
				input.geometry.bottomRoadWidth,
				input.geometry.topRoadWidth,
				depth,
			);
			return {
				tick: line.tick,
				kind: line.kind,
				startX: input.geometry.roadCenterX - roadWidth / 2,
				endX: input.geometry.roadCenterX + roadWidth / 2,
				y,
				depth,
			} satisfies HighwayProjectedLine;
		})
		.sort((a, b) => a.y - b.y || a.tick - b.tick);
}

export function visibleChartWindow(input: {
	playbackSeconds: number;
	previewOffsetSeconds: number;
	preset: HighwaySpeedPreset;
}): { startChartSeconds: number; endChartSeconds: number } {
	const chartSecondsAtPlayback = Math.max(
		0,
		input.playbackSeconds - input.previewOffsetSeconds,
	);
	return {
		startChartSeconds: Math.max(
			0,
			chartSecondsAtPlayback - input.preset.lookBehindSeconds,
		),
		endChartSeconds: Math.max(
			0,
			chartSecondsAtPlayback + input.preset.lookAheadSeconds,
		),
	};
}

function lowerBound(
	notes: readonly HighwaySourceNote[],
	target: number,
): number {
	let low = 0;
	let high = notes.length;
	while (low < high) {
		const mid = Math.floor((low + high) / 2);
		if (notes[mid]!.chartSeconds < target) low = mid + 1;
		else high = mid;
	}
	return low;
}

function upperBound(
	notes: readonly HighwaySourceNote[],
	target: number,
): number {
	let low = 0;
	let high = notes.length;
	while (low < high) {
		const mid = Math.floor((low + high) / 2);
		if (notes[mid]!.chartSeconds <= target) low = mid + 1;
		else high = mid;
	}
	return low;
}

function isHighwayLane(lane: number): lane is HighwayLaneId {
	return lane >= 0 && lane <= 4;
}

function isValidHighwayNoteEvent(event: {
	tick: number;
	lane: number;
	seconds: number;
}): event is { tick: number; lane: HighwayLaneId; seconds: number } {
	return (
		isHighwayLane(event.lane) &&
		Number.isFinite(event.tick) &&
		Number.isFinite(event.seconds)
	);
}

export function easeOutCubic(value: number): number {
	return 1 - (1 - value) ** 3;
}

function lerp(start: number, end: number, progress: number): number {
	return start + (end - start) * progress;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}
