import type { DrumHit, DrumPiece, SongSection, TempoEvent, TimeSignatureEvent } from "@chdg/core";
import type {
	DrumMappingAction,
	DrumMappingConfidence,
	DrumMappingFamily,
	DrumMappingSource,
	MidiDrumPieceMap,
	MappableDrumPiece,
} from "@chdg/mappings";
import { MIDI_DRUM_NOTE_ATLAS_VERSION, resolveMidiDrumNote } from "@chdg/mappings";
import type { MidiReadResult } from "./readMidi.js";
import { readMidi } from "./readMidi.js";
import { selectDrumTrack } from "./drumTrackSelection.js";

export type MidiMappingOverrideTarget =
	| { kind: "piece"; piece: MappableDrumPiece }
	| { kind: "ignore" };

export type MidiMappingOverride = {
	target: MidiMappingOverrideTarget;
};

export type MidiMappingSource = {
	key: string;
	sourceKind: "midi";
	sourceValue: string;
	label?: string;
	noteName?: string;
	action: DrumMappingAction;
	automaticPiece?: DrumPiece;
	suggestedPiece?: MappableDrumPiece;
	confidence?: DrumMappingConfidence;
	family?: DrumMappingFamily;
	source?: DrumMappingSource;
	count: number;
	firstTick?: number;
	reason?: string;
};

export type MappingCoverageSummary = {
	atlasVersion: string;
	totalEventCount: number;
	mappedEventCount: number;
	candidateEventCount: number;
	ignoredEventCount: number;
	unknownEventCount: number;
	mappedSourceCount: number;
	candidateSourceCount: number;
	ignoredSourceCount: number;
	unknownSourceCount: number;
};

export type DrumNormalizationResult = {
	hits: DrumHit[];
	unknownNotes: number[];
	candidateNotes: number[];
	ignoredNotes: number[];
	mappingSources: MidiMappingSource[];
	mappingCoverage: MappingCoverageSummary;
	track: { index: number; name: string; channel: number; noteCount: number };
	resolution: number;
	tempos: TempoEvent[];
	timeSignatures: TimeSignatureEvent[];
	sections: SongSection[];
};

export type NormalizeDrumsOptions = {
	trackIndex?: number;
	mappingOverrides?: Record<string, MidiMappingOverride>;
};

export function normalizeDrums(
	midiResult: MidiReadResult,
	drumPieceMap: MidiDrumPieceMap,
	options?: NormalizeDrumsOptions
): DrumNormalizationResult {
	const selection = selectDrumTrack(
		midiResult.tracks,
		drumPieceMap,
		options?.trackIndex
	);

	if (selection.kind === "error") {
		throw new Error(selection.message);
	}

	const trackIndex = selection.trackIndex;
	const track = midiResult.tracks[trackIndex];

	const hits: DrumHit[] = [];
	const unknownSet = new Set<number>();
	const candidateSet = new Set<number>();
	const ignoredSet = new Set<number>();
	const mappingSourceMap = new Map<string, MidiMappingSource>();
	const sourceSets: Record<DrumMappingAction, Set<string>> = {
		map: new Set(),
		candidate: new Set(),
		ignore: new Set(),
		unknown: new Set(),
	};
	const eventCounts: Record<DrumMappingAction, number> = {
		map: 0,
		candidate: 0,
		ignore: 0,
		unknown: 0,
	};

	for (const note of track.notes) {
		const resolution = resolveMidiDrumNote(note.midi, drumPieceMap);
		const key = `midi:${note.midi}`;
		const action = resolution.action;
		eventCounts[action] += 1;
		sourceSets[action].add(key);
		addMappingSource(mappingSourceMap, {
			key,
			sourceKind: "midi",
			sourceValue: String(note.midi),
			label: resolution.action === "unknown" ? `Note ${note.midi}` : `${resolution.entry.note} ${resolution.entry.name}`,
			noteName: resolution.action === "unknown" ? undefined : resolution.entry.name,
			action,
			automaticPiece: resolution.action === "map" ? resolution.piece : "unknown",
			suggestedPiece: resolution.action === "candidate" ? resolution.suggestedPiece : undefined,
			confidence: resolution.action === "unknown" ? undefined : resolution.entry.confidence,
			family: resolution.action === "unknown" ? "unknown" : resolution.entry.family,
			source: resolution.action === "unknown" ? "unknown" : resolution.entry.source,
			count: 1,
			firstTick: note.ticks,
			reason: resolution.action === "unknown" ? "No atlas entry for this MIDI note." : resolution.entry.reason,
		});

		const override = options?.mappingOverrides?.[key];
		if (override?.target.kind === "ignore") {
			continue;
		}

		const overridePiece = override?.target.kind === "piece" ? override.target.piece : undefined;
		const piece = overridePiece ?? (resolution.action === "map" ? resolution.piece : undefined);
		if (!piece) {
			if (resolution.action === "unknown") unknownSet.add(note.midi);
			else if (resolution.action === "candidate") candidateSet.add(note.midi);
			else if (resolution.action === "ignore") ignoredSet.add(note.midi);
			continue;
		}

		hits.push({
			tick: note.ticks,
			piece,
			velocity: note.velocity,
			durationTicks: note.durationTicks,
			source: {
				midiNote: note.midi,
				trackIndex,
				trackName: track.name,
				channel: track.channel,
			},
		});
	}

	return {
		hits,
		unknownNotes: sortedNumbers(unknownSet),
		candidateNotes: sortedNumbers(candidateSet),
		ignoredNotes: sortedNumbers(ignoredSet),
		mappingSources: Array.from(mappingSourceMap.values()).sort((a, b) => a.key.localeCompare(b.key)),
		mappingCoverage: {
			atlasVersion: MIDI_DRUM_NOTE_ATLAS_VERSION,
			totalEventCount: track.notes.length,
			mappedEventCount: eventCounts.map,
			candidateEventCount: eventCounts.candidate,
			ignoredEventCount: eventCounts.ignore,
			unknownEventCount: eventCounts.unknown,
			mappedSourceCount: sourceSets.map.size,
			candidateSourceCount: sourceSets.candidate.size,
			ignoredSourceCount: sourceSets.ignore.size,
			unknownSourceCount: sourceSets.unknown.size,
		},
		track: {
			index: trackIndex,
			name: track.name,
			channel: track.channel,
			noteCount: track.noteCount,
		},
		resolution: midiResult.resolution,
		tempos: midiResult.tempos,
		timeSignatures: midiResult.timeSignatures,
		sections: midiResult.sections,
	};
}

export async function normalizeDrumsFromFile(
	filePath: string,
	drumPieceMap: MidiDrumPieceMap,
	options?: NormalizeDrumsOptions
): Promise<DrumNormalizationResult> {
	const result = await readMidi(filePath);
	return normalizeDrums(result, drumPieceMap, options);
}

function addMappingSource(
	map: Map<string, MidiMappingSource>,
	candidate: MidiMappingSource,
): void {
	const existing = map.get(candidate.key);
	if (!existing) {
		map.set(candidate.key, candidate);
		return;
	}
	existing.count += 1;
	if (candidate.firstTick !== undefined && (existing.firstTick === undefined || candidate.firstTick < existing.firstTick)) {
		existing.firstTick = candidate.firstTick;
	}
}

function sortedNumbers(values: Set<number>): number[] {
	return Array.from(values).sort((a, b) => a - b);
}
