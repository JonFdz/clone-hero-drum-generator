import { isAbsolute, resolve } from "node:path";
import {
	detectSourceKind,
	generatePackage,
	ProjectServiceError,
} from "@chdg/project";
import type { SourceKind } from "@chdg/project";
import { parseGenerateArgs } from "../generateArgs.js";
import { printJsonError, printJsonSuccess } from "../jsonOutput.js";

export function detectGenerateSourceKind(filePath: string): SourceKind {
	return detectSourceKind(filePath);
}

export async function runGenerateCommand(rawArgs: string[]): Promise<void> {
	let parsed: ReturnType<typeof parseGenerateArgs>;
	let jsonRequested = rawArgs.includes("--json");

	try {
		parsed = parseGenerateArgs(rawArgs);
	} catch (err) {
		if (jsonRequested) {
			printJsonError("ARG_PARSE_ERROR", (err as Error).message);
			throw new Error("COMMAND_FAILED");
		}

		console.error((err as Error).message);
		throw new Error("ARG_PARSE_ERROR");
	}

	if ("help" in parsed) {
		throw new Error("HELP_REQUESTED");
	}

	jsonRequested = parsed.options.json === true;

	try {
		const result = await generatePackage({
			sourcePath: resolveInputPath(parsed.file),
			outDir: resolveInputPath(parsed.options.outDir),
			trackIndex: parsed.options.trackIndex,
			trackIndexes: parsed.options.trackIndexes,
			audioFile: parsed.options.audioFile,
			audioSource:
				parsed.options.audioSource === undefined
					? undefined
					: resolveInputPath(parsed.options.audioSource),
			name: parsed.options.name,
			artist: parsed.options.artist,
			album: parsed.options.album,
			year: parsed.options.year,
			genre: parsed.options.genre,
			charter: parsed.options.charter,
			offsetMs: parsed.options.offsetMs,
		});

		if (jsonRequested) {
			printJsonSuccess(result, result.issues);
			return;
		}

		for (const warning of result.issues.filter(
			(item) => item.severity !== "info",
		)) {
			console.warn(`Warning: ${warning.message}`);
		}

		console.log("CHDG Chart Generation");
		console.log("=====================");
		console.log(`File: ${result.sourcePath}`);
		console.log(
			`Source type: ${result.sourceKind === "gpif" ? "GPIF" : "MIDI"}`,
		);
		console.log(
			result.selectedTracks.length > 1
				? `Selected tracks: ${result.selectedTracks.join(", ")}`
				: `Track: [${result.selectedTrack}]`,
		);
		console.log(`Hits: ${result.hitCount}`);
		if (result.mergeSummary) {
			console.log(`Input hits: ${result.mergeSummary.inputHitCount}`);
			console.log(`Merged hits: ${result.mergeSummary.mergedHitCount}`);
			console.log(`Duplicates removed: ${result.mergeSummary.duplicateHitCount}`);
			console.log(
				`Impossible hand chord warnings: ${result.mergeSummary.impossibleChordCount}`,
			);
		}
		console.log(`Mapped notes: ${result.mappedNoteCount}`);
		if (result.deduplicatedCount > 0) {
			console.log(`Deduplicated notes: ${result.deduplicatedCount}`);
		}
		console.log(`Output: ${result.outputDir}`);
		console.log(`  - notes.chart`);
		console.log(`  - song.ini`);
		if (result.files.songOgg) {
			console.log(`  - ${result.files.songOgg.split("/").pop()}`);
		}
	} catch (err) {
		if (jsonRequested) {
			const error =
				err instanceof ProjectServiceError
					? err
					: new ProjectServiceError(
							"GENERATE_PACKAGE_FAILED",
							(err as Error).message,
						);
			printJsonError(error.code, error.message, error.issues);
			throw new Error("COMMAND_FAILED");
		}

		throw err;
	}
}

function resolveInputPath(filePath: string): string {
	if (isAbsolute(filePath)) {
		return filePath;
	}
	return resolve(process.env.INIT_CWD ?? process.cwd(), filePath);
}
