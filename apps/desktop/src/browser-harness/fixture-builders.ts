import type {
	DesktopSettings,
	JsonEnvelope,
	NormalizationPreview,
	RecentProject,
	SourceInspectionResult,
} from "@chdg/project/browser";
import type {
	SourceReviewFingerprint,
	SourceReviewRuntimeCache,
} from "../app/services/desktop-project-runtime";
import type {
	DesktopAppInfo,
	DesktopHealthStatus,
	ChartPreviewData,
	ProjectStatePayload,
} from "../app/services/desktop-bridge.service";
import { stableMappingFingerprint } from "../app/services/source-review-model";

export const HARNESS_TIMESTAMPS = {
	ANALYZED_AT: "2026-01-15T12:00:00.000Z",
	NORMALIZED_AT: "2026-01-15T12:00:01.000Z",
	VALIDATED_AT: "2026-01-15T12:00:02.000Z",
} as const;

export const HARNESS_PATHS = {
	PROJECT: "C:\\CHDG-Harness\\Projects\\Synthetic Artist - Harness Demo - Demo Project\\project.chdg",
	SOURCE: "C:\\CHDG-Harness\\Sources\\demo.mid",
	AUDIO: "C:\\CHDG-Harness\\Sources\\demo.wav",
	OUTPUT: "C:\\CHDG-Harness\\Output\\Demo Song",
	CHART: "C:\\CHDG-Harness\\Output\\Demo Song\\notes.chart",
	SONG_INI: "C:\\CHDG-Harness\\Output\\Demo Song\\song.ini",
	SONG_OGG: "C:\\CHDG-Harness\\Output\\Demo Song\\song.ogg",
} as const;

export const HARNESS_AUDIO_PREVIEW_SRC =
	"data:audio/wav;base64,UklGRkQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YSAAAADoAxj86AMY/OgDGPzoAxj86AMY/OgDGPzoAxj86AMY/A==";

export function successEnvelope<T>(data: T): JsonEnvelope<T> {
	return { ok: true, data, issues: [] };
}

export function failureEnvelope<T>(
	code: string,
	message: string,
): JsonEnvelope<T> {
	return { ok: false, error: { code, message }, issues: [] };
}

export function buildBrowserAppInfo(): DesktopAppInfo {
	return {
		name: "CHDG Browser Harness",
		version: "0.1.0-harness",
		mode: "browser-harness",
	};
}

export function buildBrowserHealth(): DesktopHealthStatus {
	return {
		ok: true,
		appVersion: "0.1.0-harness",
		mode: "browser-harness",
		checks: { bridge: true },
		message: "Browser harness mock bridge connected",
	};
}

export function buildSettings(): DesktopSettings {
	return {
		schemaVersion: 1,
		theme: "dark",
		projectLocation: "C:\\CHDG-Harness\\Projects",
		defaultOutputFolder: HARNESS_PATHS.OUTPUT,
		defaultCharter: "CHDG Harness",
		defaultOffsetMs: 0,
	};
}

export function buildRecentProjects(): RecentProject[] {
	return [
		{
			path: HARNESS_PATHS.PROJECT,
			name: "Synthetic Artist - Harness Demo - Demo Project",
			lastOpenedAt: "2026-01-15T12:00:00.000Z",
		},
	];
}

export function buildSourceFingerprint(): SourceReviewFingerprint {
	return { path: HARNESS_PATHS.SOURCE, sizeBytes: 4096, mtimeMs: 1768478400000 };
}

export function buildInspection(): SourceInspectionResult {
	return {
		sourceKind: "midi",
		sourcePath: HARNESS_PATHS.SOURCE,
		resolution: 480,
		tempos: [{ tick: 0, bpm: 120 }],
		timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
		sections: [{ tick: 0, name: "Intro" }],
		tracks: [
			{
				index: 3,
				name: "Synthetic Drums",
				channel: 10,
				noteCount: 128,
				strength: "strong",
				role: "drums",
				reasons: ["Synthetic General MIDI drum channel"],
			},
		],
		issues: [],
	};
}

