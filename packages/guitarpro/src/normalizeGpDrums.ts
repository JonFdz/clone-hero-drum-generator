import type {
	DrumHit,
	DrumPiece,
	SongSection,
	TempoEvent,
	TimeSignatureEvent,
} from "@chdg/core";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { extractGpifFromFile } from "./extractGpif.js";
import { inspectGpifXml } from "./inspectGpif.js";
import {
	DEFAULT_GPIF_DRUM_VELOCITY,
	mapGpifDynamicToVelocity,
} from "./gpifDrumMapping.js";
import {
	resolveGpifArticulation,
	type GpifArticulationMetadata,
	type GpifArticulationResolution,
	type GpifMappingOverrides,
} from "./gpifArticulationResolver.js";
import { buildGpifTimeline } from "./gpifTimeline.js";

const TEXT_KEY = "#text";
const ATTRIBUTE_PREFIX = "@_";
const DEFAULT_RESOLUTION = 960;

type XmlNode = Record<string, unknown>;

type SelectedGpifBar = {
	bar: XmlNode;
	masterBarIndex: number;
};

type GpifSource = {
	kind: "gpif";
	trackIndex: number;
	trackName?: string;
	articulationKey?: string;
	rawArticulation?: string;
	noteName?: string;
	inputMidiNumbers?: number[];
	outputMidiNumber?: number;
	resolvedVia?: string;
	measureIndex?: number;
	beatIndex?: number;
	noteIndex?: number;
};

export type GpUnknownArticulation = {
	key?: string;
	rawArticulation: string;
	count: number;
	measureIndex?: number;
	beatIndex?: number;
	noteIndex?: number;
};

export type GpDrumNormalizationResult = {
	filePath: string;
	trackIndex: number;
	trackName?: string;
	resolution: number;
	hits: DrumHit[];
	tempos: TempoEvent[];
	timeSignatures: TimeSignatureEvent[];
	sections: SongSection[];
	unknownArticulations: GpUnknownArticulation[];
	mappingSources: GpifMappingSource[];
	warnings: string[];
	unhandled: string[];
};

export type NormalizeGpDrumsOptions = {
	trackIndex: number;
	mappingOverrides?: GpifMappingOverrides;
};

export type GpifMappingSource = GpifArticulationResolution & {
	count: number;
	firstTick?: number;
};

export async function normalizeGpDrums(
	filePath: string,
	options: NormalizeGpDrumsOptions,
): Promise<GpDrumNormalizationResult> {
	const extraction = await extractGpifFromFile(filePath);
	return normalizeGpDrumsXml(extraction.xml, {
		filePath,
		trackIndex: options.trackIndex,
		mappingOverrides: options.mappingOverrides,
	});
}

