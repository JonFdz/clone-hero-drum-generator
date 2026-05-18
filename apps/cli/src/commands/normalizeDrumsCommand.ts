import { isAbsolute, resolve } from "node:path";
import { normalizeSelection, ProjectServiceError } from "@chdg/project";
import {
	consumeJsonFlag,
	printJsonError,
	printJsonSuccess,
} from "../jsonOutput.js";

function parseNormalizeDrumsArgs(
	rawArgs: string[],
):
	| { file: string; trackIndex?: number; json: boolean }
	| { help: true; json: boolean } {
	const { args, json } = consumeJsonFlag(rawArgs);
	const helpFlags = new Set(["--help", "-h"]);
	if (args.some((a) => helpFlags.has(a))) {
		return { help: true, json };
	}

	const consumed = new Set<number>();
	let trackIndex: number | undefined;

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
		}
	}

	let fileIndex = -1;
	for (let i = 0; i < args.length; i++) {
		if (!consumed.has(i) && !args[i].startsWith("-")) {
			fileIndex = i;
			break;
		}
	}

	if (fileIndex === -1) {
		throw new Error("Missing MIDI file path.");
	}

	const file = resolveInputPath(args[fileIndex]);

	for (let i = 0; i < args.length; i++) {
		if (!consumed.has(i) && i !== fileIndex) {
			const arg = args[i];
			if (arg.startsWith("-")) {
				throw new Error(`Unknown option: ${arg}`);
			}
			throw new Error(`Unexpected argument: ${arg}`);
		}
	}

	return { file, trackIndex, json };
}

export async function runNormalizeDrumsCommand(
	rawArgs: string[],
): Promise<void> {
	let parsed: ReturnType<typeof parseNormalizeDrumsArgs>;
	try {
		parsed = parseNormalizeDrumsArgs(rawArgs);
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

	try {
		const result = await normalizeSelection({
			sourcePath: parsed.file,
			trackIndex: parsed.trackIndex,
		});

		if (parsed.json) {
			printJsonSuccess(result, result.issues);
			return;
		}

		console.log("CHDG Drum Normalization");
		console.log("=======================");
		console.log(`File: ${result.sourcePath}`);
		console.log(`Track: [${result.selectedTrack}]`);
		console.log(`Hits: ${result.hitCount}`);
		console.log();

		console.log("Piece Summary:");
		for (const [piece, count] of Object.entries(result.pieceSummary)) {
			console.log(`  ${piece}: ${count}`);
		}
		console.log();

		console.log("First Hits:");
		for (const hit of result.firstHits) {
			const midiNote =
				"midiNote" in hit.source ? hit.source.midiNote : "unknown";
			console.log(
				`  tick ${hit.tick}: ${hit.piece} vel ${hit.velocity} midi ${midiNote}`,
			);
		}
		if (result.hitCount > result.firstHits.length) {
			console.log(
				`  ... and ${result.hitCount - result.firstHits.length} more`,
			);
		}

		if (result.issues.length > 0) {
			console.log();
			console.log("Warnings/Issues:");
			for (const issue of result.issues) {
				console.log(`  - [${issue.severity}] ${issue.code}: ${issue.message}`);
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
