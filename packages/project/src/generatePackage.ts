import { mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { prepareAudio } from "@chdg/audio";
import { deduplicateBaseNotes, writeChart, writeSongIni } from "@chdg/chart";
import type {
	CloneHeroDrumNote,
	DrumChart,
	DrumHit,
	SongSection,
	TempoEvent,
	TimeSignatureEvent,
} from "@chdg/core";
import { normalizeGpDrums } from "@chdg/guitarpro";
import {
	mapHitToCloneHeroNote,
	type CloneHeroProDrumsMapping,
	type MidiDrumPieceMap,
} from "@chdg/mappings";
import cloneHeroProDrumsUntyped from "@chdg/mappings/data/clone-hero-pro-drums.json" with {
	type: "json",
};
import generalMidiDrumsUntyped from "@chdg/mappings/data/general-midi-drums.json" with {
	type: "json",
};
import { normalizeDrumsFromFile } from "@chdg/midi";
import { issue, ProjectServiceError, toProjectServiceError } from "./issues.js";
import { detectSourceKind } from "./sourceKind.js";
import type {
	GeneratePackageInput,
	GeneratePackageResult,
	ProjectIssue,
	SourceKind,
} from "./types.js";

const generalMidiDrums = generalMidiDrumsUntyped as MidiDrumPieceMap;
const cloneHeroProDrums = cloneHeroProDrumsUntyped as CloneHeroProDrumsMapping;

type SourceNormalizationResult = {
	kind: SourceKind;
	filePath: string;
	track: { index: number; name?: string };
	resolution: number;
	tempos: TempoEvent[];
	timeSignatures: TimeSignatureEvent[];
	sections: SongSection[];
	hits: DrumHit[];
	issues: ProjectIssue[];
};

export async function generatePackage(
	input: GeneratePackageInput,
): Promise<GeneratePackageResult> {
	try {
		const source = await normalizeGenerateSource(input);

		const expertDrums: CloneHeroDrumNote[] = source.hits
			.map((hit) => mapHitToCloneHeroNote(hit, cloneHeroProDrums))
			.filter((note): note is CloneHeroDrumNote => note !== null);

		const deduplicated = deduplicateBaseNotes(expertDrums);

		const chart: DrumChart = {
			resolution: source.resolution,
			offsetSeconds:
				input.offsetMs === undefined ? undefined : input.offsetMs / 1000,
			tempos: source.tempos,
			timeSignatures: source.timeSignatures,
			sections: source.sections,
			expertDrums: deduplicated,
		};

		const songName =
			input.name ?? basename(source.filePath, extname(source.filePath));
		const artist = input.artist ?? "Unknown Artist";
		const audioFile = input.audioFile ?? "song.ogg";
		const chartText = writeChart(chart, {
			name: songName,
			artist,
			charter: input.charter,
		});
		const songIniText = writeSongIni({
			name: songName,
			artist,
			album: input.album,
			year: input.year,
			genre: input.genre,
			charter: input.charter,
			songFile: audioFile,
		});

		await mkdir(input.outDir, { recursive: true });
		const notesChartPath = join(input.outDir, "notes.chart");
		const songIniPath = join(input.outDir, "song.ini");
		await writeFile(notesChartPath, chartText);
		await writeFile(songIniPath, songIniText);

		const audioResult = input.audioSource
			? await prepareAudio({
					sourcePath: input.audioSource,
					outputDir: input.outDir,
					outputFileName: audioFile,
				})
			: null;

		return {
			sourceKind: source.kind,
			sourcePath: source.filePath,
			selectedTrack: source.track.index,
			outputDir: input.outDir,
			hitCount: source.hits.length,
			mappedNoteCount: expertDrums.length,
			deduplicatedCount: expertDrums.length - deduplicated.length,
			files: {
				chart: notesChartPath,
				songIni: songIniPath,
				songOgg: audioResult?.outputPath,
			},
			issues: source.issues,
		};
	} catch (error) {
		throw toProjectServiceError(error, "GENERATE_PACKAGE_FAILED");
	}
}

async function normalizeGenerateSource(
	input: GeneratePackageInput,
): Promise<SourceNormalizationResult> {
	const kind = detectSourceKind(input.sourcePath);

	if (kind === "midi") {
		const result = await normalizeDrumsFromFile(
			input.sourcePath,
			generalMidiDrums,
			{
				trackIndex: input.trackIndex,
			},
		);

		return {
			kind,
			filePath: input.sourcePath,
			track: { index: result.track.index, name: result.track.name },
			resolution: result.resolution,
			tempos: result.tempos,
			timeSignatures: result.timeSignatures,
			sections: result.sections,
			hits: result.hits,
			issues:
				result.unknownNotes.length > 0
					? [
							issue(
								"warning",
								"UNKNOWN_MIDI_NOTES",
								"Unknown MIDI notes were skipped during generation.",
								{ notes: result.unknownNotes },
							),
						]
					: [],
		};
	}

	if (input.trackIndex === undefined) {
		throw new ProjectServiceError(
			"MISSING_TRACK_INDEX",
			"Missing required --track <index> option for GPIF generation.",
		);
	}

	const result = await normalizeGpDrums(input.sourcePath, {
		trackIndex: input.trackIndex,
	});

	return {
		kind,
		filePath: input.sourcePath,
		track: { index: result.trackIndex, name: result.trackName },
		resolution: result.resolution,
		tempos: result.tempos,
		timeSignatures: result.timeSignatures,
		sections: result.sections,
		hits: result.hits,
		issues: [
			...result.warnings.map((warning) =>
				issue("warning", "GPIF_WARNING", warning),
			),
			...result.unhandled.map((item) => issue("info", "GPIF_UNHANDLED", item)),
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
}
