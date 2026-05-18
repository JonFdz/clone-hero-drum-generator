import { normalizeGpDrums } from "@chdg/guitarpro";
import { normalizeDrumsFromFile } from "@chdg/midi";
import generalMidiDrumsUntyped from "@chdg/mappings/data/general-midi-drums.json" with {
	type: "json",
};
import type { DrumHit } from "@chdg/core";
import type { MidiDrumPieceMap } from "@chdg/mappings";
import { issue, toProjectServiceError } from "./issues.js";
import { detectSourceKind } from "./sourceKind.js";
import type { NormalizationPreview } from "./types.js";

const generalMidiDrums = generalMidiDrumsUntyped as MidiDrumPieceMap;

export type NormalizeSelectionInput = {
	sourcePath: string;
	trackIndex?: number;
};

export async function normalizeSelection(
	input: NormalizeSelectionInput,
): Promise<NormalizationPreview> {
	const sourceKind = detectSourceKind(input.sourcePath);

	try {
		if (sourceKind === "midi") {
			const result = await normalizeDrumsFromFile(
				input.sourcePath,
				generalMidiDrums,
				{
					trackIndex: input.trackIndex,
				},
			);

			return {
				sourceKind,
				sourcePath: input.sourcePath,
				selectedTrack: result.track.index,
				hitCount: result.hits.length,
				pieceSummary: summarizePieces(result.hits),
				firstHits: result.hits.slice(0, 10).map(toHitPreview),
				issues:
					result.unknownNotes.length > 0
						? [
								issue(
									"warning",
									"UNKNOWN_MIDI_NOTES",
									"Unknown MIDI notes were found during normalization.",
									{ notes: result.unknownNotes },
								),
							]
						: [],
			};
		}

		if (input.trackIndex === undefined) {
			throw new Error(
				"Missing required --track <index> option for GPIF normalization.",
			);
		}

		const result = await normalizeGpDrums(input.sourcePath, {
			trackIndex: input.trackIndex,
		});

		return {
			sourceKind,
			sourcePath: input.sourcePath,
			selectedTrack: result.trackIndex,
			hitCount: result.hits.length,
			pieceSummary: summarizePieces(result.hits),
			firstHits: result.hits.slice(0, 10).map(toHitPreview),
			issues: [
				...result.warnings.map((warning) =>
					issue("warning", "GPIF_WARNING", warning),
				),
				...result.unhandled.map((item) =>
					issue("info", "GPIF_UNHANDLED", item),
				),
				...result.unknownArticulations.map((item) =>
					issue(
						"warning",
						"UNKNOWN_GPIF_ARTICULATION",
						`Unknown articulation: ${item.rawArticulation}`,
						{
							rawArticulation: item.rawArticulation,
							count: item.count,
							measureIndex: item.measureIndex,
							beatIndex: item.beatIndex,
							noteIndex: item.noteIndex,
						},
					),
				),
			],
		};
	} catch (error) {
		throw toProjectServiceError(error, "NORMALIZE_SELECTION_FAILED");
	}
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
