import type { ChartPreviewData } from "./desktop-bridge.service";

export type TimelineNote = {
	atSeconds: number;
	lane: string;
	highlighted: boolean;
};

export type HighwayLane = "kick" | "red" | "yellow" | "blue" | "green";

export type HighwayNote = {
	id: string;
	lane: HighwayLane;
	atSeconds: number;
	yPercent: number;
	visible: boolean;
	cymbal?: boolean;
	open?: boolean;
	accent?: boolean;
	ghost?: boolean;
};

export const HIGHWAY_HIT_LINE_PERCENT = 18;

const laneMap: Record<number, HighwayLane> = {
	0: "kick",
	1: "red",
	2: "yellow",
	3: "blue",
	4: "green",
};

const cymbalModifierByLane: Partial<Record<HighwayLane, number>> = {
	yellow: 66,
	blue: 67,
	green: 68,
};

const accentModifierByLane: Partial<Record<HighwayLane, number>> = {
	red: 34,
	yellow: 35,
	blue: 36,
	green: 37,
};

const ghostModifierByLane: Partial<Record<HighwayLane, number>> = {
	red: 40,
	yellow: 41,
	blue: 42,
	green: 43,
};

export function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) return "00:00.000";
	const mins = Math.floor(seconds / 60)
		.toString()
		.padStart(2, "0");
	const secs = Math.floor(seconds % 60)
		.toString()
		.padStart(2, "0");
	const millis = Math.floor((seconds % 1) * 1000)
		.toString()
		.padStart(3, "0");
	return `${mins}:${secs}.${millis}`;
}

export function buildWaveformBars(
	durationSeconds: number,
	bars = 80,
): number[] {
	if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return [];
	return Array.from({ length: bars }, (_, i) => {
		const x = i / Math.max(1, bars - 1);
		return 0.2 + Math.abs(Math.sin(x * 12.7) * Math.cos(x * 4.2)) * 0.8;
	});
}

export function offsetMsToSeconds(offsetMs: number): number {
	if (!Number.isFinite(offsetMs)) {
		throw new Error("OFFSET_NOT_FINITE");
	}
	return offsetMs / 1000;
}

export function effectiveNoteTime(
	noteTimeSeconds: number,
	previewOffsetMs: number,
): number {
	return noteTimeSeconds + offsetMsToSeconds(previewOffsetMs);
}

export function deriveTimelineNotes(
	chartData: ChartPreviewData | null,
	currentTimeSeconds: number,
	previewOffsetMs = 0,
): TimelineNote[] {
	const tolerance = 0.12;
	if (chartData && chartData.noteEvents.length > 0) {
		return chartData.noteEvents.slice(0, 5000).map((n) => {
			const atSeconds = effectiveNoteTime(n.seconds, previewOffsetMs);
			return {
				atSeconds,
				lane: laneMap[n.lane] ?? `lane-${n.lane}`,
				highlighted: Math.abs(atSeconds - currentTimeSeconds) <= tolerance,
			};
		});
	}

	return [];
}

export function deriveHighwayNotes(
	chartData: ChartPreviewData | null,
	currentTimeSeconds: number,
	previewOffsetMs = 0,
	lookbehindSeconds = 0.25,
	lookaheadSeconds = 3,
): HighwayNote[] {
	if (chartData && chartData.noteEvents.length > 0) {
		const eventsByTick = new Map<
			number,
			Array<{ lane: number; seconds: number }>
		>();
		for (const event of chartData.noteEvents) {
			const atTick = eventsByTick.get(event.tick) ?? [];
			atTick.push({ lane: event.lane, seconds: event.seconds });
			eventsByTick.set(event.tick, atTick);
		}

		const notes: HighwayNote[] = [];
		for (const [tick, events] of eventsByTick) {
			const lanesAtTick = new Set(events.map((e) => e.lane));
			for (const event of events) {
				const lane = laneMap[event.lane];
				if (!lane) continue;
				const atSeconds = effectiveNoteTime(event.seconds, previewOffsetMs);
				const yPercent = highwayYPercent(
					atSeconds,
					currentTimeSeconds,
					lookbehindSeconds,
					lookaheadSeconds,
				);
				const visible = yPercent >= 0 && yPercent <= 100;
				notes.push({
					id: `${tick}-${lane}`,
					lane,
					atSeconds,
					yPercent,
					visible,
					cymbal: cymbalModifierByLane[lane]
						? lanesAtTick.has(cymbalModifierByLane[lane] as number)
						: false,
					accent: accentModifierByLane[lane]
						? lanesAtTick.has(accentModifierByLane[lane] as number)
						: false,
					ghost: ghostModifierByLane[lane]
						? lanesAtTick.has(ghostModifierByLane[lane] as number)
						: false,
				});
			}
		}
		return notes
			.filter((n) => n.visible)
			.sort((a, b) => a.atSeconds - b.atSeconds)
			.slice(0, 5000);
	}

	return [];
}

export function deriveHighwayLimitations(
	chartData: ChartPreviewData | null,
): string[] {
	if (chartData && chartData.noteEvents.length > 0) {
		return [
			...chartData.limitations,
			"Open hi-hat state may be unavailable in chart-only preview data.",
		];
	}
	return ["No generated notes.chart data available for highway."];
}

export function highwayYPercent(
	atSeconds: number,
	currentTimeSeconds: number,
	lookbehindSeconds: number,
	lookaheadSeconds: number,
): number {
	if (atSeconds <= currentTimeSeconds) {
		const elapsedBehind = currentTimeSeconds - atSeconds;
		return (
			HIGHWAY_HIT_LINE_PERCENT *
			(1 - elapsedBehind / Math.max(lookbehindSeconds, 0.01))
		);
	}

	const elapsedAhead = atSeconds - currentTimeSeconds;
	return (
		HIGHWAY_HIT_LINE_PERCENT +
		(100 - HIGHWAY_HIT_LINE_PERCENT) *
			(elapsedAhead / Math.max(lookaheadSeconds, 0.01))
	);
}
