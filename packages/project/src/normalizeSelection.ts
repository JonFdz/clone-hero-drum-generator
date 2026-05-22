import { normalizeGpDrums } from "@chdg/guitarpro";
import { normalizeDrumsFromFile } from "@chdg/midi";
import generalMidiDrumsUntyped from "@chdg/mappings/data/general-midi-drums.json" with {
	type: "json",
};
import type { DrumHit } from "@chdg/core";
import type { MidiDrumPieceMap } from "@chdg/mappings";
import { issue, ProjectServiceError, toProjectServiceError } from "./issues.js";
import {
	applyProjectMappingOverrides,
	buildMappingCandidates,
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
					}),
				),
			);
			const selectedTracks = results.map((result) => result.track.index);
			const sourceIssues = results.flatMap((result) =>
				result.unknownNotes.filter(
					(note) => !hasPieceOverrideForMidiNote(input.mappingOverrides, note),
				).length > 0
					? [
							issue(
								"warning",
								"UNKNOWN_MIDI_NOTES",
								"Unknown MIDI notes without mapping overrides were found during normalization.",
								{
									trackIndex: result.track.index,
									notes: result.unknownNotes.filter(
										(note) => !hasPieceOverrideForMidiNote(input.mappingOverrides, note),
									),
								},
							),
						]
					: [],
			);
			const rawHits = results.flatMap((result) => result.hits);
			const mappingCandidates = buildMappingCandidates(rawHits);
			return toPreview({
				sourceKind,
				sourcePath: input.sourcePath,
				selectedTracks,
				hits: applyProjectMappingOverrides(
					rawHits,
					input.mappingOverrides,
				),
				mappingCandidates,
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
				normalizeGpDrums(input.sourcePath, { trackIndex }),
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
		const mappingCandidates = buildMappingCandidates(rawHits);

		return toPreview({
			sourceKind,
			sourcePath: input.sourcePath,
			selectedTracks,
			hits: applyProjectMappingOverrides(
				rawHits,
				input.mappingOverrides,
			),
			mappingCandidates,
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
		issues,
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
