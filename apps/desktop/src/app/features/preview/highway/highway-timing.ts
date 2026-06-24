import { HIGHWAY_MAX_VISIBLE_LINES } from "./highway-model";

export type HighwayTempoEvent = {
	tick: number;
	bpm: number;
	seconds: number;
};

export type HighwayTimeSignatureEvent = {
	tick: number;
	numerator: number;
	denominator: number;
	seconds: number;
};

type HighwayTempoSegment = HighwayTempoEvent;

type HighwayMeterSegment = {
	tick: number;
	numerator: number;
	denominator: number;
	ticksPerBeat: number;
	ticksPerMeasure: number;
	measureStart: number;
};

export type HighwayTimingMap = {
	resolution: number;
	tempoSegments: readonly HighwayTempoSegment[];
	meterSegments: readonly HighwayMeterSegment[];
	hasMeterData: boolean;
	meterLimitation: string | null;
	meterValidUntilTick: number | null;
};

export type MusicalPosition = {
	tick: number;
	beat: number;
	measure: number;
	numerator: number;
	denominator: number;
};

export type HighwayMusicalLine = {
	tick: number;
	chartSeconds: number;
	kind: "beat" | "measure";
	measure: number;
	beat: number;
};

export function buildHighwayTimingMap(input: {
	resolution: number;
	tempos: readonly HighwayTempoEvent[];
	timeSignatures: readonly HighwayTimeSignatureEvent[];
}): HighwayTimingMap | null {
	const resolution = input.resolution;
	if (!Number.isFinite(resolution) || resolution <= 0) return null;

	const tempoSegments = [...input.tempos]
		.filter(
			(tempo) =>
				Number.isFinite(tempo.tick) &&
				Number.isFinite(tempo.seconds) &&
				Number.isFinite(tempo.bpm) &&
				tempo.bpm > 0,
		)
		.sort((a, b) => a.tick - b.tick || a.seconds - b.seconds);
	if (tempoSegments.length === 0 || tempoSegments[0]?.tick > 0) return null;

	const sanitizedSignatures = [...input.timeSignatures]
		.filter(
			(signature) =>
				Number.isFinite(signature.tick) &&
				Number.isFinite(signature.seconds) &&
				Number.isInteger(signature.numerator) &&
				signature.numerator > 0 &&
				Number.isInteger(signature.denominator) &&
				signature.denominator > 0 &&
				isPowerOfTwo(signature.denominator),
		)
		.sort((a, b) => a.tick - b.tick || a.seconds - b.seconds);

	if (sanitizedSignatures.length === 0 || sanitizedSignatures[0]?.tick !== 0) {
		return {
			resolution,
			tempoSegments,
			meterSegments: [],
			hasMeterData: false,
			meterLimitation:
				"Beat and measure data are unavailable because the timing map has no valid time signature at tick 0.",
			meterValidUntilTick: null,
		};
	}

	const meterSegments: HighwayMeterSegment[] = [];
	let meterLimitation: string | null = null;
	let meterValidUntilTick: number | null = null;
	for (let index = 0; index < sanitizedSignatures.length; index += 1) {
		const signature = sanitizedSignatures[index];
		const ticksPerBeat = (resolution * 4) / signature.denominator;
		const ticksPerMeasure = ticksPerBeat * signature.numerator;
		if (!Number.isFinite(ticksPerBeat) || ticksPerBeat <= 0) {
			meterLimitation = "Beat and measure data are unavailable because the timing map is invalid.";
			break;
		}

		if (index === 0) {
			meterSegments.push({
				tick: signature.tick,
				numerator: signature.numerator,
				denominator: signature.denominator,
				ticksPerBeat,
				ticksPerMeasure,
				measureStart: 1,
			});
			continue;
		}

		const previous = meterSegments[meterSegments.length - 1];
		const deltaTicks = signature.tick - previous.tick;
		if (deltaTicks < 0 || deltaTicks % previous.ticksPerMeasure !== 0) {
			meterLimitation =
				"Beat and measure data are unavailable after a time-signature change that does not begin on a measure boundary.";
			meterValidUntilTick = signature.tick;
			break;
		}
		meterSegments.push({
			tick: signature.tick,
			numerator: signature.numerator,
			denominator: signature.denominator,
			ticksPerBeat,
			ticksPerMeasure,
			measureStart: previous.measureStart + deltaTicks / previous.ticksPerMeasure,
		});
	}

	return {
		resolution,
		tempoSegments,
		meterSegments,
		hasMeterData: meterSegments.length > 0,
		meterLimitation,
		meterValidUntilTick,
	};
}

export function chartSecondsAtTick(
	map: HighwayTimingMap,
	tick: number,
): number {
	const segment = findTempoSegmentByTick(map.tempoSegments, tick);
	return (
		segment.seconds +
		((tick - segment.tick) * 60) / (segment.bpm * map.resolution)
	);
}

export function tickAtChartSeconds(
	map: HighwayTimingMap,
	seconds: number,
): number {
	const segment = findTempoSegmentBySeconds(map.tempoSegments, seconds);
	return (
		segment.tick +
		((seconds - segment.seconds) * segment.bpm * map.resolution) / 60
	);
}

