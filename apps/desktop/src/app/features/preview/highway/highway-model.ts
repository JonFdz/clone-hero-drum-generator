import type { ChartPreviewNoteEvent } from "../../../services/desktop-bridge.service";

export type HighwayChartLane = 0 | 1 | 2 | 3 | 4;
export type HighwayPitchedLaneId = "red" | "yellow" | "blue" | "green";
export type HighwayVisualKind = "kick-rail" | "square-head" | "cymbal-head";
export type HighwayDynamicKind = "accent" | "ghost" | null;

export type HighwaySourceNoteEvent = ChartPreviewNoteEvent;

export type HighwaySemanticNote = {
	id: string;
	tick: number;
	chartLane: HighwayChartLane;
	pitchedLane: HighwayPitchedLaneId | null;
	visualKind: HighwayVisualKind;
	dynamic: HighwayDynamicKind;
	length: number;
	chartSeconds: number;
	endChartSeconds: number;
	fill: string;
	stroke: string;
};

export type HighwaySpeedPresetId = "fast" | "normal" | "slow";

export type HighwaySpeedPreset = {
	id: HighwaySpeedPresetId;
	label: string;
	lookAheadSeconds: number;
	lookBehindSeconds: number;
};

export type HighwayLaneStyle = {
	id: HighwayPitchedLaneId;
	label: string;
	fill: string;
	stroke: string;
};

export type HighwayGeometry = {
	cssWidth: number;
	cssHeight: number;
	horizonY: number;
	hitLineY: number;
	roadCenterX: number;
	topRoadWidth: number;
	bottomRoadWidth: number;
	pitchedLaneCount: 4;
	minimumReadable: boolean;
};

export type HighwayRoadBounds = {
	leftX: number;
	rightX: number;
	width: number;
	laneWidth: number;
};

export type HighwayProjectedHead =
	| {
		id: string;
		visualKind: "kick-rail";
		depth: number;
		y: number;
		leftX: number;
		rightX: number;
		thickness: number;
		fill: string;
		stroke: string;
	}
	| {
		id: string;
		visualKind: "square-head" | "cymbal-head";
		depth: number;
		centerX: number;
		centerY: number;
		radius: number;
		fill: string;
		stroke: string;
		dynamic: HighwayDynamicKind;
	};

export type HighwayProjectedSustain = {
	id: string;
	kind: "kick" | "pitched";
	depth: number;
	nearLeftX: number;
	nearRightX: number;
	nearY: number;
	farLeftX: number;
	farRightX: number;
	farY: number;
	fill: string;
};

export type HighwayProjectedLine = {
	tick: number;
	kind: "beat" | "measure";
	startX: number;
	endX: number;
	y: number;
	depth: number;
};

export type HighwayTarget = {
	lane: HighwayPitchedLaneId;
	leftX: number;
	rightX: number;
	topY: number;
	bottomY: number;
	fill: string;
	stroke: string;
};

export type HighwayLaneDivider = {
	startX: number;
	endX: number;
};

export type HighwayHudState = {
	currentTimeSeconds: number;
	tick: number | null;
	beat: number | null;
	measure: number | null;
	fps: number | null;
};

export type HighwayFrameData = {
	cssWidth: number;
	cssHeight: number;
	heads: readonly HighwayProjectedHead[];
	sustains: readonly HighwayProjectedSustain[];
	lines: readonly HighwayProjectedLine[];
	geometry: HighwayGeometry;
	targets: readonly HighwayTarget[];
	laneDividers: readonly HighwayLaneDivider[];
	hud: HighwayHudState;
	hudEnabled: boolean;
	limitationText: string | null;
};

export const HIGHWAY_SPEED_PRESETS: readonly HighwaySpeedPreset[] = [
	{ id: "fast", label: "Fast", lookAheadSeconds: 3, lookBehindSeconds: 0.1 },
	{
		id: "normal",
		label: "Normal",
		lookAheadSeconds: 4.5,
		lookBehindSeconds: 0.1,
	},
	{ id: "slow", label: "Slow", lookAheadSeconds: 6, lookBehindSeconds: 0.1 },
] as const;

export const HIGHWAY_PITCHED_LANES: readonly HighwayLaneStyle[] = [
	{ id: "red", label: "Red", fill: "#ff4d5f", stroke: "#ffc4ca" },
	{ id: "yellow", label: "Yellow", fill: "#ffd84d", stroke: "#fff0b0" },
	{ id: "blue", label: "Blue", fill: "#4f95ff", stroke: "#bdd7ff" },
	{ id: "green", label: "Green", fill: "#57da68", stroke: "#caefd0" },
] as const;

export const HIGHWAY_KICK_STYLE = {
	fill: "#ff9a3c",
	stroke: "#ffd8ae",
	bandFill: "rgba(255, 154, 60, 0.32)",
} as const;

export const HIGHWAY_MAX_VISIBLE_LINES = 512;
