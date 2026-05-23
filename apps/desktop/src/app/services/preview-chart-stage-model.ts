import type { NormalizationPreview } from "@chdg/project/browser";
import type { ChartPreviewData } from "./desktop-bridge.service";

export type PreviewLaneId =
	| "kick"
	| "snare"
	| "hi_hat"
	| "tom_high"
	| "ride"
	| "tom_mid"
	| "crash"
	| "tom_floor";

export type PreviewGlyphShape = "circle" | "diamond";

export type PreviewLane = {
	id: PreviewLaneId;
	label: string;
	sublabel?: string;
	piece: string;
	color: string;
	shape: PreviewGlyphShape;
	icon: string;
};

export type PreviewGlyph = {
	laneId: PreviewLaneId;
	color: string;
	shape: PreviewGlyphShape;
};

export type PreviewViewport = {
	startSeconds: number;
	endSeconds: number;
	durationSeconds: number;
};

export type PreviewNote = {
	id: string;
	laneId: PreviewLaneId;
	piece: string;
	seconds: number;
	tick?: number;
	color: string;
	shape: PreviewGlyphShape;
	open?: boolean;
};

export const PREVIEW_LANES: readonly PreviewLane[] = [
	{
		id: "kick",
		label: "KICK",
		piece: "kick",
		color: "#ff8a1f",
		shape: "circle",
		icon: "◉",
	},
	{
		id: "snare",
		label: "SNARE",
		piece: "snare",
		color: "#ff3b45",
		shape: "circle",
		icon: "◉",
	},
	{
		id: "hi_hat",
		label: "HI-HAT",
		piece: "hihat_closed",
		color: "#ffd84d",
		shape: "diamond",
		icon: "◆",
	},
	{
		id: "tom_high",
		label: "TOM 1",
		sublabel: "High Tom",
		piece: "tom_high",
		color: "#ffd84d",
		shape: "circle",
		icon: "◉",
	},
	{
		id: "ride",
		label: "RIDE",
		piece: "ride",
		color: "#3f8cff",
		shape: "diamond",
		icon: "◆",
	},
	{
		id: "tom_mid",
		label: "TOM 2",
		sublabel: "Mid Tom",
		piece: "tom_mid",
		color: "#3f8cff",
		shape: "circle",
		icon: "◉",
	},
	{
		id: "crash",
		label: "CRASH",
		piece: "crash",
		color: "#61e85e",
		shape: "diamond",
		icon: "◆",
	},
	{
		id: "tom_floor",
		label: "TOM 3",
		sublabel: "Floor Tom",
		piece: "tom_floor",
		color: "#61e85e",
		shape: "circle",
		icon: "◉",
	},
] as const;

const laneById = new Map(PREVIEW_LANES.map((lane) => [lane.id, lane]));

export function pieceToPreviewLane(piece: string): PreviewLaneId | null {
	switch (piece) {
		case "kick":
			return "kick";
		case "snare":
		case "sidestick":
			return "snare";
		case "hihat_open":
		case "hihat_closed":
			return "hi_hat";
		case "tom_high":
			return "tom_high";
		case "ride":
			return "ride";
		case "tom_mid":
			return "tom_mid";
		case "crash":
			return "crash";
		case "tom_floor":
			return "tom_floor";
		default:
			return null;
	}
}

export function pieceToPreviewGlyph(piece: string): PreviewGlyph | null {
	const laneId = pieceToPreviewLane(piece);
	if (!laneId) return null;
	const lane = laneById.get(laneId);
	if (!lane) return null;
	return { laneId, color: lane.color, shape: lane.shape };
}

export function computePreviewViewport(
	currentTimeSeconds: number,
	durationSeconds: number,
	lookbehindSeconds = 0.5,
	lookaheadSeconds = 3,
): PreviewViewport {
	const safeCurrent = Number.isFinite(currentTimeSeconds)
		? Math.max(0, currentTimeSeconds)
		: 0;
	const windowSeconds = Math.max(1, lookbehindSeconds + lookaheadSeconds);
	const safeDuration =
		Number.isFinite(durationSeconds) && durationSeconds > 0
			? durationSeconds
			: Math.max(windowSeconds, safeCurrent + lookaheadSeconds);

	if (safeDuration <= windowSeconds) {
		return {
			startSeconds: 0,
			endSeconds: safeDuration,
			durationSeconds: safeDuration,
		};
	}

	const desiredStart = safeCurrent - lookbehindSeconds;
	const startSeconds = clamp(desiredStart, 0, safeDuration - windowSeconds);
	return {
		startSeconds,
		endSeconds: startSeconds + windowSeconds,
		durationSeconds: safeDuration,
	};
}