export function musicalPositionAtTick(
	map: HighwayTimingMap,
	tick: number,
): MusicalPosition | null {
	if (!map.hasMeterData || map.meterSegments.length === 0) return null;
	if (
		map.meterValidUntilTick !== null &&
		tick >= map.meterValidUntilTick
	) {
		return null;
	}
	const segment = findMeterSegmentByTick(map.meterSegments, tick);
	if (!segment) return null;

	const ticksIntoSegment = tick - segment.tick;
	if (ticksIntoSegment < 0) return null;
	const completedMeasures = Math.floor(
		ticksIntoSegment / segment.ticksPerMeasure,
	);
	const ticksIntoMeasure = ticksIntoSegment % segment.ticksPerMeasure;
	const beat =
		Math.floor(ticksIntoMeasure / segment.ticksPerBeat) + 1;
	const measure = segment.measureStart + completedMeasures;
	return {
		tick: Math.round(tick),
		beat,
		measure,
		numerator: segment.numerator,
		denominator: segment.denominator,
	};
}

export function enumerateMusicalLines(
	map: HighwayTimingMap,
	input: {
		startSeconds: number;
		endSeconds: number;
		paddingSeconds?: number;
		maxLines?: number;
	},
): HighwayMusicalLine[] {
	if (!map.hasMeterData) return [];
	const maxLines = input.maxLines ?? HIGHWAY_MAX_VISIBLE_LINES;
	const paddingSeconds = input.paddingSeconds ?? 0.1;
	const startSeconds = Math.max(0, input.startSeconds - paddingSeconds);
	const endSeconds = Math.max(startSeconds, input.endSeconds + paddingSeconds);
	const startTick = tickAtChartSeconds(map, startSeconds);
	const endTick = tickAtChartSeconds(map, endSeconds);
	if (
		map.meterValidUntilTick !== null &&
		startTick >= map.meterValidUntilTick
	) {
		return [];
	}
	const firstPosition = musicalPositionAtTick(map, startTick);
	if (!firstPosition) return [];

	const lines: HighwayMusicalLine[] = [];
	let currentTick = alignTickToBeat(map, startTick);
	while (currentTick <= endTick) {
		const position = musicalPositionAtTick(map, currentTick);
		if (!position) break;
		lines.push({
			tick: Math.round(currentTick),
			chartSeconds: chartSecondsAtTick(map, currentTick),
			kind: position.beat === 1 ? "measure" : "beat",
			measure: position.measure,
			beat: position.beat,
		});
		currentTick += ticksPerBeatAtTick(map, currentTick);
	}

	const uniqueLines = dedupeMusicalLines(lines);
	if (uniqueLines.length <= maxLines) return uniqueLines;

	const measureLines = uniqueLines.filter((line) => line.kind === "measure");
	const beatLines = uniqueLines.filter((line) => line.kind === "beat");
	const availableBeatSlots = Math.max(0, maxLines - measureLines.length);
	if (availableBeatSlots === 0) return measureLines.slice(0, maxLines);

	const stride = Math.ceil(beatLines.length / availableBeatSlots);
	const sampledBeats = beatLines.filter((_, index) => index % stride === 0);
	return [...measureLines, ...sampledBeats]
		.sort((a, b) => a.tick - b.tick)
		.slice(0, maxLines);
}

function dedupeMusicalLines(lines: HighwayMusicalLine[]): HighwayMusicalLine[] {
	const byTick = new Map<number, HighwayMusicalLine>();
	for (const line of lines) {
		const existing = byTick.get(line.tick);
		if (!existing || line.kind === "measure") {
			byTick.set(line.tick, line);
		}
	}
	return [...byTick.values()].sort((a, b) => a.tick - b.tick);
}

function alignTickToBeat(map: HighwayTimingMap, tick: number): number {
	const segment = findMeterSegmentByTick(map.meterSegments, tick);
	if (!segment) return tick;
	const ticksIntoSegment = Math.max(0, tick - segment.tick);
	const beatsIntoSegment = Math.ceil(ticksIntoSegment / segment.ticksPerBeat);
	return segment.tick + beatsIntoSegment * segment.ticksPerBeat;
}

function ticksPerBeatAtTick(map: HighwayTimingMap, tick: number): number {
	return findMeterSegmentByTick(map.meterSegments, tick)?.ticksPerBeat ?? map.resolution;
}

function findTempoSegmentByTick(
	segments: readonly HighwayTempoSegment[],
	tick: number,
): HighwayTempoSegment {
	let low = 0;
	let high = segments.length - 1;
	let result = segments[0];
	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const segment = segments[mid];
		if (segment.tick <= tick) {
			result = segment;
			low = mid + 1;
		} else {
			high = mid - 1;
		}
	}
	return result;
}

function findTempoSegmentBySeconds(
	segments: readonly HighwayTempoSegment[],
	seconds: number,
): HighwayTempoSegment {
	let low = 0;
	let high = segments.length - 1;
	let result = segments[0];
	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const segment = segments[mid];
		if (segment.seconds <= seconds) {
			result = segment;
			low = mid + 1;
		} else {
			high = mid - 1;
		}
	}
	return result;
}

function findMeterSegmentByTick(
	segments: readonly HighwayMeterSegment[],
	tick: number,
): HighwayMeterSegment | null {
	let low = 0;
	let high = segments.length - 1;
	let result: HighwayMeterSegment | null = segments[0] ?? null;
	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const segment = segments[mid];
		if (segment.tick <= tick) {
			result = segment;
			low = mid + 1;
		} else {
			high = mid - 1;
		}
	}
	return result;
}

function isPowerOfTwo(value: number): boolean {
	return value > 0 && (value & (value - 1)) === 0;
}