export function buildNormalization(attention = false): NormalizationPreview {
	const issues = attention
		? [
				{
					severity: "warning" as const,
					code: "UNKNOWN_MIDI_NOTE",
					message: "Synthetic MIDI note 99 needs a project mapping.",
				},
			]
		: [];
	return {
		sourceKind: "midi",
		sourcePath: HARNESS_PATHS.SOURCE,
		selectedTrack: 3,
		selectedTracks: [3],
		hitCount: attention ? 124 : 128,
		pieceSummary: {
			kick: 48,
			snare: 40,
			hihat_closed: attention ? 36 : 40,
		},
		firstHits: [],
		mappingCandidates: attention
			? [
					{
						key: "midi:99",
						sourceKind: "midi",
						sourceValue: "99",
						label: "Note 99",
						action: "unknown",
						automaticPiece: "unknown",
						count: 4,
						firstTick: 960,
					},
				]
			: [
					{
						key: "midi:36",
						sourceKind: "midi",
						sourceValue: "36",
						label: "Kick",
						action: "map",
						automaticPiece: "kick",
						count: 48,
						firstTick: 0,
					},
				],
		issues,
	};
}

export function buildAnalysis(attention = false): SourceReviewRuntimeCache {
	return {
		schemaVersion: 2,
		sourceFingerprint: buildSourceFingerprint(),
		mappingFingerprint: stableMappingFingerprint({}),
		selectedTracks: [3],
		inspectedAt: HARNESS_TIMESTAMPS.ANALYZED_AT,
		normalizedAt: HARNESS_TIMESTAMPS.NORMALIZED_AT,
		inspection: buildInspection(),
		normalizationPreview: buildNormalization(attention),
	};
}

export function buildProjectPayload(
	overrides: Partial<ProjectStatePayload> = {},
): ProjectStatePayload {
	return {
		project: {
			projectId: "project-harness-demo",
			artist: "Synthetic Artist",
			songName: "Harness Demo",
			projectName: "Demo Project",
			displayName: "Synthetic Artist - Harness Demo - Demo Project",
		},
		projectName: "Synthetic Artist - Harness Demo - Demo Project",
		projectFilePath: HARNESS_PATHS.PROJECT,
		sourcePath: HARNESS_PATHS.SOURCE,
		audioPath: HARNESS_PATHS.AUDIO,
		outputDir: HARNESS_PATHS.OUTPUT,
		sourceKind: "midi",
		selectedTracks: [3],
		metadata: {
			name: "Harness Demo",
			artist: "Synthetic Artist",
			album: "Repository Fixtures",
			year: "2026",
			genre: "Rock",
			charter: "CHDG Harness",
		},
		offsetMs: 0,
		generationStatus: "not-generated",
		...overrides,
	};
}

export function buildChartPreviewData(): ChartPreviewData {
	const noteEvents = [
		{ tick: 0, lane: 0, length: 0, seconds: 0, endSeconds: 0 },
		{ tick: 480, lane: 1, length: 0, seconds: 0.5, endSeconds: 0.5 },
		{ tick: 960, lane: 2, length: 0, seconds: 1, endSeconds: 1 },
	];
	const sectionEvents = [
		{ tick: 0, name: "Intro", seconds: 0, source: "generated-chart" as const },
	];
	return {
		resolution: 480,
		offsetSeconds: 0,
		hasAccurateTiming: true,
		limitations: ["Synthetic chart fixture; browser audio is intentionally unavailable."],
		noteEvents,
		sectionEvents,
		timing: {
			resolution: 480,
			offsetSeconds: 0,
			hasAccurateTiming: true,
			tempos: [{ tick: 0, bpm: 120, seconds: 0, source: "generated-chart" }],
			timeSignatures: [
				{
					tick: 0,
					numerator: 4,
					denominator: 4,
					seconds: 0,
					source: "generated-chart",
				},
			],
			sections: sectionEvents,
			notes: {
				count: noteEvents.length,
				firstTick: 0,
				lastTick: 960,
				firstSeconds: 0,
				lastSeconds: 1,
			},
			diagnostics: [],
			summary: {
				status: "ok",
				label: "Timing: OK",
				errorCount: 0,
				warningCount: 0,
				infoCount: 0,
				importantMessages: [],
			},
		},
	};
}