export function projectSecondsToPercent(
	seconds: number,
	viewport: Pick<PreviewViewport, "startSeconds" | "endSeconds">,
): number {
	if (!Number.isFinite(seconds)) return 0;
	const range = viewport.endSeconds - viewport.startSeconds;
	if (!Number.isFinite(range) || range <= 0) return 0;
	const clampedSeconds = clamp(
		seconds,
		viewport.startSeconds,
		viewport.endSeconds,
	);
	return ((clampedSeconds - viewport.startSeconds) / range) * 100;
}

export function projectPercentToSeconds(
	percent: number,
	viewport: Pick<PreviewViewport, "startSeconds" | "endSeconds">,
): number {
	const range = viewport.endSeconds - viewport.startSeconds;
	if (!Number.isFinite(percent) || !Number.isFinite(range) || range <= 0) {
		return viewport.startSeconds;
	}
	return viewport.startSeconds + clamp(percent, 0, 1) * range;
}

export function filterVisiblePreviewNotes(
	notes: readonly PreviewNote[],
	viewport: Pick<PreviewViewport, "startSeconds" | "endSeconds">,
	paddingSeconds = 0.25,
): PreviewNote[] {
	const start = viewport.startSeconds - paddingSeconds;
	const end = viewport.endSeconds + paddingSeconds;
	return notes
		.filter(
			(note) =>
				Number.isFinite(note.seconds) &&
				note.seconds >= start &&
				note.seconds <= end,
		)
		.sort((a, b) => a.seconds - b.seconds);
}

export function adaptChartPreviewDataToPreviewNotes(
	chartData: ChartPreviewData | null,
	normalization: NormalizationPreview | undefined,
	durationSeconds: number,
	previewOffsetMs = 0,
): PreviewNote[] {
	if (chartData?.noteEvents.length) {
		return adaptChartEvents(chartData, previewOffsetMs);
	}
	return adaptNormalizationHits(
		normalization,
		durationSeconds,
		previewOffsetMs,
	);
}

function adaptChartEvents(
	chartData: ChartPreviewData,
	previewOffsetMs: number,
): PreviewNote[] {
	const groups = new Map<number, Array<{ lane: number; seconds: number }>>();
	for (const event of chartData.noteEvents) {
		const events = groups.get(event.tick) ?? [];
		events.push({ lane: event.lane, seconds: event.seconds });
		groups.set(event.tick, events);
	}

	const notes: PreviewNote[] = [];
	for (const [tick, events] of groups) {
		const lanesAtTick = new Set(events.map((event) => event.lane));
		for (const event of events) {
			const piece = chartLaneToPiece(event.lane, lanesAtTick);
			if (!piece) continue;
			const glyph = pieceToPreviewGlyph(piece);
			if (!glyph) continue;
			notes.push({
				id: `${tick}-${event.lane}-${notes.length}`,
				laneId: glyph.laneId,
				piece,
				seconds: event.seconds + previewOffsetMs / 1000,
				tick,
				color: glyph.color,
				shape: glyph.shape,
				open: piece === "hihat_open",
			});
		}
	}
	return notes.sort((a, b) => a.seconds - b.seconds);
}

function adaptNormalizationHits(
	normalization: NormalizationPreview | undefined,
	durationSeconds: number,
	previewOffsetMs: number,
): PreviewNote[] {
	if (!normalization?.firstHits.length) return [];
	const maxTick = Math.max(
		...normalization.firstHits.map((hit) => hit.tick),
		1,
	);
	const safeDuration =
		Number.isFinite(durationSeconds) && durationSeconds > 0
			? durationSeconds
			: 0;
	return normalization.firstHits.flatMap((hit, index) => {
		const glyph = pieceToPreviewGlyph(hit.piece);
		if (!glyph) return [];
		return [
			{
				id: `${hit.tick}-${hit.piece}-${index}`,
				laneId: glyph.laneId,
				piece: hit.piece,
				seconds: (hit.tick / maxTick) * safeDuration + previewOffsetMs / 1000,
				tick: hit.tick,
				color: glyph.color,
				shape: glyph.shape,
				open: hit.piece === "hihat_open",
			},
		];
	});
}

function chartLaneToPiece(
	lane: number,
	lanesAtTick: ReadonlySet<number>,
): string | null {
	switch (lane) {
		case 0:
			return "kick";
		case 1:
			return "snare";
		case 2:
			return lanesAtTick.has(66) ? "hihat_closed" : "tom_high";
		case 3:
			return lanesAtTick.has(67) ? "ride" : "tom_mid";
		case 4:
			return lanesAtTick.has(68) ? "crash" : "tom_floor";
		default:
			return null;
	}
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}
