import { readFile } from "node:fs/promises";
import path from "node:path";
import {
	compareGeneratedChartTiming,
	parseGeneratedChartTiming,
	summarizeTimingDiagnostics,
	type GeneratedChartTiming,
	type SourceTimingSnapshot,
	type TimingDiagnosticsSummary,
	type ChdgProjectAnalysisCache,
} from "@chdg/project";

export type AudioPreviewSourceKind = "generated";

export type AudioPreviewSourceResult = {
	srcPath: string;
	sourceKind: AudioPreviewSourceKind;
};

export type AudioPreviewRequest = {
	outputDir?: string;
	generatedSongOggPath?: string;
};

export type ChartPreviewSectionEvent = {
	tick: number;
	name: string;
	seconds: number;
	source: "generated-chart";
};

export type ChartPreviewNoteEvent = {
	tick: number;
	lane: number;
	length: number;
	seconds: number;
	endSeconds: number;
};

export type ChartPreviewData = {
	resolution: number;
	offsetSeconds: number;
	hasAccurateTiming: boolean;
	limitations: string[];
	noteEvents: ChartPreviewNoteEvent[];
	sectionEvents: ChartPreviewSectionEvent[];
	timing: GeneratedChartTiming & {
		summary: TimingDiagnosticsSummary;
	};
};

export type ChartPreviewRequest = {
	outputDir?: string;
	chartPath?: string;
};

export function sourceTimingFromAnalysisCache(
	cache: ChdgProjectAnalysisCache | undefined,
): SourceTimingSnapshot | undefined {
	if (!cache) return undefined;
	const normalized = sourceTimingSnapshot(cache.normalizedTiming, true);
	if (normalized) return normalized;
	const inspection = sourceTimingSnapshot(cache.inspection);
	if (!inspection) return undefined;
	const hasNoGpifTimingData =
		cache.inspection.sourceKind === "gpif" &&
		inspection.resolution === undefined &&
		inspection.tempos.length === 0 &&
		inspection.timeSignatures.length === 0 &&
		inspection.sections.length === 0;
	return hasNoGpifTimingData ? undefined : inspection;
}

function sourceTimingSnapshot(input: {
	resolution?: unknown;
	tempos?: unknown;
	timeSignatures?: unknown;
	sections?: unknown;
} | undefined, requireResolution = false): SourceTimingSnapshot | undefined {
	if (!input) return undefined;
	if (
		requireResolution &&
		(typeof input.resolution !== "number" ||
			!Number.isFinite(input.resolution) ||
			input.resolution <= 0)
	) {
		return undefined;
	}
	const {
		tempos: cachedTempos,
		timeSignatures: cachedTimeSignatures,
		sections: cachedSections,
	} = input;
	if (
		!Array.isArray(cachedTempos) ||
		!Array.isArray(cachedTimeSignatures) ||
		!Array.isArray(cachedSections)
	) {
		return undefined;
	}
	const tempos = cachedTempos.flatMap((value) =>
		isTempo(value) ? [value] : [],
	);
	const timeSignatures = cachedTimeSignatures.flatMap((value) =>
		isTimeSignature(value) ? [value] : [],
	);
	const sections = cachedSections.flatMap((value) =>
		isSongSection(value) ? [value] : [],
	);
	const hasUnusableTimingValues =
		tempos.length !== cachedTempos.length ||
		timeSignatures.length !== cachedTimeSignatures.length ||
		sections.length !== cachedSections.length;
	if (hasUnusableTimingValues) return undefined;

	return {
		resolution:
			typeof input.resolution === "number" &&
			Number.isFinite(input.resolution) &&
			input.resolution > 0
				? input.resolution
				: undefined,
		tempos,
		timeSignatures,
		sections,
	};
}

export function resolveChartPreviewPath(input: ChartPreviewRequest): {
	resolvedOutputDir?: string;
	chartPath: string;
	chartDir: string;
} {
	const resolvedOutputDir =
		typeof input.outputDir === "string" && input.outputDir.trim().length > 0
			? path.resolve(input.outputDir)
			: undefined;
	const chartPathCandidate =
		typeof input.chartPath === "string" && input.chartPath.trim().length > 0
			? input.chartPath
			: resolvedOutputDir
				? path.join(resolvedOutputDir, "notes.chart")
				: "";
	const chartPath = path.resolve(chartPathCandidate);
	if (!chartPathCandidate || !chartPath) {
		throw new Error("PREVIEW_CHART_NOT_AVAILABLE");
	}
	if (path.basename(chartPath).toLowerCase() !== "notes.chart") {
		throw new Error("PREVIEW_CHART_NOT_ALLOWED");
	}
	const chartDir = path.dirname(chartPath);
	if (resolvedOutputDir && chartDir !== resolvedOutputDir) {
		throw new Error("PREVIEW_CHART_NOT_ALLOWED");
	}
	return { resolvedOutputDir, chartPath, chartDir };
}

