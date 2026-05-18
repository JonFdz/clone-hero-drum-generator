import { inspectGpFile } from "@chdg/guitarpro";
import { inspectMidi } from "@chdg/midi";
import generalMidiDrumsUntyped from "@chdg/mappings/data/general-midi-drums.json" with {
	type: "json",
};
import type { MidiDrumPieceMap } from "@chdg/mappings";
import { issue, toProjectServiceError } from "./issues.js";
import { detectSourceKind } from "./sourceKind.js";
import type { SourceInspectionResult, TrackCandidate } from "./types.js";

const generalMidiDrums = generalMidiDrumsUntyped as MidiDrumPieceMap;

export type InspectSourceInput = {
	sourcePath: string;
	trackIndex?: number;
	drumsOnly?: boolean;
};

export async function inspectSource(
	input: InspectSourceInput,
): Promise<SourceInspectionResult> {
	const sourceKind = detectSourceKind(input.sourcePath);

	try {
		if (sourceKind === "midi") {
			const inspection = await inspectMidi(input.sourcePath, generalMidiDrums, {
				trackIndex: input.trackIndex,
				drumsOnly: input.drumsOnly,
			});

			const tracks: TrackCandidate[] = inspection.tracks.map((track) => {
				const isStrong = inspection.strongDrumTracks.includes(track.index);
				const isWeak = inspection.weakDrumTracks.includes(track.index);

				return {
					index: track.index,
					name: track.name,
					channel: track.channel,
					noteCount: track.noteCount,
					strength: isStrong ? "strong" : isWeak ? "weak" : "unknown",
					role: isStrong || isWeak ? "drums" : "unknown",
				};
			});

			const issues =
				inspection.unknownNotes.length > 0
					? [
							issue(
								"warning",
								"UNKNOWN_MIDI_NOTES",
								"Unknown MIDI notes were found during inspection.",
								{ notes: inspection.unknownNotes },
							),
						]
					: [];

			return {
				sourceKind,
				sourcePath: inspection.filePath,
				resolution: inspection.resolution,
				tempos: inspection.tempos,
				timeSignatures: inspection.timeSignatures,
				sections: inspection.sections,
				tracks,
				issues,
			};
		}

		const inspection = await inspectGpFile(input.sourcePath);
		const tracks: TrackCandidate[] = inspection.tracks.map((track) => ({
			index: track.index,
			name: track.name,
			channel: track.channel,
			noteCount: 0,
			strength: track.isDrumCandidate ? "strong" : "unknown",
			role: track.isDrumCandidate ? "drums" : "unknown",
			reasons: track.drumCandidateReasons,
		}));

		const issues = [
			...inspection.warnings.map((warning) =>
				issue("warning", "GPIF_WARNING", warning),
			),
			...inspection.unhandled.map((item) =>
				issue("info", "GPIF_UNHANDLED", item),
			),
		];

		return {
			sourceKind,
			sourcePath: inspection.filePath,
			tempos: inspection.tempos,
			timeSignatures: inspection.timeSignatures,
			sections: inspection.sections,
			tracks,
			issues,
		};
	} catch (error) {
		throw toProjectServiceError(error, "INSPECT_SOURCE_FAILED");
	}
}
