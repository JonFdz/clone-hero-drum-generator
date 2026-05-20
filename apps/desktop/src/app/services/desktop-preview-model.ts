import type { NormalizationPreview } from "@chdg/project";
import type { ChartPreviewData } from "./desktop-bridge.service";

export type TimelineNote = {
	atSeconds: number;
	lane: string;
	highlighted: boolean;
};

const laneMap: Record<number, string> = {
	0: "kick",
	1: "red",
	2: "yellow",
	3: "blue",
	4: "green",
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

export function buildWaveformBars(durationSeconds: number, bars = 80): number[] {
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

	if (!normalization || normalization.firstHits.length === 0 || durationSeconds <= 0) {
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
