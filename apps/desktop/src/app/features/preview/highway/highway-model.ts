export type HighwayLaneId = 0 | 1 | 2 | 3 | 4;

export type HighwaySourceNote = {
	id: string;
	tick: number;
	lane: HighwayLaneId;
	chartSeconds: number;
};

export type HighwaySpeedPresetId = "fast" | "normal" | "slow";

export type HighwaySpeedPreset = {
	id: HighwaySpeedPresetId;
	label: string;
	lookAheadSeconds: number;
	lookBehindSeconds: number;
};

export type HighwayLaneStyle = {
	lane: HighwayLaneId;
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
	minimumReadable: boolean;
};

export type HighwayProjectedNote = {
	id: string;
	lane: HighwayLaneId;
	centerX: number;
	centerY: number;
	radius: number;
	depth: number;
	effectiveSeconds: number;
};

export type HighwayProjectedLine = {
	tick: number;
	kind: "beat" | "measure";
	startX: number;
	endX: number;
	y: number;
	depth: number;
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
	notes: readonly HighwayProjectedNote[];
	lines: readonly HighwayProjectedLine[];
	geometry: HighwayGeometry;
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

export const HIGHWAY_LANES: readonly HighwayLaneStyle[] = [
	{ lane: 0, label: "Kick", fill: "#ff9a3c", stroke: "#ffd8ae" },
	{ lane: 1, label: "Red", fill: "#ff4d5f", stroke: "#ffc4ca" },
	{ lane: 2, label: "Yellow", fill: "#ffd84d", stroke: "#fff0b0" },
	{ lane: 3, label: "Blue", fill: "#4f95ff", stroke: "#bdd7ff" },
	{ lane: 4, label: "Green", fill: "#57da68", stroke: "#caefd0" },
] as const;

export const HIGHWAY_MAX_VISIBLE_LINES = 512;
