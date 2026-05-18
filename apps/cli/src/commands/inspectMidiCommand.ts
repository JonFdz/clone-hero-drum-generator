import { isAbsolute, resolve } from "node:path";
import { inspectSource, ProjectServiceError } from "@chdg/project";
import type { InspectSourceInput } from "@chdg/project";
import { formatNumber } from "../cliOutput.js";
import {
	printJsonError,
	printJsonSuccess,
	consumeJsonFlag,
} from "../jsonOutput.js";

function parseInspectMidiArgs(
	rawArgs: string[],
):
	| { file: string; options: InspectSourceInput; json: boolean }
	| { help: true; json: boolean } {
	const { args, json } = consumeJsonFlag(rawArgs);
	const helpFlags = new Set(["--help", "-h"]);
	if (args.some((a) => helpFlags.has(a))) {
		return { help: true, json };
	}

	const consumed = new Set<number>();
	const options: InspectSourceInput = { sourcePath: "" };

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
			options.trackIndex = idx;
			consumed.add(i - 1);
			consumed.add(i);
		} else if (arg === "--drums-only") {
			options.drumsOnly = true;
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

	return { file, options: { ...options, sourcePath: file }, json };
}

export async function runInspectMidiCommand(rawArgs: string[]): Promise<void> {
	let parsed: ReturnType<typeof parseInspectMidiArgs>;
	try {
		parsed = parseInspectMidiArgs(rawArgs);
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
		const inspection = await inspectSource(parsed.options);

		if (parsed.json) {
			printJsonSuccess(inspection, inspection.issues);
			return;
		}

		const title =
			inspection.sourceKind === "gpif"
				? "CHDG GP Inspection"
				: "CHDG MIDI Inspection";
		console.log(title);
		console.log("====================");
		console.log(`File: ${inspection.sourcePath}`);
		if (inspection.resolution !== undefined) {
			console.log(`Resolution (PPQ): ${inspection.resolution}`);
		}
		console.log();

		console.log("Tracks:");
		for (const track of inspection.tracks) {
			const chInfo =
				track.channel !== undefined ? ` (ch ${track.channel})` : "";
			const role = track.role === "drums" ? ` ${track.strength}` : "";
			console.log(
				`  [${track.index}] "${track.name ?? "(unnamed)"}"${chInfo}: ${track.noteCount} notes${role}`,
			);
		}
		console.log();

		console.log("Tempo Events:");
		for (const tempo of inspection.tempos) {
			const bpm =
				typeof tempo === "object" && tempo !== null && "bpm" in tempo
					? Number((tempo as { bpm: number }).bpm)
					: undefined;
			const tick =
				typeof tempo === "object" && tempo !== null && "tick" in tempo
					? Number((tempo as { tick: number }).tick)
					: undefined;
			if (bpm !== undefined && tick !== undefined) {
				console.log(`  - tick ${tick}: ${formatNumber(bpm)} BPM`);
			} else {
				console.log(`  - ${JSON.stringify(tempo)}`);
			}
		}
		console.log();

		console.log("Time Signatures:");
		for (const ts of inspection.timeSignatures) {
			if (
				typeof ts === "object" &&
				ts !== null &&
				"tick" in ts &&
				"numerator" in ts &&
				"denominator" in ts
			) {
				const event = ts as {
					tick: number;
					numerator: number;
					denominator: number;
				};
				console.log(
					`  - tick ${event.tick}: ${event.numerator}/${event.denominator}`,
				);
			} else {
				console.log(`  - ${JSON.stringify(ts)}`);
			}
		}
		console.log();

		if (inspection.sections.length > 0) {
			console.log("Sections:");
			for (const section of inspection.sections) {
				if (
					typeof section === "object" &&
					section !== null &&
					"tick" in section &&
					"name" in section
				) {
					const event = section as { tick: number; name: string };
					console.log(`  - tick ${event.tick}: ${event.name}`);
				} else {
					console.log(`  - ${JSON.stringify(section)}`);
				}
			}
		} else {
			console.log("Sections: none");
		}

		if (inspection.issues.length > 0) {
			console.log();
			console.log("Issues:");
			for (const item of inspection.issues) {
				console.log(`  - [${item.severity}] ${item.code}: ${item.message}`);
			}
		}
	} catch (err) {
		if (parsed.json) {
			const error =
				err instanceof ProjectServiceError
					? err
					: new ProjectServiceError(
							"INSPECT_SOURCE_FAILED",
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
