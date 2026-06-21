import { normalizeGpDrums } from "@chdg/guitarpro";
import { normalizeDrumsFromFile } from "@chdg/midi";
import generalMidiDrumsUntyped from "@chdg/mappings/data/general-midi-drums.json" with {
	type: "json",
};
import type { DrumHit } from "@chdg/core";
import type { MidiDrumPieceMap } from "@chdg/mappings";
import { MIDI_DRUM_NOTE_ATLAS_VERSION } from "@chdg/mappings";
import { issue, ProjectServiceError, toProjectServiceError } from "./issues.js";
import {
	applyProjectMappingOverrides,
	buildMappingCandidates,
	hasOverrideForGpifArticulationKey,
	hasPieceOverrideForGpifArticulation,
	hasPieceOverrideForMidiNote,
} from "./mappingOverrides.js";
import { mergeDrumHits } from "./mergeDrumHits.js";
import type { NormalizeSelectionInput } from "./operationTypes.js";
import { detectSourceKind } from "./sourceKind.js";
import type { NormalizationPreview, ProjectIssue } from "./types.js";

const generalMidiDrums = generalMidiDrumsUntyped as MidiDrumPieceMap;

export async function normalizeSelection(
	input: NormalizeSelectionInput,
): Promise<NormalizationPreview> {
	const sourceKind = detectSourceKind(input.sourcePath);

	try {
		const requestedTracks = resolveRequestedTracks(input);

		if (sourceKind === "midi") {
			const results = await Promise.all(
				(requestedTracks ?? [undefined]).map((trackIndex) =>
					normalizeDrumsFromFile(input.sourcePath, generalMidiDrums, {
						trackIndex,
						mappingOverrides: input.mappingOverrides,
					}),
				),
			);
			const selectedTracks = results.map((result) => result.track.index);
			const sourceIssues = results.flatMap((result) => buildMidiMappingIssues(result, input.mappingOverrides));
			const rawHits = results.flatMap((result) => result.hits);
			const mappingCandidates = mergeMappingCandidates(
				results.flatMap((result) => result.mappingSources ?? []),
				buildMappingCandidates(rawHits),
			);
			const mappingCoverage = combineMappingCoverage(
				results
					.map((result) => result.mappingCoverage)
					.filter((item): item is NonNullable<typeof item> => Boolean(item)),
				mappingCandidates,
			);
			return toPreview({
				sourceKind,
				sourcePath: input.sourcePath,
				selectedTracks,
				hits: applyProjectMappingOverrides(rawHits, input.mappingOverrides),
				mappingCandidates,
				mappingCoverage,
				normalizedTiming: timingFromNormalization(results[0]),
				sourceIssues,
				includeMergeSummary: selectedTracks.length > 1,
			});
		}

		if (requestedTracks === undefined) {
			throw new Error(
				"Missing required --track <index> or --tracks <csv> option for GPIF normalization.",
			);
		}

		const results = await Promise.all(
			requestedTracks.map((trackIndex) =>
				normalizeGpDrums(input.sourcePath, {
					trackIndex,
					mappingOverrides: input.mappingOverrides,
				}),
			),
		);
		const selectedTracks = results.map((result) => result.trackIndex);
		const sourceIssues = results.flatMap((result) => [
			...result.warnings.map((warning) =>
				issue("warning", "GPIF_WARNING", warning, {
					trackIndex: result.trackIndex,
				}),
			),
			...result.unhandled.map((item) =>
				issue("info", "GPIF_UNHANDLED", item, {
					trackIndex: result.trackIndex,
				}),
			),
			...result.unknownArticulations
				.filter(
					(item) =>
						!hasPieceOverrideForGpifArticulation(
							input.mappingOverrides,
							item.rawArticulation,
						) &&
						!hasOverrideForGpifArticulationKey(
							input.mappingOverrides,
							(item as typeof item & { key?: string }).key,
						),
				)
				.map((item) =>
				issue(
					"warning",
					"UNKNOWN_GPIF_ARTICULATION",
					`Unknown articulation: ${item.rawArticulation}`,
					{
						trackIndex: result.trackIndex,
						rawArticulation: item.rawArticulation,
						count: item.count,
						measureIndex: item.measureIndex,
						beatIndex: item.beatIndex,
						noteIndex: item.noteIndex,
					},
				),
			),
		]);
		const rawHits = results.flatMap((result) => result.hits);
		const mappingCandidates = mergeMappingCandidates(
			results.flatMap((result) => result.mappingSources ?? []),
			buildMappingCandidates(rawHits),
		);
		const mappingCoverage = combineMappingCoverage([], mappingCandidates);

		return toPreview({
			sourceKind,
			sourcePath: input.sourcePath,
			selectedTracks,
			hits: applyProjectMappingOverrides(
				rawHits,
				input.mappingOverrides,
			),
			mappingCandidates,
			mappingCoverage,
			normalizedTiming: timingFromNormalization(results[0]),
			sourceIssues,
			includeMergeSummary: selectedTracks.length > 1,
		});
	} catch (error) {
		throw toProjectServiceError(error, "NORMALIZE_SELECTION_FAILED");
	}
}