export function normalizeGpDrumsXml(
	xml: string,
	options: { filePath?: string; trackIndex: number; mappingOverrides?: GpifMappingOverrides },
): GpDrumNormalizationResult {
	const root = parseGpifXml(xml);
	const inspection = inspectGpifXml(xml, { filePath: options.filePath });
	const track = inspection.tracks[options.trackIndex];
	if (track === undefined) {
		throw new Error(
			`Invalid GPIF track index ${options.trackIndex}. Available track indexes: ${formatAvailableTrackIndexes(inspection.tracks.length)}.`,
		);
	}

	const warnings = new Set<string>(inspection.warnings);
	const unhandled = new Set<string>();
	if (!track.isDrumCandidate) {
		warnings.add(
			`Selected track [${options.trackIndex}] ${track.name ?? "(unnamed)"} is not a detected drum candidate; normalization will still attempt mapped articulations.`,
		);
	}

	const parsedResolution = extractResolution(root);
	const resolution = parsedResolution ?? DEFAULT_RESOLUTION;
	const timeline = buildGpifTimeline(root, resolution);
	if (
		resolution === DEFAULT_RESOLUTION &&
		parsedResolution === undefined
	) {
		unhandled.add(
			"No recognized GPIF PPQ/resolution found; defaulted to 960 PPQ.",
		);
	}

	const tracks = findObjectsByKey(root, "Track");
	const trackNode = tracks[options.trackIndex];
	const trackRefs = trackReferenceValues(trackNode, options.trackIndex);
	const trackMetadata = {
		trackId: track.id,
		trackIndex: options.trackIndex,
		trackName: track.name,
	};
	const articulationDefinitions = buildArticulationDefinitionIndex(root);
	const globalVoices = objectMapById(findObjectsByKey(root, "Voice"));
	const globalBeats = objectMapById(findObjectsByKey(root, "Beat"));
	const globalNotes = objectMapById(findObjectsByKey(root, "Note"));
	const globalRhythms = objectMapById(findObjectsByKey(root, "Rhythm"));
	const bars = findObjectsByKey(root, "Bar");
	const selectedBars = selectBarsForTrack(
		root,
		bars,
		options.trackIndex,
		trackRefs,
	);

	if (bars.length === 0) {
		unhandled.add(
			"No recognized GPIF bars found; timing could not be normalized.",
		);
	} else if (selectedBars.length === 0) {
		unhandled.add(
			`No recognized GPIF bars were associated with track index ${options.trackIndex}.`,
		);
	}
	for (const item of detectUnsupportedTimingStructures(root)) {
		unhandled.add(item);
	}
	for (const item of timeline.issues) {
		unhandled.add(item);
	}

	const hits: DrumHit[] = [];
	const unknowns = new Map<string, GpUnknownArticulation>();
	const mappingSources = new Map<string, GpifMappingSource>();
	let fallbackMeasureStartTick = 0;

	selectedBars.forEach(({ bar, masterBarIndex }) => {
		const timelineBar = timeline.masterBars[masterBarIndex];
		const measureStartTick = timelineBar?.startTick ?? fallbackMeasureStartTick;
		const voices = resolveChildObjects(bar, "Voice", "Voices", globalVoices);
		if (voices.length === 0) {
			unhandled.add(
				`Measure ${masterBarIndex} has no recognized GPIF voices for selected track.`,
			);
		}

		const explicitMeasureDuration = extractDurationTicks(
			bar,
			resolution,
			globalRhythms,
		);
		if (explicitMeasureDuration === undefined) {
			unhandled.add(
				`Measure ${masterBarIndex} has no recognized duration; defaulted to 4/4.`,
			);
		}
		const measureDuration = timelineBar?.durationTicks ?? explicitMeasureDuration ?? resolution * 4;
		for (const voice of voices) {
			const beats = resolveChildObjects(voice, "Beat", "Beats", globalBeats);
			let beatCursor = 0;
			beats.forEach((beat, beatIndex) => {
				const beatTick =
					measureStartTick +
					(extractTickOffset(beat, resolution) ?? beatCursor);
				const notes = resolveChildObjects(beat, "Note", "Notes", globalNotes);
				if (notes.length === 0) {
					const emptyBeatDuration = extractDurationTicks(
						beat,
						resolution,
						globalRhythms,
					);
					if (emptyBeatDuration === undefined) {
						unhandled.add(
							`Measure ${masterBarIndex} beat ${beatIndex} has no recognized duration; defaulted to quarter.`,
						);
					}
					beatCursor += emptyBeatDuration ?? resolution;
					return;
				}

				notes.forEach((note, noteIndex) => {
					const tick = beatTick + (extractTickOffset(note, resolution) ?? 0);
					const metadata = extractArticulationMetadata(
						note,
						trackMetadata,
						articulationDefinitions,
					);
					const resolutionResult = resolveGpifArticulation(
						metadata,
						options.mappingOverrides,
					);
					recordMappingSource(mappingSources, resolutionResult, tick);

					if (
						resolutionResult.action !== "map" ||
						!resolutionResult.automaticPiece ||
						resolutionResult.automaticPiece === "unknown"
					) {
						if (resolutionResult.action === "unknown") {
							recordUnknown(unknowns, resolutionResult.sourceValue, {
								key: resolutionResult.key,
								measureIndex: masterBarIndex,
								beatIndex,
								noteIndex,
							});
						}
						return;
					}

					hits.push({
						tick,
						piece: resolutionResult.automaticPiece,
						velocity:
							extractVelocity(note) ??
							extractVelocity(beat) ??
							DEFAULT_GPIF_DRUM_VELOCITY,
						durationTicks:
							extractDurationTicks(note, resolution, globalRhythms) ?? 0,
						source: {
							kind: "gpif",
							trackIndex: options.trackIndex,
							trackName: track.name,
							articulationKey: resolutionResult.key,
							rawArticulation: resolutionResult.sourceValue,
							noteName: resolutionResult.noteName,
							inputMidiNumbers: resolutionResult.inputMidiNumbers,
							outputMidiNumber: resolutionResult.outputMidiNumber,
							resolvedVia: resolutionResult.resolvedVia,
							measureIndex: masterBarIndex,
							beatIndex,
							noteIndex,
						} satisfies GpifSource,
					} as DrumHit);
				});

				const beatDuration = extractDurationTicks(
					beat,
					resolution,
					globalRhythms,
				);
				if (beatDuration === undefined) {
					unhandled.add(
						`Measure ${masterBarIndex} beat ${beatIndex} has no recognized duration; defaulted to quarter.`,
					);
				}
				beatCursor += beatDuration ?? resolution;
			});
		}
		fallbackMeasureStartTick += measureDuration;
	});

	hits.sort(
		(a, b) =>
			a.tick - b.tick ||
			pieceOrder(a.piece) - pieceOrder(b.piece) ||
			sourceOrder(a) - sourceOrder(b),
	);

	return {
		filePath: options.filePath ?? "(xml input)",
		trackIndex: options.trackIndex,
		trackName: track.name,
		resolution,
		hits,
		tempos: timeline.tempos,
		timeSignatures: timeline.timeSignatures,
		sections: timeline.sections,
		unknownArticulations: Array.from(unknowns.values()).sort((a, b) =>
			a.rawArticulation.localeCompare(b.rawArticulation),
		),
		mappingSources: Array.from(mappingSources.values()).sort((a, b) =>
			a.key.localeCompare(b.key),
		),
		warnings: Array.from(warnings).sort(),
		unhandled: Array.from(unhandled).sort(),
	};
}

