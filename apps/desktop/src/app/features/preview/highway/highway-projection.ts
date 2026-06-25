import {
	HIGHWAY_KICK_STYLE,
	HIGHWAY_PITCHED_LANES,
	type HighwayGeometry,
	type HighwayLaneDivider,
	type HighwayProjectedHead,
	type HighwayProjectedLine,
	type HighwayProjectedSustain,
	type HighwayRoadBounds,
	type HighwaySemanticNote,
	type HighwaySpeedPreset,
	type HighwayTarget,
} from "./highway-model";
import {
	HIGHWAY_STAGE_VISUAL_PROFILE,
	type HighwayStageVisualProfile,
	stageDepthForProgress,
} from "./highway-stage-visual-profile";
import type { HighwayMusicalLine } from "./highway-timing";

export function filterVisibleHighwayNotes(
	notes: readonly HighwaySemanticNote[],
	startChartSeconds: number,
	endChartSeconds: number,
): HighwaySemanticNote[] {
	return notes.filter(
		(note) =>
			note.chartSeconds <= endChartSeconds &&
			note.endChartSeconds >= startChartSeconds,
	);
}

/**
 * Builds the stage highway geometry from the visual profile.
 *
 * The playable road lives inside a bounded, centered viewport whose width is
 * derived from both a ratio of the canvas width and a profile-owned maximum.
 * On wide canvases the road stays materially narrower than the canvas with
 * dark scene space on both sides; on narrow canvases it retains safe side
 * padding. Horizon and hit line are profile-owned ratios.
 */
export function buildHighwayGeometry(
	cssWidth: number,
	cssHeight: number,
	profile: HighwayStageVisualProfile = HIGHWAY_STAGE_VISUAL_PROFILE,
): HighwayGeometry {
	const safeWidth = Math.max(0, cssWidth);
	const safeHeight = Math.max(0, cssHeight);
	const horizonY = safeHeight * profile.scene.horizonRatio;
	const hitLineY = safeHeight * profile.scene.hitLineRatio;
	const maxAvailable = Math.max(
		0,
		safeWidth - profile.scene.sideScenePadding * 2,
	);
	const idealViewport = safeWidth * profile.scene.roadViewportWidthRatio;
	const roadViewport = clamp(
		idealViewport,
		profile.scene.minRoadViewportWidth,
		Math.min(profile.scene.maxRoadViewportWidth, maxAvailable),
	);
	const bottomRoadWidth = roadViewport * profile.road.bottomWidthRatio;
	const topRoadWidth = roadViewport * profile.road.topWidthRatio;
	const horizonLaneWidth = topRoadWidth / HIGHWAY_PITCHED_LANES.length;
	const hitLineLaneWidth = bottomRoadWidth / HIGHWAY_PITCHED_LANES.length;
	return {
		cssWidth: safeWidth,
		cssHeight: safeHeight,
		horizonY,
		hitLineY,
		roadCenterX: safeWidth * 0.5,
		topRoadWidth,
		bottomRoadWidth,
		pitchedLaneCount: 4,
		minimumReadable:
			safeHeight >= 280 && horizonLaneWidth >= 14 && hitLineLaneWidth >= 48,
	};
}

export function buildHighwayLaneCenters(
	geometry: HighwayGeometry,
	depth = 0,
): number[] {
	const bounds = roadBoundsAtDepth(geometry, depth);
	return HIGHWAY_PITCHED_LANES.map(
		(_, index) => bounds.leftX + (index + 0.5) * bounds.laneWidth,
	);
}

export function buildHighwayLaneDividers(
	geometry: HighwayGeometry,
): HighwayLaneDivider[] {
	return Array.from(
		{ length: HIGHWAY_PITCHED_LANES.length - 1 },
		(_, index) => {
			const lane = index + 1;
			return {
				startX:
					geometry.roadCenterX -
					geometry.topRoadWidth / 2 +
					(geometry.topRoadWidth / HIGHWAY_PITCHED_LANES.length) * lane,
				endX:
					geometry.roadCenterX -
					geometry.bottomRoadWidth / 2 +
					(geometry.bottomRoadWidth / HIGHWAY_PITCHED_LANES.length) * lane,
			};
		},
	);
}

export function buildHighwayTargets(
	geometry: HighwayGeometry,
	profile: HighwayStageVisualProfile = HIGHWAY_STAGE_VISUAL_PROFILE,
): HighwayTarget[] {
	const bounds = roadBoundsAtDepth(geometry, 0);
	const targetHeight = Math.max(
		9,
		Math.min(profile.targets.heightNear, geometry.cssHeight * 0.04),
	);
	const inset = Math.max(4, bounds.laneWidth * profile.targets.laneInsetRatio);
	return HIGHWAY_PITCHED_LANES.map((lane, index) => {
		const laneLeft = bounds.leftX + index * bounds.laneWidth + inset;
		const laneRight = bounds.leftX + (index + 1) * bounds.laneWidth - inset;
		return {
			lane: lane.id,
			leftX: laneLeft,
			rightX: laneRight,
			topY: geometry.hitLineY - targetHeight,
			bottomY:
				geometry.hitLineY + targetHeight * profile.targets.bottomLipRatio,
			fill: lane.fill,
			stroke: lane.stroke,
		};
	});
}

