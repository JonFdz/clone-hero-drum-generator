import type { NormalizationPreview } from "@chdg/project";
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

export function deriveTimelineNotes(
	chartData: ChartPreviewData | null,
	normalization: NormalizationPreview | undefined,
	durationSeconds: number,
	currentTimeSeconds: number,
): TimelineNote[] {
	const tolerance = 0.12;
	if (chartData && chartData.noteEvents.length > 0) {
		return chartData.noteEvents.slice(0, 5000).map((n) => ({
			atSeconds: n.seconds,
			lane: laneMap[n.lane] ?? `lane-${n.lane}`,
			highlighted: Math.abs(n.seconds - currentTimeSeconds) <= tolerance,
		}));
	}

	if (
		!normalization ||
		normalization.firstHits.length === 0 ||
		durationSeconds <= 0
	) {
		return [];
	}

	const maxTick = Math.max(...normalization.firstHits.map((h) => h.tick), 1);
	return normalization.firstHits.map((h) => {
		const atSeconds = (h.tick / maxTick) * durationSeconds;
		return {
			atSeconds,
			lane: h.piece,
			highlighted: Math.abs(atSeconds - currentTimeSeconds) <= tolerance,
		};
	});
}

export function deriveHighwayNotes(
	chartData: ChartPreviewData | null,
	normalization: NormalizationPreview | undefined,
	currentTimeSeconds: number,
	lookbehindSeconds = 0.25,
	lookaheadSeconds = 3,
): HighwayNote[] {
	const windowStart = currentTimeSeconds - lookbehindSeconds;
	const windowSize = lookbehindSeconds + lookaheadSeconds;

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
				const visible =
					event.seconds >= windowStart &&
					event.seconds <= currentTimeSeconds + lookaheadSeconds;
				const yPercent =
					((event.seconds - windowStart) / Math.max(windowSize, 0.01)) * 100;
				notes.push({
					id: `${tick}-${lane}`,
					lane,
					atSeconds: event.seconds,
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

	if (!normalization || normalization.firstHits.length === 0) {
		return [];
	}

	const maxTick = Math.max(...normalization.firstHits.map((h) => h.tick), 1);
	const fallbackNotes: HighwayNote[] = [];
	for (const hit of normalization.firstHits) {
		const atSeconds = hit.tick / maxTick;
		const lane = pieceToHighwayLane(hit.piece);
		if (!lane) continue;
		const visible =
			atSeconds >= windowStart &&
			atSeconds <= currentTimeSeconds + lookaheadSeconds;
		if (!visible) continue;
		const yPercent =
			((atSeconds - windowStart) / Math.max(windowSize, 0.01)) * 100;
		fallbackNotes.push({
			id: `${hit.tick}-${lane}`,
			lane,
			atSeconds,
			yPercent,
			visible,
			cymbal:
				hit.piece === "crash" ||
				hit.piece === "ride" ||
				hit.piece === "hihat_open" ||
				hit.piece === "hihat_closed",
			open: hit.piece === "hihat_open",
		});
	}
	return fallbackNotes;
}

export function deriveHighwayLimitations(
	chartData: ChartPreviewData | null,
	normalization: NormalizationPreview | undefined,
): string[] {
	if (chartData && chartData.noteEvents.length > 0) {
		return [
			...chartData.limitations,
			"Open hi-hat state may be unavailable in chart-only preview data.",
		];
	}
	if (normalization?.firstHits?.length) {
		return [
			"Using normalization fallback data; accent/ghost modifiers may be unavailable.",
		];
	}
	return ["No generated chart or preview hit data available for highway."];
}

function pieceToHighwayLane(piece: string): HighwayLane | null {
	switch (piece) {
		case "kick":
			return "kick";
		case "snare":
		case "sidestick":
			return "red";
		case "hihat_open":
		case "hihat_closed":
		case "tom_high":
			return "yellow";
		case "ride":
		case "tom_mid":
			return "blue";
		case "crash":
		case "tom_floor":
			return "green";
		default:
			return null;
	}
}
