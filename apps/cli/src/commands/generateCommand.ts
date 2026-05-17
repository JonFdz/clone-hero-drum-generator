import { mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { normalizeDrumsFromFile } from "@chdg/midi";
import { normalizeGpDrums } from "@chdg/guitarpro";
import { mapHitToCloneHeroNote } from "@chdg/mappings";
import { writeChart, writeSongIni, deduplicateBaseNotes } from "@chdg/chart";
import type {
	CloneHeroDrumNote,
	DrumChart,
	DrumHit,
	SongSection,
	TempoEvent,
	TimeSignatureEvent,
} from "@chdg/core";
import { prepareAudio } from "@chdg/audio";
import { generalMidiDrums, cloneHeroProDrums } from "../mappings.js";
import { parseGenerateArgs, type GenerateOptions } from "../generateArgs.js";

type SourceKind = "midi" | "gpif";

type SourceNormalizationResult = {
	kind: SourceKind;
	filePath: string;
	track: { index: number; name?: string };
	resolution: number;
	tempos: TempoEvent[];
	timeSignatures: TimeSignatureEvent[];
	sections: SongSection[];
	hits: DrumHit[];
	warnings: string[];
	unknowns: string[];
};

export function detectGenerateSourceKind(filePath: string): SourceKind {
	const extension = extname(filePath).toLowerCase();
	if (extension === ".mid" || extension === ".midi") return "midi";
	if (extension === ".gp") return "gpif";
	throw new Error(
		`Unsupported source type: ${extension || "(none)"}. Supported source types: .mid, .midi, .gp.`,
	);
}

export function runGenerateCommand(rawArgs: string[]): Promise<void> {
	let parsed: ReturnType<typeof parseGenerateArgs>;
	try {
		parsed = parseGenerateArgs(rawArgs);
	} catch (err) {
		console.error((err as Error).message);
		throw new Error("ARG_PARSE_ERROR");
	}

	if ("help" in parsed) {
		throw new Error("HELP_REQUESTED");
	}

	return normalizeGenerateSource(parsed.file, parsed.options).then((source) =>
		writeGeneratedSongPackage(source, parsed.options),
	);
}

async function normalizeGenerateSource(
	file: string,
	options: GenerateOptions,
): Promise<SourceNormalizationResult> {
	const kind = detectGenerateSourceKind(file);

	if (kind === "midi") {
		const result = await normalizeDrumsFromFile(file, generalMidiDrums, {
			trackIndex: options.trackIndex,
		});
		return {
			kind,
			filePath: file,
			track: { index: result.track.index, name: result.track.name },
			resolution: result.resolution,
			tempos: result.tempos,
			timeSignatures: result.timeSignatures,
			sections: result.sections,
			hits: result.hits,
			warnings:
				result.unknownNotes.length > 0
					? [`Unknown MIDI notes skipped: ${result.unknownNotes.join(", ")}`]
					: [],
			unknowns: [],
		};
	}

	if (options.trackIndex === undefined) {
		throw new Error(
			"Missing required --track <index> option for GPIF generation.",
		);
	}

	const result = await normalizeGpDrums(file, {
		trackIndex: options.trackIndex,
	});
	const gpifTiming = result as typeof result & {
		tempos?: TempoEvent[];
		timeSignatures?: TimeSignatureEvent[];
		sections?: SongSection[];
	};
	return {
		kind,
		filePath: file,
		track: { index: result.trackIndex, name: result.trackName },
		resolution: result.resolution,
		tempos: gpifTiming.tempos ?? [{ tick: 0, bpm: 120 }],
		timeSignatures: gpifTiming.timeSignatures ?? [
			{ tick: 0, numerator: 4, denominator: 4 },
		],
		sections: gpifTiming.sections ?? [],
		hits: result.hits,
		warnings: [...result.warnings, ...result.unhandled],
		unknowns: result.unknownArticulations.map(
			(item) => `${item.rawArticulation} (${item.count})`,
		),
	};
}

async function writeGeneratedSongPackage(
	source: SourceNormalizationResult,
	options: GenerateOptions,
): Promise<void> {
	for (const warning of source.warnings) {
		console.warn(`Warning: ${warning}`);
	}

	const expertDrums: CloneHeroDrumNote[] = source.hits
		.map((hit) => mapHitToCloneHeroNote(hit, cloneHeroProDrums))
		.filter((n): n is CloneHeroDrumNote => n !== null);

	const deduplicated = deduplicateBaseNotes(expertDrums);

	const chart: DrumChart = {
		resolution: source.resolution,
		tempos: source.tempos,
		timeSignatures: source.timeSignatures,
		sections: source.sections,
		expertDrums: deduplicated,
	};

	const songName = basename(source.filePath, extname(source.filePath));
	const audioFile = options.audioFile ?? "song.ogg";
	const chartText = writeChart(chart, { name: songName });
	const songIniText = writeSongIni({
		name: songName,
		artist: "Unknown Artist",
		songFile: audioFile,
	});

	await mkdir(options.outDir, { recursive: true });
	await writeFile(join(options.outDir, "notes.chart"), chartText);
	await writeFile(join(options.outDir, "song.ini"), songIniText);

	const audioResult = options.audioSource
		? await prepareAudio({
				sourcePath: options.audioSource,
				outputDir: options.outDir,
				outputFileName: audioFile,
			})
		: null;

	console.log("CHDG Chart Generation");
	console.log("=====================");
	console.log(`File: ${source.filePath}`);
	console.log(`Source type: ${source.kind === "gpif" ? "GPIF" : "MIDI"}`);
	console.log(
		`Track: [${source.track.index}] "${source.track.name ?? "(unnamed)"}"`,
	);
	console.log(`Hits: ${source.hits.length}`);
	console.log(`Mapped notes: ${expertDrums.length}`);
	if (deduplicated.length < expertDrums.length) {
		console.log(
			`Deduplicated notes: ${expertDrums.length - deduplicated.length}`,
		);
	}
	if (source.kind === "gpif") {
		console.log(
			`GPIF Unknown Articulations: ${source.unknowns.length > 0 ? source.unknowns.join(", ") : "none"}`,
		);
	}
	console.log(`Output: ${options.outDir}`);
	console.log(`  - notes.chart`);
	console.log(`  - song.ini`);
	if (audioResult) {
		console.log(`  - ${audioResult.outputFileName} (${audioResult.action})`);
	}
}