export function projectKickRailAtDepth(
	geometry: HighwayGeometry,
	depth: number,
): { leftX: number; rightX: number; width: number } {
	const bounds = roadBoundsAtDepth(geometry, depth);
	const inset = Math.max(8, bounds.width * 0.04);
	const leftX = bounds.leftX + inset;
	const rightX = Math.max(leftX, bounds.rightX - inset);
	return { leftX, rightX, width: Math.max(0, rightX - leftX) };
}

export function projectHighwayNotes(input: {
	notes: readonly HighwaySemanticNote[];
	playbackSeconds: number;
	previewOffsetSeconds: number;
	preset: HighwaySpeedPreset;
	geometry: HighwayGeometry;
	profile?: HighwayStageVisualProfile;
}): {
	heads: HighwayProjectedHead[];
	sustains: HighwayProjectedSustain[];
} {
	const profile = input.profile ?? HIGHWAY_STAGE_VISUAL_PROFILE;
	const window = visibleChartWindow({
		playbackSeconds: input.playbackSeconds,
		previewOffsetSeconds: input.previewOffsetSeconds,
		preset: input.preset,
	});
	const heads: HighwayProjectedHead[] = [];
	const sustains: HighwayProjectedSustain[] = [];
	for (const note of input.notes) {
		const sustain = projectSustain(
			note,
			input,
			profile,
			window.startChartSeconds,
			window.endChartSeconds,
		);
		if (sustain) sustains.push(sustain);
		const head = projectHead(
			note,
			input,
			profile,
			window.startChartSeconds,
			window.endChartSeconds,
		);
		if (head) heads.push(head);
	}
	return {
		heads: heads.sort(compareProjectedDepth),
		sustains: sustains.sort(compareProjectedDepth),
	};
}