function resolveRequestedTracks(input: NormalizeSelectionInput): number[] | undefined {
	if (input.trackIndex !== undefined && input.trackIndexes !== undefined) {
		throw new ProjectServiceError(
			"TRACK_SELECTION_CONFLICT",
			"Use either --track <index> or --tracks <csv>, not both.",
		);
	}
	if (input.trackIndexes !== undefined) {
		if (input.trackIndexes.length === 0) {
			throw new ProjectServiceError(
				"MISSING_TRACK_INDEX",
				"--tracks requires at least one track index.",
			);
		}
		return input.trackIndexes;
	}
	return input.trackIndex === undefined ? undefined : [input.trackIndex];
}

function toPreview(input: {
	sourceKind: NormalizationPreview["sourceKind"];
	sourcePath: string;
	selectedTracks: number[];
	hits: DrumHit[];
	mappingCandidates: NormalizationPreview["mappingCandidates"];
	mappingCoverage?: NormalizationPreview["mappingCoverage"];
	normalizedTiming: NonNullable<NormalizationPreview["normalizedTiming"]>;
	sourceIssues: ProjectIssue[];
	includeMergeSummary: boolean;
}): NormalizationPreview {
	const merged = mergeDrumHits(input.hits, input.selectedTracks);
	const issues = [...input.sourceIssues, ...merged.summary.issues];
	return {
		sourceKind: input.sourceKind,
		sourcePath: input.sourcePath,
		selectedTrack: input.selectedTracks[0],
		selectedTracks: input.selectedTracks,
		hitCount: merged.hits.length,
		pieceSummary: summarizePieces(merged.hits),
		firstHits: merged.hits.slice(0, 10).map(toHitPreview),
		mergeSummary: input.includeMergeSummary
			? { ...merged.summary, issues: merged.summary.issues }
			: undefined,
		mappingCandidates: input.mappingCandidates,
		mappingCoverage: input.mappingCoverage,
		normalizedTiming: input.normalizedTiming,
		issues,
	};
}

function timingFromNormalization(input: {
	resolution: number;
	tempos: NonNullable<NormalizationPreview["normalizedTiming"]>["tempos"];
	timeSignatures: NonNullable<NormalizationPreview["normalizedTiming"]>["timeSignatures"];
	sections: NonNullable<NormalizationPreview["normalizedTiming"]>["sections"];
}): NonNullable<NormalizationPreview["normalizedTiming"]> {
	return {
		resolution: input.resolution,
		tempos: input.tempos,
		timeSignatures: input.timeSignatures,
		sections: input.sections,
	};
}

function summarizePieces(hits: DrumHit[]): Record<string, number> {
	const summary: Record<string, number> = {};
	for (const hit of hits) {
		summary[hit.piece] = (summary[hit.piece] ?? 0) + 1;
	}
	return summary;
}

function toHitPreview(hit: DrumHit): NormalizationPreview["firstHits"][number] {
	return {
		tick: hit.tick,
		piece: hit.piece,
		velocity: hit.velocity,
		source: hit.source,
	};
}