function normalizeGpifTempos(
	metadataTempo: string | number | undefined,
	tempoSummaries: unknown[],
): TempoEvent[] {
	const bpm = parseBpm(metadataTempo) ?? firstParsedBpm(tempoSummaries) ?? 120;
	return [{ tick: 0, bpm }];
}

function normalizeGpifTimeSignatures(
	timeSignatureSummaries: unknown[],
): TimeSignatureEvent[] {
	return [
		firstParsedTimeSignature(timeSignatureSummaries) ?? {
			tick: 0,
			numerator: 4,
			denominator: 4,
		},
	];
}

function normalizeGpifSections(
	sections: { name: string; tick?: number }[],
): SongSection[] {
	return sections
		.map((section) => ({
			tick: Math.max(0, Math.trunc(section.tick ?? 0)),
			name: section.name,
		}))
		.filter((section) => section.name.trim().length > 0);
}

function firstParsedBpm(values: unknown[]): number | undefined {
	for (const value of values) {
		const bpm = parseBpm(JSON.stringify(value));
		if (bpm !== undefined) return bpm;
	}
	return undefined;
}

function parseBpm(value: string | number | undefined): number | undefined {
	if (typeof value === "number") return value > 0 ? value : undefined;
	if (!value) return undefined;
	const direct = parseNumber(value);
	if (direct !== undefined && direct > 0) return direct;
	const match =
		value.match(/(?:tempo|bpm)\D+(\d+(?:\.\d+)?)/i) ??
		value.match(/\b(\d+(?:\.\d+)?)\b/);
	const parsed = parseNumber(match?.[1]);
	return parsed !== undefined && parsed > 0 ? parsed : undefined;
}