export function projectHighwayLines(input: {
	lines: readonly HighwayMusicalLine[];
	playbackSeconds: number;
	previewOffsetSeconds: number;
	preset: HighwaySpeedPreset;
	geometry: HighwayGeometry;
	profile?: HighwayStageVisualProfile;
}): HighwayProjectedLine[] {
	const profile = input.profile ?? HIGHWAY_STAGE_VISUAL_PROFILE;
	return input.lines
		.map((line) => {
			const effectiveSeconds = line.chartSeconds + input.previewOffsetSeconds;
			const depth = depthForEffectiveSeconds(
				effectiveSeconds,
				input.playbackSeconds,
				input.preset,
				profile,
			);
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

export function roadBoundsAtDepth(
	geometry: HighwayGeometry,
	depth: number,
): HighwayRoadBounds {
	const width = lerp(geometry.bottomRoadWidth, geometry.topRoadWidth, depth);
	return {
		leftX: geometry.roadCenterX - width / 2,
		rightX: geometry.roadCenterX + width / 2,
		width,
		laneWidth: width / HIGHWAY_PITCHED_LANES.length,
	};
}

function projectHead(
	note: HighwaySemanticNote,
	input: {
		playbackSeconds: number;
		previewOffsetSeconds: number;
		preset: HighwaySpeedPreset;
		geometry: HighwayGeometry;
	},
	profile: HighwayStageVisualProfile,
	startChartSeconds: number,
	endChartSeconds: number,
): HighwayProjectedHead | null {
	if (
		note.chartSeconds < startChartSeconds ||
		note.chartSeconds > endChartSeconds
	) {
		return null;
	}
	const effectiveSeconds = note.chartSeconds + input.previewOffsetSeconds;
	const depth = depthForEffectiveSeconds(
		effectiveSeconds,
		input.playbackSeconds,
		input.preset,
		profile,
	);
	const y = lerp(input.geometry.hitLineY, input.geometry.horizonY, depth);
	if (note.visualKind === "kick-rail") {
		const rail = projectKickRailAtDepth(input.geometry, depth);
		return {
			id: note.id,
			visualKind: "kick-rail",
			depth,
			y,
			leftX: rail.leftX,
			rightX: rail.rightX,
			thickness: Math.max(
				2,
				lerp(
					profile.notes.kickRailNearThickness,
					profile.notes.kickRailFarThickness,
					depth,
				),
			),
			fill: note.fill,
			stroke: note.stroke,
		};
	}
	const laneIndex = HIGHWAY_PITCHED_LANES.findIndex(
		(lane) => lane.id === note.pitchedLane,
	);
	if (laneIndex < 0) return null;
	const bounds = roadBoundsAtDepth(input.geometry, depth);
	const centerX = bounds.leftX + (laneIndex + 0.5) * bounds.laneWidth;
	const pitchedHeadBase = {
		id: note.id,
		depth,
		centerX,
		centerY: y,
		radius: Math.max(
			3,
			note.visualKind === "cymbal-head"
				? lerp(
						profile.notes.circleNearRadius,
						profile.notes.circleFarRadius,
						depth,
					)
				: lerp(
						profile.notes.squareNearSize,
						profile.notes.squareFarSize,
						depth,
					),
		),
		fill: note.fill,
		stroke: note.stroke,
		dynamic: note.dynamic,
	};
	if (note.visualKind === "square-head") {
		return {
			...pitchedHeadBase,
			visualKind: "square-head",
		};
	}
	return {
		...pitchedHeadBase,
		visualKind: "cymbal-head",
	};
}

function projectSustain(
	note: HighwaySemanticNote,
	input: {
		playbackSeconds: number;
		previewOffsetSeconds: number;
		preset: HighwaySpeedPreset;
		geometry: HighwayGeometry;
	},
	profile: HighwayStageVisualProfile,
	startChartSeconds: number,
	endChartSeconds: number,
): HighwayProjectedSustain | null {
	if (note.length <= 0) return null;
	const clippedStart = clamp(
		note.chartSeconds,
		startChartSeconds,
		endChartSeconds,
	);
	const clippedEnd = clamp(
		note.endChartSeconds,
		startChartSeconds,
		endChartSeconds,
	);
	if (
		!Number.isFinite(clippedStart) ||
		!Number.isFinite(clippedEnd) ||
		clippedEnd <= clippedStart
	) {
		return null;
	}
	const startEffective = clippedStart + input.previewOffsetSeconds;
	const endEffective = clippedEnd + input.previewOffsetSeconds;
	const startDepth = depthForEffectiveSeconds(
		startEffective,
		input.playbackSeconds,
		input.preset,
		profile,
	);
	const endDepth = depthForEffectiveSeconds(
		endEffective,
		input.playbackSeconds,
		input.preset,
		profile,
	);
	const nearDepth = Math.min(startDepth, endDepth);
	if (note.visualKind === "kick-rail") {
		const startRail = projectKickRailAtDepth(input.geometry, startDepth);
		const endRail = projectKickRailAtDepth(input.geometry, endDepth);
		const sustain = {
			id: note.id,
			kind: "kick",
			depth: nearDepth,
			nearLeftX: startRail.leftX,
			nearRightX: startRail.rightX,
			nearY: lerp(input.geometry.hitLineY, input.geometry.horizonY, startDepth),
			farLeftX: endRail.leftX,
			farRightX: endRail.rightX,
			farY: lerp(input.geometry.hitLineY, input.geometry.horizonY, endDepth),
			fill: HIGHWAY_KICK_STYLE.bandFill,
		} satisfies HighwayProjectedSustain;
		return isFiniteSustain(sustain) ? sustain : null;
	}
	const laneIndex = HIGHWAY_PITCHED_LANES.findIndex(
		(lane) => lane.id === note.pitchedLane,
	);
	if (laneIndex < 0) return null;
	const startBounds = roadBoundsAtDepth(input.geometry, startDepth);
	const endBounds = roadBoundsAtDepth(input.geometry, endDepth);
	const startLane = laneBandBounds(startBounds, laneIndex);
	const endLane = laneBandBounds(endBounds, laneIndex);
	const sustain = {
		id: note.id,
		kind: "pitched",
		depth: nearDepth,
		nearLeftX: startLane.leftX,
		nearRightX: startLane.rightX,
		nearY: lerp(input.geometry.hitLineY, input.geometry.horizonY, startDepth),
		farLeftX: endLane.leftX,
		farRightX: endLane.rightX,
		farY: lerp(input.geometry.hitLineY, input.geometry.horizonY, endDepth),
		fill: note.fill,
	} satisfies HighwayProjectedSustain;
	return isFiniteSustain(sustain) ? sustain : null;
}

function laneBandBounds(
	bounds: HighwayRoadBounds,
	laneIndex: number,
): { leftX: number; rightX: number } {
	const laneLeft = bounds.leftX + laneIndex * bounds.laneWidth;
	const laneRight = laneLeft + bounds.laneWidth;
	const inset = Math.max(2, bounds.laneWidth * 0.18);
	return {
		leftX: laneLeft + inset,
		rightX: Math.max(laneLeft + inset, laneRight - inset),
	};
}

function depthForEffectiveSeconds(
	effectiveSeconds: number,
	playbackSeconds: number,
	preset: HighwaySpeedPreset,
	profile: HighwayStageVisualProfile,
): number {
	const deltaSeconds = effectiveSeconds - playbackSeconds;
	const progress = clamp(deltaSeconds / preset.lookAheadSeconds, 0, 1);
	return stageDepthForProgress(progress, profile);
}

function isFiniteSustain(sustain: HighwayProjectedSustain): boolean {
	return [
		sustain.nearLeftX,
		sustain.nearRightX,
		sustain.nearY,
		sustain.farLeftX,
		sustain.farRightX,
		sustain.farY,
	].every(Number.isFinite);
}

function compareProjectedDepth(
	a: { depth: number },
	b: { depth: number },
): number {
	return b.depth - a.depth;
}

function lerp(start: number, end: number, progress: number): number {
	return start + (end - start) * progress;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}
