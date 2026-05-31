import type { SongSection, TempoEvent, TimeSignatureEvent } from "@chdg/core";

const TEXT_KEY = "#text";
const DEFAULT_RESOLUTION = 960;
const DEFAULT_TIME_SIGNATURE: TimeSignatureValue = { numerator: 4, denominator: 4 };

type XmlNode = Record<string, unknown>;
type TimeSignatureValue = { numerator: number; denominator: number };

export type GpifMasterBarTimelineEntry = {
	index: number;
	startTick: number;
	durationTicks: number;
	numerator: number;
	denominator: number;
};

export type GpifTimeline = {
	resolution: number;
	masterBars: GpifMasterBarTimelineEntry[];
	tempos: TempoEvent[];
	timeSignatures: TimeSignatureEvent[];
	sections: SongSection[];
	issues: string[];
};

export function buildGpifTimeline(
	root: unknown,
	resolution = DEFAULT_RESOLUTION,
): GpifTimeline {
	const issues: string[] = [];
	const masterBarNodes = findObjectsByKey(root, "MasterBar");
	const fallbackBarCount = findObjectsByKey(root, "Bar").length;
	const barCount = masterBarNodes.length > 0 ? masterBarNodes.length : Math.max(fallbackBarCount, 1);
	const masterBars = buildMasterBars(masterBarNodes, barCount, resolution);
	const tempos = extractTempoEvents(root, masterBars, resolution);
	const timeSignatures = extractTimeSignatureEvents(masterBars);
	const sections = extractSectionEvents(root, masterBars, resolution);

	if (tempos.length === 0) {
		tempos.push({ tick: 0, bpm: 120 });
		issues.push("No recognized GPIF tempo timeline events found; defaulted to 120 BPM.");
	}
	if (timeSignatures.length === 0) {
		timeSignatures.push({ tick: 0, numerator: 4, denominator: 4 });
		issues.push("No recognized GPIF time signature timeline events found; defaulted to 4/4.");
	}

	return {
		resolution,
		masterBars,
		tempos: dedupeTempos(tempos),
		timeSignatures: dedupeTimeSignatures(timeSignatures),
		sections: dedupeSections(sections),
		issues,
	};
}

export function barPositionToTick(
	timeline: Pick<GpifTimeline, "masterBars" | "resolution">,
	bar: number,
	position = 0,
): number | undefined {
	if (!Number.isInteger(bar) || bar < 0) return undefined;
	const entry = timeline.masterBars[bar];
	if (!entry) return undefined;
	return entry.startTick + positionToTicks(position, timeline.resolution);
}

function buildMasterBars(
	masterBarNodes: XmlNode[],
	barCount: number,
	resolution: number,
): GpifMasterBarTimelineEntry[] {
	const out: GpifMasterBarTimelineEntry[] = [];
	let startTick = 0;
	let current: TimeSignatureValue = { ...DEFAULT_TIME_SIGNATURE };

	for (let index = 0; index < barCount; index += 1) {
		const parsed = masterBarNodes[index]
			? extractTimeSignature(masterBarNodes[index])
			: undefined;
		if (parsed) current = parsed;
		const durationTicks = measureDurationTicks(current, resolution);
		out.push({ index, startTick, durationTicks, ...current });
		startTick += durationTicks;
	}
	return out;
}

function extractTempoEvents(
	root: unknown,
	masterBars: GpifMasterBarTimelineEntry[],
	resolution: number,
): TempoEvent[] {
	const events: TempoEvent[] = [];
	for (const automation of findObjectsByKey(root, "Automation")) {
		const type = firstNestedValue(automation, ["Type", "type"]);
		if (!type || !/tempo|bpm/i.test(type)) continue;
		const bpm = parseBpm(
			firstNestedValue(automation, ["Value", "value", "Tempo", "tempo", "BPM", "bpm"]),
		);
		if (bpm === undefined) continue;
		const bar = firstIntegerInObject(automation, ["Bar", "bar", "Measure", "measure"]);
		const position = firstNumberInObject(automation, ["Position", "position", "Tick", "tick", "Ticks", "ticks"]);
		const tick =
			bar === undefined
				? 0
				: barPositionToTick({ masterBars, resolution }, bar, position ?? 0);
		if (tick !== undefined) events.push({ tick, bpm });
	}

	const metadataBpm = parseBpm(firstNestedValue(root, ["Tempo", "tempo", "BPM", "bpm"]));
	if (metadataBpm !== undefined && !events.some((event) => event.tick === 0)) {
		events.push({ tick: 0, bpm: metadataBpm });
	}
	return events;
}

function extractTimeSignatureEvents(
	masterBars: GpifMasterBarTimelineEntry[],
): TimeSignatureEvent[] {
	const events: TimeSignatureEvent[] = [];
	let previous: { numerator: number; denominator: number } | undefined;
	for (const bar of masterBars) {
		if (
			previous === undefined ||
			previous.numerator !== bar.numerator ||
			previous.denominator !== bar.denominator
		) {
			events.push({
				tick: bar.startTick,
				numerator: bar.numerator,
				denominator: bar.denominator,
			});
			previous = { numerator: bar.numerator, denominator: bar.denominator };
		}
	}
	return events;
}

