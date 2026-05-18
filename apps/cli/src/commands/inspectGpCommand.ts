import { isAbsolute, resolve } from "node:path";
import { inspectSource, ProjectServiceError } from "@chdg/project";
import {
	consumeJsonFlag,
	printJsonError,
	printJsonSuccess,
} from "../jsonOutput.js";

function parseInspectGpArgs(
	rawArgs: string[],
): { file: string; json: boolean } | { help: true; json: boolean } {
	const { args, json } = consumeJsonFlag(rawArgs);
	const helpFlags = new Set(["--help", "-h"]);
	if (args.some((a) => helpFlags.has(a))) {
		return { help: true, json };
	}

	if (args.length === 0) {
		throw new Error("Missing GP file path.");
	}

	const unknownOption = args.find((arg) => arg.startsWith("-"));
	if (unknownOption !== undefined) {
		throw new Error(`Unknown option: ${unknownOption}`);
	}

	if (args.length > 1) {
		throw new Error(`Unexpected argument: ${args[1]}`);
	}

	return { file: args[0], json };
}

export async function runInspectGpCommand(rawArgs: string[]): Promise<void> {
	let parsed: ReturnType<typeof parseInspectGpArgs>;
	try {
		parsed = parseInspectGpArgs(rawArgs);
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
		const inspection = await inspectSource({ sourcePath: file });

		if (parsed.json) {
			printJsonSuccess(inspection, inspection.issues);
			return;
		}

		console.log("CHDG GP Inspection");
		console.log("==================");
		console.log(`File: ${inspection.sourcePath}`);
		console.log(`Format: ${inspection.sourceKind.toUpperCase()}`);
		console.log();

		console.log("Tracks:");
		if (inspection.tracks.length === 0) {
			console.log("  (none)");
		} else {
			for (const track of inspection.tracks) {
				const details = [
					track.channel !== undefined ? `channel: ${track.channel}` : undefined,
					`role: ${track.role}`,
					track.role === "drums" ? `strength: ${track.strength}` : undefined,
				].filter(Boolean);
				const detailText = details.length > 0 ? ` — ${details.join(", ")}` : "";
				console.log(
					`  [${track.index}] ${track.name ?? "(unnamed)"}${detailText}`,
				);
			}
		}
		console.log();

		console.log("Tempo Events:");
		if (inspection.tempos.length === 0) {
			console.log("  none");
		} else {
			for (const item of inspection.tempos) {
				console.log(`  - ${formatUnknown(item)}`);
			}
		}
		console.log();

		console.log("Time Signatures:");
		if (inspection.timeSignatures.length === 0) {
			console.log("  none");
		} else {
			for (const item of inspection.timeSignatures) {
				console.log(`  - ${formatUnknown(item)}`);
			}
		}
		console.log();

		console.log("Sections/Markers:");
		if (inspection.sections.length === 0) {
			console.log("  none");
		} else {
			for (const item of inspection.sections) {
				console.log(`  - ${formatUnknown(item)}`);
			}
		}

		if (inspection.issues.length > 0) {
			console.log();
			console.log("Warnings/Issues:");
			for (const issue of inspection.issues) {
				console.log(`  - [${issue.severity}] ${issue.code}: ${issue.message}`);
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

function formatUnknown(value: unknown): string {
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean")
		return String(value);
	return JSON.stringify(value);
}
