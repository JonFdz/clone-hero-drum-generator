export type TimingDiagnosticSeverity = "info" | "warning" | "error";

export type TimingDiagnostic = {
	severity: TimingDiagnosticSeverity;
	code: string;
	message: string;
	details?: Record<string, unknown>;
};

export type GeneratedTempoEvent = {
	tick: number;
	bpm: number;
	seconds: number;
	source: "generated-chart";
};

export type GeneratedTimeSignatureEvent = {
	tick: number;
	numerator: number;
	denominator: number;
	seconds: number;
	source: "generated-chart";
};

export type GeneratedSectionEvent = {
	tick: number;
	name: string;
	seconds: number;
	source: "generated-chart";
};

export type GeneratedNoteTimingSummary = {
	count: number;
	firstTick?: number;
	lastTick?: number;
	firstSeconds?: number;
	lastSeconds?: number;
};

export type GeneratedChartTiming = {
	resolution: number;
	offsetSeconds: number;
	hasAccurateTiming: boolean;
	tempos: GeneratedTempoEvent[];
	timeSignatures: GeneratedTimeSignatureEvent[];
	sections: GeneratedSectionEvent[];
	notes: GeneratedNoteTimingSummary;
	diagnostics: TimingDiagnostic[];
};

export type SourceTimingSnapshot = {
	resolution?: number;
	tempos: Array<{ tick: number; bpm: number }>;
	timeSignatures: Array<{
		tick: number;
		numerator: number;
		denominator: number;
	}>;
	sections: Array<{ tick: number; name: string }>;
};

export type TimingDiagnosticsSummary = {
	status: "ok" | TimingDiagnosticSeverity;
	label: string;
	errorCount: number;
	warningCount: number;
	infoCount: number;
	importantMessages: string[];
};

const DEFAULT_RESOLUTION = 192;
const FALLBACK_BPM = 120;
const LONG_SONG_SECONDS = 180;
const BPM_TOLERANCE = 0.001;

type ParsedTempo = { tick: number; bpm: number };
type ParsedTimeSignature = {
	tick: number;
	numerator: number;
	denominator: number;
};

export function parseGeneratedChartTiming(text: string): GeneratedChartTiming {
	const resolution = parsePositiveNumberProperty(text, "Resolution") ?? DEFAULT_RESOLUTION;
	const offsetSeconds = parseNumberProperty(text, "Offset") ?? 0;
	const syncBody = chartSection(text, "SyncTrack");
	const parsedSync = parseSyncTrack(syncBody);
	const validTempos = parsedSync.tempos
		.filter((tempo) => Number.isFinite(tempo.bpm) && tempo.bpm > 0)
		.sort((a, b) => a.tick - b.tick);
	const hasInitialTempo = validTempos.some((tempo) => tempo.tick === 0);
	const hasAccurateTiming = validTempos.length > 0 && hasInitialTempo;
	const timingTempos = hasInitialTempo
		? validTempos
		: [{ tick: 0, bpm: FALLBACK_BPM }, ...validTempos];
	const toSeconds = (tick: number) => tickToSeconds(tick, resolution, timingTempos);
	const noteTicks = parseExpertDrumsNoteTicks(chartSection(text, "ExpertDrums"));
	const firstTick = noteTicks[0];
	const lastTick = noteTicks.at(-1);
	const notes: GeneratedNoteTimingSummary = {
		count: noteTicks.length,
		...(firstTick === undefined
			? {}
			: { firstTick, firstSeconds: toSeconds(firstTick) }),
		...(lastTick === undefined
			? {}
			: { lastTick, lastSeconds: toSeconds(lastTick) }),
	};
	const tempos = validTempos.map((tempo) => ({
		...tempo,
		seconds: toSeconds(tempo.tick),
		source: "generated-chart" as const,
	}));
	const timeSignatures = parsedSync.timeSignatures
		.sort((a, b) => a.tick - b.tick)
		.map((timeSignature) => ({
			...timeSignature,
			seconds: toSeconds(timeSignature.tick),
			source: "generated-chart" as const,
		}));
	const sections = parseSections(chartSection(text, "Events"))
		.sort((a, b) => a.tick - b.tick)
		.map((section) => ({
			...section,
			seconds: toSeconds(section.tick),
			source: "generated-chart" as const,
		}));
	const diagnostics = buildGeneratedDiagnostics({
		offsetSeconds,
		hasAccurateTiming,
		tempos,
		timeSignatures,
		notes,
		duplicateTempoTicks: duplicateTicks(parsedSync.tempos),
		invalidTempoTicks: parsedSync.invalidTempoTicks,
		syncUnsorted: parsedSync.unsorted,
	});

	return {
		resolution,
		offsetSeconds,
		hasAccurateTiming,
		tempos,
		timeSignatures,
		sections,
		notes,
		diagnostics,
	};
}