function firstParsedTimeSignature(
	values: unknown[],
): TimeSignatureEvent | undefined {
	for (const value of values) {
		const text = JSON.stringify(value);
		const match = text.match(/\b(\d{1,2})\s*\/\s*(\d{1,2})\b/);
		if (!match) continue;
		const numerator = Number(match[1]);
		const denominator = Number(match[2]);
		if (
			Number.isInteger(numerator) &&
			Number.isInteger(denominator) &&
			numerator > 0 &&
			denominator > 0
		) {
			return { tick: 0, numerator, denominator };
		}
	}
	return undefined;
}

function parseGpifXml(xml: string): unknown {
	try {
		const validation = XMLValidator.validate(xml);
		if (validation !== true) {
			const err = validation.err;
			const location =
				err.line !== undefined ? ` at line ${err.line}, column ${err.col}` : "";
			throw new Error(`${err.msg}${location}`);
		}
		const parser = new XMLParser({
			ignoreAttributes: false,
			attributeNamePrefix: ATTRIBUTE_PREFIX,
			textNodeName: TEXT_KEY,
			trimValues: true,
			parseTagValue: false,
			parseAttributeValue: false,
			isArray: (_name: string, jPath: unknown) =>
				/(?:Tracks\.Track|MasterBars\.MasterBar|Bars\.Bar|Voices\.Voice|Beats\.Beat|Notes\.Note|Rhythms\.Rhythm)$/i.test(
					String(jPath),
				),
		});
		return parser.parse(xml);
	} catch (err) {
		throw new Error(`GPIF parse error: ${(err as Error).message}`);
	}
}