export function pickAudioPreviewCandidate(input: AudioPreviewRequest): {
	generatedPath?: string;
} {
	const generatedPath =
		typeof input.generatedSongOggPath === "string" &&
		input.generatedSongOggPath.trim().length > 0
			? input.generatedSongOggPath
			: typeof input.outputDir === "string" && input.outputDir.trim().length > 0
				? path.join(input.outputDir, "song.ogg")
				: undefined;

	return { generatedPath };
}

export async function parseChartPreviewData(
	chartPath: string,
	sourceTiming?: SourceTimingSnapshot,
): Promise<ChartPreviewData> {
	const text = await readFile(chartPath, "utf8");
	const generatedTiming = parseGeneratedChartTiming(text);
	const sourceDiagnostics = compareGeneratedChartTiming(
		generatedTiming,
		sourceTiming,
	);
	const diagnostics = [...generatedTiming.diagnostics, ...sourceDiagnostics];
	const timing = {
		...generatedTiming,
		diagnostics,
		summary: summarizeTimingDiagnostics(diagnostics),
	};
	const resolution = timing.resolution;
	const offsetSeconds = timing.offsetSeconds;
	const tempos = timing.hasAccurateTiming
		? timing.tempos.map(({ tick, bpm }) => ({ tick, bpm }))
		: [
				{ tick: 0, bpm: 120 },
				...timing.tempos.map(({ tick, bpm }) => ({ tick, bpm })),
			];
	const noteEvents = parseExpertDrumsNotes(text).map((note) => {
		const seconds = tickToSeconds(note.tick, resolution, tempos);
		const endSeconds = tickToSeconds(note.tick + note.length, resolution, tempos);
		return {
			...note,
			seconds,
			endSeconds: Math.max(seconds, endSeconds),
		};
	});
	const sectionEvents = timing.sections;
	return {
		resolution,
		offsetSeconds,
		hasAccurateTiming: timing.hasAccurateTiming,
		limitations:
			timing.hasAccurateTiming
				? []
				: [
						timing.tempos.length > 0
							? "Timing is low confidence: note timing uses 120 BPM until the first usable tempo, then honors later valid tempo changes."
							: "Timing is low confidence: tempo map unavailable, so note timing uses a 120 BPM fallback.",
					],
		noteEvents,
		sectionEvents,
		timing,
	};
}

function parseExpertDrumsNotes(text: string): Array<{
	tick: number;
	lane: number;
	length: number;
}> {
	const drums = section(text, "ExpertDrums");
	if (!drums) return [];
	const notes: Array<{ tick: number; lane: number; length: number }> = [];
	for (const line of drums.split(/\r?\n/)) {
		const m = line.match(/^\s*(-?\d+)\s*=\s*N\s+(-?\d+)\s+(-?\d+)\s*$/);
		if (!m) continue;
		const tick = Number(m[1]);
		const lane = Number(m[2]);
		const length = Number(m[3]);
		if (
			isNonNegativeInteger(tick) &&
			isNonNegativeInteger(lane) &&
			isNonNegativeInteger(length)
		) {
			notes.push({ tick, lane, length });
		}
	}
	return notes.sort(
		(a, b) => a.tick - b.tick || a.lane - b.lane || a.length - b.length,
	);
}

function isNonNegativeInteger(value: number): boolean {
	return Number.isInteger(value) && value >= 0;
}

function tickToSeconds(
	tick: number,
	resolution: number,
	tempos: Array<{ tick: number; bpm: number }>,
): number {
	if (!Number.isFinite(tick) || tick <= 0) return 0;
	if (tempos.length === 0) {
		return tick / resolution / 2;
	}
	let total = 0;
	for (let i = 0; i < tempos.length; i += 1) {
		const current = tempos[i];
		const nextTick = tempos[i + 1]?.tick ?? tick;
		if (tick <= current.tick) break;
		const start = current.tick;
		const end = Math.min(tick, nextTick);
		if (end <= start) continue;
		const beats = (end - start) / resolution;
		total += (beats * 60) / current.bpm;
		if (tick <= nextTick) break;
	}
	return total;
}

function section(text: string, name: "SyncTrack" | "ExpertDrums" | "Events"): string | undefined {
	const marker = `[${name}]`;
	const start = text.indexOf(marker);
	if (start < 0) return undefined;
	const bodyStart = start + marker.length;
	const nextSection = text.indexOf("\n[", bodyStart);
	return (nextSection >= 0 ? text.slice(bodyStart, nextSection) : text.slice(bodyStart)).trim();
}

function isTempo(value: unknown): value is { tick: number; bpm: number } {
	return (
		isRecord(value) &&
		isFiniteNumber(value["tick"]) &&
		isFiniteNumber(value["bpm"])
	);
}

function isTimeSignature(
	value: unknown,
): value is { tick: number; numerator: number; denominator: number } {
	return (
		isRecord(value) &&
		isFiniteNumber(value["tick"]) &&
		isFiniteNumber(value["numerator"]) &&
		isFiniteNumber(value["denominator"])
	);
}

function isSongSection(value: unknown): value is { tick: number; name: string } {
	return (
		isRecord(value) &&
		isFiniteNumber(value["tick"]) &&
		typeof value["name"] === "string"
	);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}