function extractSectionEvents(
	root: unknown,
	masterBars: GpifMasterBarTimelineEntry[],
	resolution: number,
): SongSection[] {
	const sections: SongSection[] = [];
	for (const node of [
		...findObjectsByKey(root, "Marker"),
		...findObjectsByKey(root, "Section"),
	]) {
		const name = firstNestedValue(node, ["Name", "name", "Text", "text", "Title", "title"]);
		if (!name || name.length > 120 || /^-?\d+(?:\.\d+)?$/.test(name)) continue;
		const bar = firstIntegerInObject(node, ["Bar", "bar", "Measure", "measure"]);
		const position = firstNumberInObject(node, ["Position", "position", "Tick", "tick", "Ticks", "ticks"]);
		let tick = firstNumberInObject(node, ["StartTick", "startTick"]);
		if (tick === undefined && bar !== undefined) {
			tick = barPositionToTick({ masterBars, resolution }, bar, position ?? 0);
		}
		sections.push({ tick: Math.max(0, Math.trunc(tick ?? 0)), name });
	}
	return sections;
}

function positionToTicks(position: number, resolution: number): number {
	if (!Number.isFinite(position)) return 0;
	return Math.round(position <= 16 && !Number.isInteger(position) ? position * resolution : position);
}

function measureDurationTicks(
	timeSignature: { numerator: number; denominator: number },
	resolution: number,
): number {
	return Math.round(timeSignature.numerator * resolution * (4 / timeSignature.denominator));
}

function extractTimeSignature(node: XmlNode): { numerator: number; denominator: number } | undefined {
	const text = firstNestedValue(node, ["Time", "TimeSignature", "time", "timeSignature"]);
	const fromText = parseTimeSignature(text);
	if (fromText) return fromText;
	const numerator = firstIntegerInObject(node, ["Numerator", "numerator", "Beats", "beats"]);
	const denominator = firstIntegerInObject(node, ["Denominator", "denominator", "BeatType", "beatType"]);
	return numerator !== undefined && denominator !== undefined && validTimeSignature(numerator, denominator)
		? { numerator, denominator }
		: undefined;
}

function parseTimeSignature(value: string | undefined): { numerator: number; denominator: number } | undefined {
	if (!value) return undefined;
	const match = value.match(/\b(\d{1,2})\s*\/\s*(\d{1,2})\b/);
	if (!match) return undefined;
	const numerator = Number(match[1]);
	const denominator = Number(match[2]);
	return validTimeSignature(numerator, denominator) ? { numerator, denominator } : undefined;
}

function validTimeSignature(
	numerator: number | undefined,
	denominator: number | undefined,
): boolean {
	return (
		Number.isInteger(numerator) &&
		Number.isInteger(denominator) &&
		(numerator ?? 0) > 0 &&
		(denominator ?? 0) > 0
	);
}

function dedupeTempos(events: TempoEvent[]): TempoEvent[] {
	const byTick = new Map<number, TempoEvent>();
	for (const event of events) byTick.set(Math.max(0, Math.trunc(event.tick)), { tick: Math.max(0, Math.trunc(event.tick)), bpm: event.bpm });
	return Array.from(byTick.values()).sort((a, b) => a.tick - b.tick || a.bpm - b.bpm);
}

function dedupeTimeSignatures(events: TimeSignatureEvent[]): TimeSignatureEvent[] {
	const seen = new Set<string>();
	return events
		.map((event) => ({ ...event, tick: Math.max(0, Math.trunc(event.tick)) }))
		.filter((event) => {
			const key = `${event.tick}:${event.numerator}/${event.denominator}`;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		})
		.sort((a, b) => a.tick - b.tick);
}

function dedupeSections(sections: SongSection[]): SongSection[] {
	const seen = new Set<string>();
	return sections
		.filter((section) => section.name.trim().length > 0)
		.filter((section) => {
			const key = `${section.tick}:${section.name}`;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		})
		.sort((a, b) => a.tick - b.tick || a.name.localeCompare(b.name));
}

function findObjectsByKey(value: unknown, targetKey: string): XmlNode[] {
	const matches: XmlNode[] = [];
	if (Array.isArray(value)) {
		for (const item of value) matches.push(...findObjectsByKey(item, targetKey));
	} else if (isObject(value)) {
		for (const [key, child] of Object.entries(value)) {
			if (key === targetKey) {
				const nodes = Array.isArray(child) ? child : [child];
				matches.push(...nodes.filter(isObject));
			}
			matches.push(...findObjectsByKey(child, targetKey));
		}
	}
	return matches;
}

function firstIntegerInObject(obj: XmlNode, keys: string[]): number | undefined {
	const value = firstNumberInObject(obj, keys);
	return Number.isInteger(value) ? value : undefined;
}

function firstNumberInObject(obj: XmlNode, keys: string[]): number | undefined {
	const value = firstNestedValue(obj, keys);
	return parseNumber(value);
}

function firstNestedValue(obj: unknown, keys: string[]): string | undefined {
	if (!isObject(obj)) return undefined;
	for (const key of keys) {
		const text = textFromUnknown(obj[key]);
		if (text) return text;
	}
	for (const value of Object.values(obj)) {
		if (isObject(value)) {
			const nested = firstNestedValue(value, keys);
			if (nested) return nested;
		}
	}
	return undefined;
}

function textFromUnknown(value: unknown): string | undefined {
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	) return String(value).trim();
	if (isObject(value)) {
		return textFromUnknown(value[TEXT_KEY] ?? value.Text ?? value.text ?? value.Name ?? value.name ?? value["@_ref"] ?? value["@_id"]);
	}
	return undefined;
}

function parseBpm(value: string | undefined): number | undefined {
	if (!value) return undefined;
	const direct = parseNumber(value);
	if (direct !== undefined && direct > 0) return direct;
	const match = value.match(/(?:tempo|bpm)\D+(\d+(?:\.\d+)?)/i) ?? value.match(/\b(\d+(?:\.\d+)?)\b/);
	const parsed = parseNumber(match?.[1]);
	return parsed !== undefined && parsed > 0 ? parsed : undefined;
}

function parseNumber(value: string | undefined): number | undefined {
	if (value === undefined) return undefined;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function isObject(value: unknown): value is XmlNode {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