function findObjectsByKey(value: unknown, targetKey: string): XmlNode[] {
	const matches: XmlNode[] = [];
	if (Array.isArray(value)) {
		for (const item of value)
			matches.push(...findObjectsByKey(item, targetKey));
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

function resolveChildObjects(
	parent: XmlNode,
	childKey: string,
	containerKey: string,
	globalById: Map<string, XmlNode>,
): XmlNode[] {
	const container = parent[containerKey];
	const direct = isObject(container)
		? container[childKey]
		: (container ?? parent[childKey]);
	const values = Array.isArray(direct)
		? direct
		: direct !== undefined
			? [direct]
			: [];
	return values.flatMap((value) => {
		if (
			isObject(value) &&
			Object.keys(value).some((key) => !isReferenceKey(key))
		)
			return [value];
		const refs = referenceValues(value);
		const resolved = refs
			.map((ref) => globalById.get(ref))
			.filter((item): item is XmlNode => item !== undefined);
		if (resolved.length > 0) return resolved;
		return isObject(value) ? [value] : [];
	});
}

function objectMapById(objects: XmlNode[]): Map<string, XmlNode> {
	const map = new Map<string, XmlNode>();
	for (const obj of objects) {
		const id = firstValueInObject(obj, ["@_id", "id", "Id", "ID"]);
		if (id) map.set(id, obj);
	}
	return map;
}

function referenceValues(value: unknown): string[] {
	const text = textFromUnknown(value);
	if (text)
		return text.split(/\s+/).filter((part) => part !== "" && part !== "-1");
	if (isObject(value)) {
		return [
			firstValueInObject(value, ["ref", "id", "Id", "@_ref", "@_id"]),
		].filter((part): part is string => Boolean(part));
	}
	return [];
}

function trackReferenceValues(
	track: XmlNode | undefined,
	trackIndex: number,
): Set<string> {
	return new Set(
		[
			String(trackIndex),
			String(trackIndex + 1),
			firstValueInObject(track ?? {}, ["@_id", "id", "Id", "ID"]),
		].filter((v): v is string => Boolean(v)),
	);
}

function selectBarsForTrack(
	root: unknown,
	bars: XmlNode[],
	trackIndex: number,
	trackRefs: Set<string>,
): SelectedGpifBar[] {
	const barById = objectMapById(bars);
	const masterBars = findObjectsByKey(root, "MasterBar");
	const selectedFromMasterBars = masterBars
		.map((masterBar, masterBarIndex) => {
			const barId = referenceValues(masterBar.Bars)[trackIndex];
			const bar = barId !== undefined ? barById.get(barId) : undefined;
			return bar ? { bar, masterBarIndex } : undefined;
		})
		.filter((item): item is SelectedGpifBar => item !== undefined);

	if (selectedFromMasterBars.length > 0) return selectedFromMasterBars;
	return bars
		.map((bar, masterBarIndex) => ({ bar, masterBarIndex }))
		.filter(({ bar }) => barBelongsToTrack(bar, trackRefs));
}

function barBelongsToTrack(bar: XmlNode, trackRefs: Set<string>): boolean {
	const value = firstNestedValue(bar, [
		"Track",
		"TrackId",
		"trackId",
		"track",
		"@_track",
		"@_trackId",
	]);
	if (value === undefined) return true;
	return trackRefs.has(value);
}

function extractResolution(root: unknown): number | undefined {
	return firstNumberByKey(root, /^(resolution|ppq|ticksperquarter|division)$/i);
}

function extractTickOffset(
	node: XmlNode,
	resolution: number,
): number | undefined {
	const ticks = firstNumberInObject(node, [
		"Tick",
		"Ticks",
		"tick",
		"ticks",
		"Position",
		"position",
		"Start",
		"start",
	]);
	if (ticks !== undefined) return Math.round(ticks);
	const offset = firstNumberInObject(node, ["Offset", "offset"]);
	return offset !== undefined ? Math.round(offset * resolution) : undefined;
}

function extractDurationTicks(
	node: XmlNode,
	resolution: number,
	rhythms: Map<string, XmlNode>,
): number | undefined {
	const direct = firstNumberInObject(node, [
		"DurationTicks",
		"durationTicks",
		"Ticks",
		"ticks",
	]);
	if (direct !== undefined) return Math.round(direct);
	const duration = firstValueInObject(node, [
		"Duration",
		"duration",
		"Value",
		"value",
		"NoteValue",
		"noteValue",
	]);
	const durationTicks = durationToTicks(duration, resolution);
	if (durationTicks !== undefined) return durationTicks;
	const rhythmRef = firstNestedValue(node, [
		"Rhythm",
		"rhythm",
		"RhythmId",
		"rhythmId",
		"@_rhythm",
		"@_rhythmId",
	]);
	const rhythm = rhythmRef ? rhythms.get(rhythmRef) : undefined;
	return rhythm
		? extractDurationTicks(rhythm, resolution, new Map())
		: undefined;
}

function durationToTicks(
	value: string | undefined,
	resolution: number,
): number | undefined {
	if (!value) return undefined;
	const normalized = value.toLowerCase().trim();
	const numeric = Number(normalized);
	if (Number.isFinite(numeric)) return Math.round(numeric);
	if (/whole|1\/1/.test(normalized)) return resolution * 4;
	if (/half|1\/2/.test(normalized)) return resolution * 2;
	if (/quarter|1\/4/.test(normalized)) return resolution;
	if (/eighth|8th|1\/8/.test(normalized)) return resolution / 2;
	if (/sixteenth|16th|1\/16/.test(normalized)) return resolution / 4;
	return undefined;
}

function extractVelocity(node: XmlNode): number | undefined {
	const velocity = firstNumberInObject(node, [
		"Velocity",
		"velocity",
		"Vel",
		"vel",
	]);
	if (velocity !== undefined)
		return Math.max(1, Math.min(127, Math.round(velocity)));
	const dynamic = firstValueInObject(node, [
		"Dynamic",
		"Dynamics",
		"dynamic",
		"dynamics",
	]);
	return mapGpifDynamicToVelocity(dynamic);
}

function extractArticulationMetadata(
	note: XmlNode,
	track: Pick<GpifArticulationMetadata, "trackId" | "trackIndex" | "trackName">,
	definitions: Map<string, GpifArticulationMetadata>,
): GpifArticulationMetadata {
	const rawValues = articulationValues(note);
	const noteLocal = extractLocalArticulationMetadata(note);
	const referenced = articulationReferenceValues(note)
		.map((ref) => definitions.get(ref))
		.find((item): item is GpifArticulationMetadata => item !== undefined);
	return mergeArticulationMetadata({
		id: noteLocal.id ?? referenced?.id,
		name: noteLocal.name ?? referenced?.name ?? rawValues[0],
		inputMidiNumbers:
			noteLocal.inputMidiNumbers ?? referenced?.inputMidiNumbers,
		outputMidiNumber:
			noteLocal.outputMidiNumber ?? referenced?.outputMidiNumber,
		element: noteLocal.element ?? referenced?.element,
		instrument: noteLocal.instrument ?? referenced?.instrument,
		trackId: track.trackId,
		trackIndex: track.trackIndex,
		trackName: track.trackName,
	});
}

function buildArticulationDefinitionIndex(
	root: unknown,
): Map<string, GpifArticulationMetadata> {
	const definitions = new Map<string, GpifArticulationMetadata>();
	for (const node of [
		...findObjectsByKey(root, "Element"),
		...findObjectsByKey(root, "Articulation"),
	]) {
		if (isReferenceOnly(node)) continue;
		const metadata = extractLocalArticulationMetadata(node);
		const ids = articulationDefinitionIds(node);
		if (ids.length === 0 || !hasUsefulArticulationMetadata(metadata)) continue;
		for (const id of ids) definitions.set(id, metadata);
	}
	return definitions;
}

function extractLocalArticulationMetadata(node: XmlNode): GpifArticulationMetadata {
	const name = firstValueInObject(node, [
		"Name",
		"name",
		"DisplayName",
		"displayName",
		"Articulation",
		"articulation",
		"Type",
		"type",
	]);
	return {
		id: firstValueInObject(node, ["@_id", "id", "Id", "ID"]),
		name,
		inputMidiNumbers: extractInputMidiNumbers(node),
		outputMidiNumber: extractOutputMidiNumber(node),
		element: firstNestedValue(node, ["Element", "element"]),
		instrument: firstNestedValue(node, ["Instrument", "instrument", "InstrumentName", "instrumentName"]),
	};
}

function articulationDefinitionIds(node: XmlNode): string[] {
	return [
		firstValueInObject(node, ["@_id", "id", "Id", "ID"]),
		firstValueInObject(node, ["@_ref", "ref", "Ref", "REF"]),
		firstValueInObject(node, ["Index", "index", "Key", "key"]),
	].filter((value): value is string => Boolean(value));
}

function articulationReferenceValues(note: XmlNode): string[] {
	const refs = new Set<string>();
	for (const key of ["Element", "element", "Articulation", "articulation"]) {
		const value = note[key];
		for (const ref of referenceValues(value)) refs.add(ref);
		if (isObject(value)) {
			for (const id of articulationDefinitionIds(value)) refs.add(id);
		}
	}
	return Array.from(refs);
}

function mergeArticulationMetadata(
	metadata: GpifArticulationMetadata,
): GpifArticulationMetadata {
	return Object.fromEntries(
		Object.entries(metadata).filter(([, value]) => value !== undefined),
	) as GpifArticulationMetadata;
}

function hasUsefulArticulationMetadata(metadata: GpifArticulationMetadata): boolean {
	return Boolean(
		metadata.name ||
			metadata.inputMidiNumbers?.length ||
			metadata.outputMidiNumber !== undefined,
	);
}

function isReferenceOnly(node: XmlNode): boolean {
	return Object.keys(node).every(isReferenceKey);
}

function extractMidiNumber(note: XmlNode): number | undefined {
	return (
		findNamedPropertyNumber(note, "Midi") ??
		firstNumberInObject(note, ["Midi", "midi", "MidiNumber", "midiNumber"])
	);
}

function extractOutputMidiNumber(note: XmlNode): number | undefined {
	return (
		findNamedPropertyNumber(note, "OutputMidiNumber") ??
		findNamedPropertyNumber(note, "OutputMidi") ??
		firstNumberInObject(note, [
			"OutputMidiNumber",
			"outputMidiNumber",
			"OutputMidi",
			"outputMidi",
		])
	);
}

function extractInputMidiNumbers(note: XmlNode): number[] | undefined {
	const values = new Set<number>();
	collectNumbersByKey(
		note,
		/^(inputmidinumbers|inputmidinumber|inputmidi|midi|midinumber)$/i,
		values,
	);
	const legacyMidi = extractMidiNumber(note);
	if (legacyMidi !== undefined) values.add(legacyMidi);
	const outputMidi = extractOutputMidiNumber(note);
	if (outputMidi !== undefined) values.delete(outputMidi);
	const result = Array.from(values).sort((a, b) => a - b);
	return result.length > 0 ? result : undefined;
}

function collectNumbersByKey(
	value: unknown,
	keyPattern: RegExp,
	out: Set<number>,
): void {
	if (Array.isArray(value)) {
		for (const item of value) collectNumbersByKey(item, keyPattern, out);
	} else if (isObject(value)) {
		for (const [key, child] of Object.entries(value)) {
			if (keyPattern.test(key)) {
				for (const number of numbersFromUnknown(child)) out.add(number);
			}
			collectNumbersByKey(child, keyPattern, out);
		}
	}
}

function numbersFromUnknown(value: unknown): number[] {
	if (typeof value === "number") return Number.isFinite(value) ? [value] : [];
	const text = textFromUnknown(value);
	if (text) {
		return text
			.split(/[\s,;]+/)
			.map((part) => Number(part))
			.filter((number) => Number.isInteger(number));
	}
	if (Array.isArray(value)) return value.flatMap(numbersFromUnknown);
	if (isObject(value)) return Object.values(value).flatMap(numbersFromUnknown);
	return [];
}

function articulationValues(note: XmlNode): string[] {
	const values = new Set<string>();
	collectTextByKey(
		note,
		/^(name|type|element|articulation|instrument|instrumentname|displayname|sound|soundbankname)$/i,
		values,
	);
	return Array.from(values).filter(
		(value) =>
			value.length > 0 &&
			value.length < 120 &&
			!/^-?\d+(?:\.\d+)?$/.test(value),
	);
}

function collectTextByKey(
	value: unknown,
	keyPattern: RegExp,
	out: Set<string>,
): void {
	if (Array.isArray(value)) {
		for (const item of value) collectTextByKey(item, keyPattern, out);
	} else if (isObject(value)) {
		for (const [key, child] of Object.entries(value)) {
			if (keyPattern.test(key)) {
				const text = textFromUnknown(child);
				if (text) out.add(text);
			}
			collectTextByKey(child, keyPattern, out);
		}
	}
}

function recordUnknown(
	unknowns: Map<string, GpUnknownArticulation>,
	rawArticulation: string,
	location: Pick<
		GpUnknownArticulation,
		"key" | "measureIndex" | "beatIndex" | "noteIndex"
	>,
): void {
	const existing = unknowns.get(rawArticulation);
	if (existing) {
		existing.count += 1;
	} else {
		unknowns.set(rawArticulation, { rawArticulation, count: 1, ...location });
	}
}

function recordMappingSource(
	sources: Map<string, GpifMappingSource>,
	resolution: GpifArticulationResolution,
	tick: number,
): void {
	const existing = sources.get(resolution.key);
	if (existing) {
		existing.count += 1;
		if (existing.firstTick === undefined || tick < existing.firstTick) {
			existing.firstTick = tick;
		}
		return;
	}
	sources.set(resolution.key, {
		...resolution,
		count: 1,
		firstTick: tick,
	});
}

function detectUnsupportedTimingStructures(root: unknown): string[] {
	const found = new Set<string>();
	collectUnsupportedTimingPaths(root, "GPIF", found);
	return Array.from(found)
		.sort()
		.map(
			(path) =>
				`Unsupported GPIF timing structure found at ${path}; repeats/alternate endings are not expanded in Phase 07.`,
		);
}

function collectUnsupportedTimingPaths(
	value: unknown,
	path: string,
	found: Set<string>,
): void {
	if (Array.isArray(value)) {
		value.forEach((item, index) =>
			collectUnsupportedTimingPaths(item, `${path}[${index}]`, found),
		);
	} else if (isObject(value)) {
		for (const [key, child] of Object.entries(value)) {
			const childPath = `${path}.${key}`;
			if (
				/(repeat|alternate|ending|volta|jump|coda|segno|daCapo|dalSegno)/i.test(
					key,
				)
			) {
				const text = textFromUnknown(child);
				if (
					text === undefined ||
					text === "" ||
					!/^(false|0|-1)$/i.test(text)
				) {
					found.add(childPath);
				}
			}
			collectUnsupportedTimingPaths(child, childPath, found);
		}
	}
}

function findNamedPropertyNumber(
	value: unknown,
	propertyName: string,
): number | undefined {
	if (Array.isArray(value)) {
		for (const item of value) {
			const found = findNamedPropertyNumber(item, propertyName);
			if (found !== undefined) return found;
		}
	} else if (isObject(value)) {
		if (
			String(value["@_name"] ?? value.name ?? "").toLowerCase() ===
			propertyName.toLowerCase()
		) {
			const number = firstNumberByKey(value, /^(number|int|float)$/i);
			if (number !== undefined) return number;
		}
		for (const child of Object.values(value)) {
			const found = findNamedPropertyNumber(child, propertyName);
			if (found !== undefined) return found;
		}
	}
	return undefined;
}

function firstNumberByKey(
	value: unknown,
	keyPattern: RegExp,
): number | undefined {
	if (Array.isArray(value)) {
		for (const item of value) {
			const found = firstNumberByKey(item, keyPattern);
			if (found !== undefined) return found;
		}
	} else if (isObject(value)) {
		for (const [key, child] of Object.entries(value)) {
			if (keyPattern.test(key)) {
				const parsed = parseNumber(textFromUnknown(child));
				if (parsed !== undefined) return parsed;
			}
			const nested = firstNumberByKey(child, keyPattern);
			if (nested !== undefined) return nested;
		}
	}
	return undefined;
}

function firstNumberInObject(obj: XmlNode, keys: string[]): number | undefined {
	const value = firstValueInObject(obj, keys);
	return parseNumber(value);
}

function firstValueInObject(obj: XmlNode, keys: string[]): string | undefined {
	for (const key of keys) {
		const text = textFromUnknown(obj[key]);
		if (text) return text;
	}
	return undefined;
}

function firstNestedValue(obj: XmlNode, keys: string[]): string | undefined {
	const direct = firstValueInObject(obj, keys);
	if (direct) return direct;
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
	)
		return String(value).trim();
	if (isObject(value))
		return textFromUnknown(
			value[TEXT_KEY] ??
				value.Text ??
				value.text ??
				value.Name ??
				value.name ??
				value["@_ref"] ??
				value["@_id"],
		);
	return undefined;
}

function parseNumber(value: string | undefined): number | undefined {
	if (value === undefined) return undefined;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function pieceOrder(piece: DrumPiece): number {
	return [
		"kick",
		"snare",
		"hihat_closed",
		"hihat_open",
		"crash",
		"ride",
		"tom_high",
		"tom_mid",
		"tom_floor",
		"unknown",
	].indexOf(piece);
}

function sourceOrder(hit: DrumHit): number {
	const source = hit.source as GpifSource;
	return (
		(source.measureIndex ?? 0) * 1_000_000 +
		(source.beatIndex ?? 0) * 1_000 +
		(source.noteIndex ?? 0)
	);
}

function formatAvailableTrackIndexes(count: number): string {
	return count === 0
		? "none"
		: Array.from({ length: count }, (_, index) => String(index)).join(", ");
}

function isReferenceKey(key: string): boolean {
	return /^(@_)?(id|ref)$/i.test(key);
}

function isObject(value: unknown): value is XmlNode {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