function buildMidiMappingIssues(
	result: Awaited<ReturnType<typeof normalizeDrumsFromFile>>,
	overrides: Parameters<typeof hasPieceOverrideForMidiNote>[0],
): ProjectIssue[] {
	const issues: ProjectIssue[] = [];
	const candidateNotes = (result.candidateNotes ?? []).filter(
		(note) => !hasPieceOverrideForMidiNote(overrides, note),
	);
	if (candidateNotes.length > 0) {
		issues.push(
			issue(
				"info",
				"MIDI_MAPPING_CANDIDATES",
				"MIDI mapping candidates were skipped by default and are available for review.",
				{ trackIndex: result.track.index, notes: candidateNotes },
			),
		);
	}
	if ((result.ignoredNotes ?? []).length > 0) {
		issues.push(
			issue(
				"info",
				"MIDI_KNOWN_PERCUSSION_IGNORED",
				"Known auxiliary MIDI percussion was ignored without charting.",
				{ trackIndex: result.track.index, notes: result.ignoredNotes ?? [] },
			),
		);
	}
	const unknownNotes = result.unknownNotes.filter(
		(note) => !hasPieceOverrideForMidiNote(overrides, note),
	);
	if (unknownNotes.length > 0) {
		issues.push(
			issue(
				"warning",
				"UNKNOWN_MIDI_NOTES",
				"Unknown MIDI notes without mapping overrides were skipped during normalization.",
				{ trackIndex: result.track.index, notes: unknownNotes },
			),
		);
	}
	return issues;
}

function mergeMappingCandidates(
	primary: NormalizationPreview["mappingCandidates"],
	fallback: NormalizationPreview["mappingCandidates"],
): NormalizationPreview["mappingCandidates"] {
	const rows = new Map<string, NormalizationPreview["mappingCandidates"][number]>();
	for (const item of fallback) rows.set(item.key, item);
	for (const item of primary) rows.set(item.key, item);
	return Array.from(rows.values()).sort((a, b) => a.key.localeCompare(b.key));
}

function combineMappingCoverage(
	items: NonNullable<NormalizationPreview["mappingCoverage"]>[],
	candidates: NormalizationPreview["mappingCandidates"],
): NormalizationPreview["mappingCoverage"] {
	const sourceKeys = {
		map: new Set<string>(),
		candidate: new Set<string>(),
		ignore: new Set<string>(),
		unknown: new Set<string>(),
	};
	const summary = {
		atlasVersion: MIDI_DRUM_NOTE_ATLAS_VERSION,
		totalEventCount: 0,
		mappedEventCount: 0,
		candidateEventCount: 0,
		ignoredEventCount: 0,
		unknownEventCount: 0,
		mappedSourceCount: 0,
		candidateSourceCount: 0,
		ignoredSourceCount: 0,
		unknownSourceCount: 0,
	};
	if (items.length > 0) {
		for (const item of items) {
			summary.totalEventCount += item.totalEventCount;
			summary.mappedEventCount += item.mappedEventCount;
			summary.candidateEventCount += item.candidateEventCount;
			summary.ignoredEventCount += item.ignoredEventCount;
			summary.unknownEventCount += item.unknownEventCount;
		}
	} else {
		for (const candidate of candidates) {
			const count = candidate.count ?? 0;
			summary.totalEventCount += count;
			if (candidate.action === "candidate") {
				summary.candidateEventCount += count;
			} else if (candidate.action === "ignore") {
				summary.ignoredEventCount += count;
			} else if (
				candidate.action === "unknown" ||
				candidate.automaticPiece === "unknown"
			) {
				summary.unknownEventCount += count;
			} else {
				summary.mappedEventCount += count;
			}
		}
	}
	for (const candidate of candidates) {
		if (candidate.action === "candidate") sourceKeys.candidate.add(candidate.key);
		else if (candidate.action === "ignore") sourceKeys.ignore.add(candidate.key);
		else if (candidate.action === "unknown" || candidate.automaticPiece === "unknown") sourceKeys.unknown.add(candidate.key);
		else sourceKeys.map.add(candidate.key);
	}
	return {
		...summary,
		mappedSourceCount: sourceKeys.map.size || sumSourceCounts(items, "mappedSourceCount"),
		candidateSourceCount: sourceKeys.candidate.size || sumSourceCounts(items, "candidateSourceCount"),
		ignoredSourceCount: sourceKeys.ignore.size || sumSourceCounts(items, "ignoredSourceCount"),
		unknownSourceCount: sourceKeys.unknown.size || sumSourceCounts(items, "unknownSourceCount"),
	};
}

function sumSourceCounts(
	items: NonNullable<NormalizationPreview["mappingCoverage"]>[],
	key: "mappedSourceCount" | "candidateSourceCount" | "ignoredSourceCount" | "unknownSourceCount",
): number {
	return items.reduce((sum, item) => sum + item[key], 0);
}