export function compareGeneratedChartTiming(
	generated: GeneratedChartTiming,
	source: SourceTimingSnapshot | undefined,
): TimingDiagnostic[] {
	if (!source) {
		return [
			diagnostic(
				"info",
				"SOURCE_COMPARISON_UNAVAILABLE",
				"Source comparison unavailable. Open Source Review or Generate to refresh cached analysis.",
			),
		];
	}
	if (
		source.resolution !== undefined &&
		source.resolution !== generated.resolution
	) {
		return [
			diagnostic(
				"info",
				"SOURCE_GENERATED_RESOLUTION_MISMATCH",
				`Source resolution ${source.resolution} differs from generated resolution ${generated.resolution}; exact-tick comparison was skipped.`,
				{
					sourceResolution: source.resolution,
					generatedResolution: generated.resolution,
				},
			),
		];
	}

	const diagnostics: TimingDiagnostic[] = [];
	if (source.tempos.length !== generated.tempos.length) {
		diagnostics.push(
			diagnostic(
				"warning",
				"SOURCE_GENERATED_TEMPO_COUNT_MISMATCH",
				`Possible tempo drift: cached source analysis has ${source.tempos.length} tempo events, but generated notes.chart has ${generated.tempos.length}.`,
				{
					sourceCount: source.tempos.length,
					generatedCount: generated.tempos.length,
				},
			),
		);
	}
	for (const tempo of source.tempos) {
		if (
			!generated.tempos.some(
				(candidate) =>
					candidate.tick === tempo.tick &&
					Math.abs(candidate.bpm - tempo.bpm) <= BPM_TOLERANCE + 1e-9,
			)
		) {
			diagnostics.push(
				diagnostic(
					"warning",
					"SOURCE_TEMPO_MISSING_IN_GENERATED",
					`Possible tempo drift: cached source tempo ${formatBpm(tempo.bpm)} BPM at tick ${tempo.tick} is missing from generated notes.chart.`,
					{ tick: tempo.tick, bpm: tempo.bpm },
				),
			);
		}
	}
	for (const tempo of generated.tempos) {
		if (
			!source.tempos.some(
				(candidate) =>
					candidate.tick === tempo.tick &&
					Math.abs(candidate.bpm - tempo.bpm) <= BPM_TOLERANCE + 1e-9,
			)
		) {
			diagnostics.push(
				diagnostic(
					"info",
					"GENERATED_EXTRA_TEMPO",
					`Generated notes.chart contains an extra tempo ${formatBpm(tempo.bpm)} BPM at tick ${tempo.tick}.`,
					{ tick: tempo.tick, bpm: tempo.bpm },
				),
			);
		}
	}
	const timeSignaturesMatch =
		source.timeSignatures.length === generated.timeSignatures.length &&
		source.timeSignatures.every((timeSignature) =>
			generated.timeSignatures.some(
				(candidate) =>
					candidate.tick === timeSignature.tick &&
					candidate.numerator === timeSignature.numerator &&
					candidate.denominator === timeSignature.denominator,
			),
		);
	if (!timeSignaturesMatch) {
		const countMessage =
			source.timeSignatures.length !== generated.timeSignatures.length
				? `Cached source analysis has ${source.timeSignatures.length} time signatures, but generated notes.chart has ${generated.timeSignatures.length}.`
				: "Cached source and generated notes.chart time signatures differ by tick, numerator, or denominator.";
		diagnostics.push(
			diagnostic(
				"warning",
				"SOURCE_GENERATED_TS_COUNT_MISMATCH",
				countMessage,
				{
					sourceCount: source.timeSignatures.length,
					generatedCount: generated.timeSignatures.length,
				},
			),
		);
	}
	for (const section of source.sections) {
		if (
			!generated.sections.some(
				(candidate) =>
					candidate.tick === section.tick &&
					normalizeSectionName(candidate.name) ===
						normalizeSectionName(section.name),
			)
		) {
			diagnostics.push(
				diagnostic(
					"info",
					"SOURCE_SECTION_MISSING_IN_GENERATED",
					`Cached source section "${section.name.trim()}" at tick ${section.tick} is missing from generated notes.chart.`,
					{ tick: section.tick, name: section.name },
				),
			);
		}
	}
	return diagnostics;
}

