import { isAbsolute, resolve } from "node:path";
import { normalizeSelection, ProjectServiceError } from "@chdg/project";
import {
	consumeJsonFlag,
	printJsonError,
	printJsonSuccess,
} from "../jsonOutput.js";
import { parseTrackIndexes } from "../generateArgs.js";

function parseNormalizeGpDrumsArgs(
	rawArgs: string[],
):
	| { file: string; trackIndex?: number; trackIndexes?: number[]; json: boolean }
	| { help: true; json: boolean } {
	const { args, json } = consumeJsonFlag(rawArgs);
	const helpFlags = new Set(["--help", "-h"]);
	if (args.some((a) => helpFlags.has(a))) {
		return { help: true, json };
	}

	const consumed = new Set<number>();
	let trackIndex: number | undefined;
	let trackIndexes: number[] | undefined;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--track") {
			const next = args[++i];
			if (next === undefined) {
				throw new Error("--track requires a track index.");
			}
			const idx = Number(next);
			if (!Number.isInteger(idx)) {
				throw new Error(`Invalid track index: ${next}`);
			}
			trackIndex = idx;
			consumed.add(i - 1);
			consumed.add(i);
		} else if (arg === "--tracks") {
			const next = args[++i];
			if (next === undefined) {
				throw new Error("--tracks requires comma-separated track indexes.");
			}
			trackIndexes = parseTrackIndexes(next);
			consumed.add(i - 1);
			consumed.add(i);
		}
	}

	if (trackIndex !== undefined && trackIndexes !== undefined) {
		throw new Error("Use either --track <index> or --tracks <csv>, not both.");
	}

	let fileIndex = -1;
	for (let i = 0; i < args.length; i++) {
		if (!consumed.has(i) && !args[i].startsWith("-")) {
			fileIndex = i;
			break;
		}
	}

	if (fileIndex === -1) {
		throw new Error("Missing GP file path.");
	}

	if (trackIndex === undefined && trackIndexes === undefined) {
		throw new Error("Missing required --track <index> or --tracks <csv> option.");
	}

	const file = args[fileIndex];

	for (let i = 0; i < args.length; i++) {
		if (!consumed.has(i) && i !== fileIndex) {
			const arg = args[i];
			if (arg.startsWith("-")) {
				throw new Error(`Unknown option: ${arg}`);
			}
			throw new Error(`Unexpected argument: ${arg}`);
		}
	}

	return { file, trackIndex, trackIndexes, json };
}

export async function runNormalizeGpDrumsCommand(
	rawArgs: string[],
): Promise<void> {
	let parsed: ReturnType<typeof parseNormalizeGpDrumsArgs>;
	try {
		parsed = parseNormalizeGpDrumsArgs(rawArgs);
	} catch (err) {
		const { json } = consumeJsonFlag(rawArgs);
		if (json) {
			printJsonError("ARG_PARSE_ERROR", (err as Error).message);
			throw new Error("COMMAND_FAILED");
		}

		console.error((err as Error).message);
		throw new Error("ARG_PARSE_ERROR");
	}

	if ("help" in parsed) {
		throw new Error("HELP_REQUESTED");
	}

	const file = resolveInputPath(parsed.file);

	try {
		const result = await normalizeSelection({
			sourcePath: file,
			trackIndex: parsed.trackIndex,
			trackIndexes: parsed.trackIndexes,
		});

		if (parsed.json) {
			printJsonSuccess(result, result.issues);
			return;
		}

		console.log("CHDG GPIF Drum Normalization");
		console.log("============================");
		console.log(`File: ${result.sourcePath}`);
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
		console.log();

		console.log("Piece Summary:");
		for (const piece of [
			"kick",
			"snare",
			"hihat_closed",
			"hihat_open",
			"crash",
			"ride",
			"tom_high",
			"tom_mid",
			"tom_floor",
		]) {
			console.log(`  ${piece}: ${result.pieceSummary[piece] ?? 0}`);
		}
		console.log();

		console.log("First Hits:");
		if (result.firstHits.length === 0) {
			console.log("  none");
		}
		for (const hit of result.firstHits) {
			const source =
				"kind" in hit.source && hit.source.kind === "gpif"
					? hit.source
					: undefined;
			const raw = source?.rawArticulation
				? ` raw ${source.rawArticulation}`
				: "";
			console.log(`  tick ${hit.tick}: ${hit.piece} vel ${hit.velocity}${raw}`);
		}
		if (result.hitCount > result.firstHits.length) {
			console.log(
				`  ... and ${result.hitCount - result.firstHits.length} more`,
			);
		}

		if (result.issues.length > 0) {
			console.log();
			console.log("Warnings/Issues:");
			for (const item of result.issues) {
				console.log(`  - [${item.severity}] ${item.code}: ${item.message}`);
			}
		}
	} catch (err) {
		if (parsed.json) {
			const error =
				err instanceof ProjectServiceError
					? err
					: new ProjectServiceError(
							"NORMALIZE_SELECTION_FAILED",
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
