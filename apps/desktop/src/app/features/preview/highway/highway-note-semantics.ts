import {
	HIGHWAY_KICK_STYLE,
	HIGHWAY_PITCHED_LANES,
	type HighwayChartLane,
	type HighwayDynamicKind,
	type HighwayPitchedLaneId,
	type HighwaySemanticNote,
	type HighwaySourceNoteEvent,
	type HighwayVisualKind,
} from "./highway-model";

const CYMBAL_MARKERS: Partial<Record<HighwayPitchedLaneId, number>> = {
	yellow: 66,
	blue: 67,
	green: 68,
};

const ACCENT_MARKERS: Record<HighwayPitchedLaneId, number> = {
	red: 34,
	yellow: 35,
	blue: 36,
	green: 37,
};

const GHOST_MARKERS: Record<HighwayPitchedLaneId, number> = {
	red: 40,
	yellow: 41,
	blue: 42,
	green: 43,
};

const BASE_LANE_MAP: Record<Exclude<HighwayChartLane, 0>, HighwayPitchedLaneId> = {
	1: "red",
	2: "yellow",
	3: "blue",
	4: "green",
};

const LANE_STYLE_MAP = new Map(
	HIGHWAY_PITCHED_LANES.map((lane) => [lane.id, lane]),
);

export function buildHighwaySemanticNotes(
	noteEvents: ReadonlyArray<HighwaySourceNoteEvent>,
): HighwaySemanticNote[] {
	const groups = new Map<number, HighwaySourceNoteEvent[]>();
	for (const event of noteEvents) {
		if (!isValidSourceEvent(event)) continue;
		const group = groups.get(event.tick) ?? [];
		group.push(event);
		groups.set(event.tick, group);
	}

	const occurrenceByTickLane = new Map<string, number>();
	const semanticNotes: HighwaySemanticNote[] = [];
	for (const [tick, events] of [...groups.entries()].sort((a, b) => a[0] - b[0])) {
		const lanesAtTick = new Set(events.map((event) => event.lane));
		for (const event of events) {
			if (!isBaseLane(event.lane)) continue;
			const key = `${tick}-${event.lane}`;
			const occurrence = occurrenceByTickLane.get(key) ?? 0;
			occurrenceByTickLane.set(key, occurrence + 1);
			semanticNotes.push(
				buildSemanticNote(event, lanesAtTick, occurrence),
			);
		}
	}

	return semanticNotes.sort(
		(a, b) =>
			a.chartSeconds - b.chartSeconds ||
			a.tick - b.tick ||
			a.chartLane - b.chartLane ||
			a.id.localeCompare(b.id),
	);
}

function buildSemanticNote(
	event: HighwaySourceNoteEvent & { lane: HighwayChartLane },
	lanesAtTick: ReadonlySet<number>,
	occurrence: number,
): HighwaySemanticNote {
	if (event.lane === 0) {
		return {
			id: `${event.tick}-${event.lane}-${occurrence}`,
			tick: event.tick,
			chartLane: event.lane,
			pitchedLane: null,
			visualKind: "kick-rail",
			dynamic: null,
			length: event.length,
			chartSeconds: event.seconds,
			endChartSeconds: event.endSeconds,
			fill: HIGHWAY_KICK_STYLE.fill,
			stroke: HIGHWAY_KICK_STYLE.stroke,
		};
	}

	const pitchedLane = BASE_LANE_MAP[event.lane];
	const style = LANE_STYLE_MAP.get(pitchedLane)!;
	const visualKind = resolveVisualKind(pitchedLane, lanesAtTick);
	const dynamic = resolveDynamicKind(pitchedLane, lanesAtTick);
	return {
		id: `${event.tick}-${event.lane}-${occurrence}`,
		tick: event.tick,
		chartLane: event.lane,
		pitchedLane,
		visualKind,
		dynamic,
		length: event.length,
		chartSeconds: event.seconds,
		endChartSeconds: event.endSeconds,
		fill: style.fill,
		stroke: style.stroke,
	};
}

function resolveVisualKind(
	pitchedLane: HighwayPitchedLaneId,
	lanesAtTick: ReadonlySet<number>,
): HighwayVisualKind {
	const cymbalMarker = CYMBAL_MARKERS[pitchedLane];
	if (cymbalMarker !== undefined && lanesAtTick.has(cymbalMarker)) {
		return "cymbal-head";
	}
	return "square-head";
}

function resolveDynamicKind(
	pitchedLane: HighwayPitchedLaneId,
	lanesAtTick: ReadonlySet<number>,
): HighwayDynamicKind {
	if (lanesAtTick.has(ACCENT_MARKERS[pitchedLane])) return "accent";
	if (lanesAtTick.has(GHOST_MARKERS[pitchedLane])) return "ghost";
	return null;
}

function isBaseLane(lane: number): lane is HighwayChartLane {
	return Number.isInteger(lane) && lane >= 0 && lane <= 4;
}

function isValidSourceEvent(
	event: HighwaySourceNoteEvent,
): event is HighwaySourceNoteEvent & { lane: number } {
	return (
		Number.isInteger(event.tick) &&
		event.tick >= 0 &&
		Number.isInteger(event.lane) &&
		event.lane >= 0 &&
		Number.isInteger(event.length) &&
		event.length >= 0 &&
		Number.isFinite(event.seconds) &&
		Number.isFinite(event.endSeconds) &&
		event.endSeconds >= event.seconds
	);
}