export function summarizeTimingDiagnostics(
	diagnostics: TimingDiagnostic[],
): TimingDiagnosticsSummary {
	const errorCount = diagnostics.filter((item) => item.severity === "error").length;
	const warningCount = diagnostics.filter(
		(item) => item.severity === "warning",
	).length;
	const infoCount = diagnostics.filter((item) => item.severity === "info").length;
	const status: TimingDiagnosticsSummary["status"] =
		errorCount > 0
			? "error"
			: warningCount > 0
				? "warning"
				: infoCount > 0
					? "info"
					: "ok";
	const parts = [
		errorCount > 0 ? `${errorCount} ${plural(errorCount, "error")}` : "",
		warningCount > 0
			? `${warningCount} ${plural(warningCount, "warning")}`
			: "",
		infoCount > 0 ? `${infoCount} info` : "",
	].filter(Boolean);
	return {
		status,
		label: parts.length > 0 ? `Timing: ${parts.join(", ")}` : "Timing: OK",
		errorCount,
		warningCount,
		infoCount,
		importantMessages: diagnostics
			.filter((item) => item.severity === "error" || item.severity === "warning")
			.map((item) => item.message),
	};
}

export function formatChartTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) return "Unavailable";
	const minutes = Math.floor(seconds / 60);
	const remaining = seconds - minutes * 60;
	return `${String(minutes).padStart(2, "0")}:${remaining
		.toFixed(3)
		.padStart(6, "0")}`;
}

function parseSyncTrack(body: string | undefined): {
	tempos: ParsedTempo[];
	timeSignatures: ParsedTimeSignature[];
	invalidTempoTicks: number[];
	unsorted: boolean;
} {
	const tempos: ParsedTempo[] = [];
	const timeSignatures: ParsedTimeSignature[] = [];
	const invalidTempoTicks: number[] = [];
	const orderedTicks: number[] = [];
	for (const line of body?.split(/\r?\n/) ?? []) {
		const event = line.match(/^\s*(\d+)\s*=\s*(B|TS)\s+(.+?)\s*$/);
		if (!event) continue;
		const tick = Number(event[1]);
		const kind = event[2];
		const values = event[3].trim().split(/\s+/);
		orderedTicks.push(tick);
		if (kind === "B") {
			const chartBpm = Number(values[0]);
			const bpm = chartBpm / 1000;
			if (!Number.isFinite(chartBpm) || !Number.isFinite(bpm) || bpm <= 0) {
				invalidTempoTicks.push(tick);
			}
			tempos.push({ tick, bpm });
			continue;
		}
		const numerator = Number(values[0]);
		const exponent = values[1] === undefined ? 2 : Number(values[1]);
		const denominator = 2 ** exponent;
		if (
			Number.isFinite(numerator) &&
			numerator > 0 &&
			Number.isFinite(denominator) &&
			denominator > 0
		) {
			timeSignatures.push({ tick, numerator, denominator });
		}
	}
	return {
		tempos,
		timeSignatures,
		invalidTempoTicks,
		unsorted: orderedTicks.some((tick, index) => index > 0 && tick < orderedTicks[index - 1]),
	};
}

