import { readFile } from "node:fs/promises";
import path from "node:path";

export type AudioPreviewSourceKind = "generated";

export type AudioPreviewSourceResult = {
	srcPath: string;
	sourceKind: AudioPreviewSourceKind;
};

export type AudioPreviewRequest = {
	outputDir?: string;
	generatedSongOggPath?: string;
};

export type ChartPreviewData = {
	resolution: number;
	offsetSeconds: number;
	hasAccurateTiming: boolean;
	limitations: string[];
	noteEvents: Array<{ tick: number; lane: number; seconds: number }>;
};

export type ChartPreviewRequest = {
	outputDir?: string;
	chartPath?: string;
};

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

export async function parseChartPreviewData(chartPath: string): Promise<ChartPreviewData> {
	const text = await readFile(chartPath, "utf8");
	const resolution = parseResolution(text) ?? 192;
	const offsetSeconds = parseOffset(text) ?? 0;
	const tempos = parseTempos(text);
	const noteEvents = parseExpertDrumsNotes(text).map((note) => ({
		...note,
		seconds: tickToSeconds(note.tick, resolution, tempos),
	}));
	return {
		resolution,
		offsetSeconds,
		hasAccurateTiming: tempos.length > 0,
		limitations:
			tempos.length > 0
				? []
				: ["Tempo map unavailable; note timing uses 120 BPM fallback."],
		noteEvents,
	};
}

function parseResolution(text: string): number | undefined {
	const m = text.match(/Resolution\s*=\s*(\d+)/);
	return m ? Number(m[1]) : undefined;
}

function parseOffset(text: string): number | undefined {
	const m = text.match(/Offset\s*=\s*(-?\d+(?:\.\d+)?)/);
	return m ? Number(m[1]) : undefined;
}

function parseTempos(text: string): Array<{ tick: number; bpm: number }> {
	const sync = section(text, "SyncTrack");
	if (!sync) return [];
	const events: Array<{ tick: number; bpm: number }> = [];
	for (const line of sync.split(/\r?\n/)) {
		const m = line.match(/^(\s*\d+)\s*=\s*B\s+(\d+)/);
		if (!m) continue;
		const tick = Number(m[1].trim());
		const chartBpmValue = Number(m[2]);
		const bpm = chartBpmValue / 1000;
		if (Number.isFinite(tick) && Number.isFinite(bpm) && bpm > 0) {
			events.push({ tick, bpm });
		}
	}
	return events.sort((a, b) => a.tick - b.tick);
}

function parseExpertDrumsNotes(text: string): Array<{ tick: number; lane: number }> {
	const drums = section(text, "ExpertDrums");
	if (!drums) return [];
	const notes: Array<{ tick: number; lane: number }> = [];
	for (const line of drums.split(/\r?\n/)) {
		const m = line.match(/^(\s*\d+)\s*=\s*N\s+(\d+)\s+\d+/);
		if (!m) continue;
		const tick = Number(m[1].trim());
		const lane = Number(m[2]);
		if (Number.isFinite(tick) && Number.isFinite(lane)) {
			notes.push({ tick, lane });
		}
	}
	return notes.sort((a, b) => a.tick - b.tick);
}

function tickToSeconds(tick: number, resolution: number, tempos: Array<{ tick: number; bpm: number }>): number {
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

function section(text: string, name: "SyncTrack" | "ExpertDrums"): string | undefined {
	const marker = `[${name}]`;
	const start = text.indexOf(marker);
	if (start < 0) return undefined;
	const bodyStart = start + marker.length;
	const nextSection = text.indexOf("\n[", bodyStart);
	return (nextSection >= 0 ? text.slice(bodyStart, nextSection) : text.slice(bodyStart)).trim();
}
