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
import { mergeDrumHits } from "./mergeDrumHits.js";
import { detectSourceKind } from "./sourceKind.js";
import type {
	GeneratePackageInput,
	GeneratePackageResult,
	MultiTrackMergeSummary,
	ProjectIssue,
	SourceKind,
} from "./types.js";

const generalMidiDrums = generalMidiDrumsUntyped as MidiDrumPieceMap;
const cloneHeroProDrums = cloneHeroProDrumsUntyped as CloneHeroProDrumsMapping;

type SourceNormalizationResult = {
	kind: SourceKind;
	filePath: string;
	track: { index: number; name?: string };
	selectedTracks: number[];
	mergeSummary?: MultiTrackMergeSummary;
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
			selectedTracks: source.selectedTracks,
			mergeSummary: source.mergeSummary,
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
	const requestedTracks = resolveRequestedTracks(input);

	if (kind === "midi") {
		const results = await Promise.all(
			(requestedTracks ?? [undefined]).map((trackIndex) =>
				normalizeDrumsFromFile(input.sourcePath, generalMidiDrums, {
					trackIndex,
				}),
			),
		);
		const selectedTracks = results.map((result) => result.track.index);
		const sourceIssues = results.flatMap((result) =>
			result.unknownNotes.length > 0
				? [
						issue(
							"warning",
							"UNKNOWN_MIDI_NOTES",
							"Unknown MIDI notes were skipped during generation.",
							{
								trackIndex: result.track.index,
								notes: result.unknownNotes,
							},
						),
					]
				: [],
		);
		const merged = mergeDrumHits(
			results.flatMap((result) => result.hits),
			selectedTracks,
		);

		return {
			kind,
			filePath: input.sourcePath,
			track: { index: results[0].track.index, name: results[0].track.name },
			selectedTracks,
			mergeSummary: selectedTracks.length > 1 ? merged.summary : undefined,
			resolution: results[0].resolution,
			tempos: results[0].tempos,
			timeSignatures: results[0].timeSignatures,
			sections: results[0].sections,
			hits: merged.hits,
			issues: [...sourceIssues, ...merged.summary.issues],
		};
	}

	if (requestedTracks === undefined) {
		throw new ProjectServiceError(
			"MISSING_TRACK_INDEX",
			"Missing required --track <index> or --tracks <csv> option for GPIF generation.",
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
		...result.unknownArticulations.map((item) =>
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
	const merged = mergeDrumHits(
		results.flatMap((result) => result.hits),
		selectedTracks,
	);

	return {
		kind,
		filePath: input.sourcePath,
		track: { index: results[0].trackIndex, name: results[0].trackName },
		selectedTracks,
		mergeSummary: selectedTracks.length > 1 ? merged.summary : undefined,
		resolution: results[0].resolution,
		tempos: results[0].tempos,
		timeSignatures: results[0].timeSignatures,
		sections: results[0].sections,
		hits: merged.hits,
		issues: [...sourceIssues, ...merged.summary.issues],
	};
}

function resolveRequestedTracks(
	input: GeneratePackageInput,
): number[] | undefined {
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