function buildGeneratedDiagnostics(input: {
	offsetSeconds: number;
	hasAccurateTiming: boolean;
	tempos: GeneratedTempoEvent[];
	timeSignatures: GeneratedTimeSignatureEvent[];
	notes: GeneratedNoteTimingSummary;
	duplicateTempoTicks: number[];
	invalidTempoTicks: number[];
	syncUnsorted: boolean;
}): TimingDiagnostic[] {
	const diagnostics: TimingDiagnostic[] = [];
	if (input.tempos.length === 0) {
		diagnostics.push(
			diagnostic(
				"warning",
				"TIMING_NO_TEMPO_EVENTS",
				"Generated notes.chart has no usable tempo events.",
			),
		);
	} else if (!input.tempos.some((tempo) => tempo.tick === 0)) {
		diagnostics.push(
			diagnostic(
				"warning",
				"TIMING_NO_INITIAL_TEMPO",
				"Generated notes.chart has no tempo at tick 0.",
			),
		);
	}
	if (input.timeSignatures.length === 0) {
		diagnostics.push(
			diagnostic(
				input.notes.count > 0 ? "warning" : "info",
				"TIMING_NO_TIME_SIGNATURES",
				"Generated notes.chart has no time-signature events.",
			),
		);
	} else if (!input.timeSignatures.some((event) => event.tick === 0)) {
		diagnostics.push(
			diagnostic(
				"info",
				"TIMING_NO_INITIAL_TIME_SIGNATURE",
				"Generated notes.chart has no time signature at tick 0.",
			),
		);
	}
	for (const tick of input.duplicateTempoTicks) {
		diagnostics.push(
			diagnostic(
				"warning",
				"TIMING_DUPLICATE_TEMPO_TICK",
				`Generated notes.chart has multiple tempo events at tick ${tick}.`,
				{ tick },
			),
		);
	}
	for (const tick of duplicateTicks(input.timeSignatures)) {
		diagnostics.push(
			diagnostic(
				"warning",
				"TIMING_DUPLICATE_TS_TICK",
				`Generated notes.chart has multiple time signatures at tick ${tick}.`,
				{ tick },
			),
		);
	}
	if (input.syncUnsorted) {
		diagnostics.push(
			diagnostic(
				"info",
				"TIMING_UNSORTED_SYNCTRACK",
				"Generated SyncTrack events are not ordered by ascending tick.",
			),
		);
	}
	for (const tick of input.invalidTempoTicks) {
		diagnostics.push(
			diagnostic(
				"error",
				"TIMING_INVALID_BPM",
				`Generated notes.chart has an invalid BPM event at tick ${tick}.`,
				{ tick },
			),
		);
	}
	for (let index = 1; index < input.tempos.length; index += 1) {
		const previous = input.tempos[index - 1];
		const current = input.tempos[index];
		const delta = Math.abs(current.bpm - previous.bpm);
		if (delta > 50) {
			diagnostics.push(
				diagnostic(
					"warning",
					"TIMING_SUSPICIOUS_BPM_JUMP_WARNING",
					`Generated tempo changes by ${formatBpm(delta)} BPM at tick ${current.tick}.`,
					{ tick: current.tick, deltaBpm: delta },
				),
			);
		} else if (delta > 30) {
			diagnostics.push(
				diagnostic(
					"info",
					"TIMING_SUSPICIOUS_BPM_JUMP_INFO",
					`Generated tempo changes by ${formatBpm(delta)} BPM at tick ${current.tick}.`,
					{ tick: current.tick, deltaBpm: delta },
				),
			);
		}
	}
	if (
		input.tempos.length === 1 &&
		(input.notes.lastSeconds ?? 0) > LONG_SONG_SECONDS
	) {
		diagnostics.push(
			diagnostic(
				"info",
				"TIMING_ONLY_ONE_TEMPO_LONG_SONG",
				"Generated chart has one tempo event across a long note timeline; constant tempo may be valid.",
			),
		);
	}
	if (input.offsetSeconds !== 0) {
		diagnostics.push(
			diagnostic(
				"info",
				"TIMING_OFFSET_PRESENT",
				`Offset is set to ${Math.round(input.offsetSeconds * 1000)} ms. Offset shifts the entire chart equally and does not explain progressive drift.`,
				{ offsetSeconds: input.offsetSeconds },
			),
		);
	}
	if (!input.hasAccurateTiming) {
		diagnostics.push(
			diagnostic(
				"info",
				"TIMING_FALLBACK_USED",
				"Generated chart uses 120 BPM fallback timing before a usable initial tempo.",
				{ fallbackBpm: FALLBACK_BPM },
			),
		);
	}
	return diagnostics;
}

function parseExpertDrumsNoteTicks(body: string | undefined): number[] {
	const ticks: number[] = [];
	for (const line of body?.split(/\r?\n/) ?? []) {
		const match = line.match(/^\s*(\d+)\s*=\s*N\s+(\d+)\s+\d+/);
		if (!match) continue;
		const lane = Number(match[2]);
		if (lane >= 0 && lane <= 4) ticks.push(Number(match[1]));
	}
	return ticks.sort((a, b) => a - b);
}

function parseSections(
	body: string | undefined,
): Array<{ tick: number; name: string }> {
	const sections: Array<{ tick: number; name: string }> = [];
	for (const line of body?.split(/\r?\n/) ?? []) {
		const match = line.match(/^\s*(\d+)\s*=\s*E\s+"section\s+(.+)"\s*$/);
		if (!match) continue;
		const name = match[2].trim();
		if (name.length > 0) sections.push({ tick: Number(match[1]), name });
	}
	return sections;
}

function tickToSeconds(
	tick: number,
	resolution: number,
	tempos: ParsedTempo[],
): number {
	if (!Number.isFinite(tick) || tick <= 0) return 0;
	let seconds = 0;
	for (let index = 0; index < tempos.length; index += 1) {
		const current = tempos[index];
		const nextTick = tempos[index + 1]?.tick ?? tick;
		if (tick <= current.tick) break;
		const endTick = Math.min(tick, nextTick);
		if (endTick > current.tick) {
			seconds += ((endTick - current.tick) / resolution) * (60 / current.bpm);
		}
		if (tick <= nextTick) break;
	}
	return seconds;
}

function chartSection(text: string, name: string): string | undefined {
	const match = text.match(
		new RegExp(`\\[${escapeRegExp(name)}\\]\\s*\\{([\\s\\S]*?)\\}`, "i"),
	);
	return match?.[1];
}

function parsePositiveNumberProperty(
	text: string,
	property: string,
): number | undefined {
	const value = parseNumberProperty(text, property);
	return value !== undefined && value > 0 ? value : undefined;
}

function parseNumberProperty(
	text: string,
	property: string,
): number | undefined {
	const body = chartSection(text, "Song");
	const matches = [
		...(body?.matchAll(
			new RegExp(
				`^\\s*${escapeRegExp(property)}\\s*=\\s*(-?\\d+(?:\\.\\d+)?)\\s*$`,
				"gim",
			),
		) ?? []),
	];
	const value = matches.length > 0 ? Number(matches.at(-1)?.[1]) : undefined;
	return value !== undefined && Number.isFinite(value) ? value : undefined;
}

function duplicateTicks(events: Array<{ tick: number }>): number[] {
	const counts = new Map<number, number>();
	for (const event of events) counts.set(event.tick, (counts.get(event.tick) ?? 0) + 1);
	return [...counts.entries()]
		.filter(([, count]) => count > 1)
		.map(([tick]) => tick);
}

function diagnostic(
	severity: TimingDiagnosticSeverity,
	code: string,
	message: string,
	details?: Record<string, unknown>,
): TimingDiagnostic {
	return { severity, code, message, ...(details ? { details } : {}) };
}

function normalizeSectionName(name: string): string {
	return name.trim().toLowerCase();
}

function formatBpm(value: number): string {
	return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function plural(count: number, singular: string): string {
	return count === 1 ? singular : `${singular}s`;
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
