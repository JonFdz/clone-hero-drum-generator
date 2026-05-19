export type SongMetadataOptions = {
	name?: string;
	artist?: string;
	album?: string;
	year?: string;
	genre?: string;
	charter?: string;
};

export type GenerateOptions = SongMetadataOptions & {
	trackIndex?: number;
	trackIndexes?: number[];
	outDir: string;
	audioFile?: string;
	audioSource?: string;
	offsetMs?: number;
	json?: boolean;
};

const metadataOptions = new Set([
	"--name",
	"--artist",
	"--album",
	"--year",
	"--genre",
	"--charter",
]);

function requireOptionValue(
	optionName: string,
	value: string | undefined,
): string {
	if (value === undefined || value.startsWith("--")) {
		throw new Error(`${optionName} requires a value.`);
	}
	return value;
}

export function parseGenerateArgs(
	rawArgs: string[],
): { file: string; options: GenerateOptions } | { help: true } {
	const helpFlags = new Set(["--help", "-h"]);
	if (rawArgs.some((a) => helpFlags.has(a))) {
		return { help: true };
	}

	// First pass: extract option values so they are not treated as the file
	const consumed = new Set<number>();
	const options: GenerateOptions = { outDir: "" };

	for (let i = 0; i < rawArgs.length; i++) {
		const arg = rawArgs[i];
		if (arg === "--track") {
			const next = requireOptionValue("--track", rawArgs[++i]);
			const idx = Number(next);
			if (!Number.isInteger(idx)) {
				throw new Error(`Invalid track index: ${next}`);
			}
			options.trackIndex = idx;
			consumed.add(i - 1);
			consumed.add(i);
		} else if (arg === "--tracks") {
			const next = requireOptionValue("--tracks", rawArgs[++i]);
			options.trackIndexes = parseTrackIndexes(next);
			consumed.add(i - 1);
			consumed.add(i);
		} else if (arg === "--out") {
			const next = requireOptionValue("--out", rawArgs[++i]);
			options.outDir = next;
			consumed.add(i - 1);
			consumed.add(i);
		} else if (arg === "--audio") {
			const next = requireOptionValue("--audio", rawArgs[++i]);
			options.audioFile = next;
			consumed.add(i - 1);
			consumed.add(i);
		} else if (arg === "--audio-source") {
			const next = requireOptionValue("--audio-source", rawArgs[++i]);
			options.audioSource = next;
			consumed.add(i - 1);
			consumed.add(i);
		} else if (arg === "--json") {
			options.json = true;
			consumed.add(i);
		} else if (metadataOptions.has(arg)) {
			const next = requireOptionValue(arg, rawArgs[++i]);
			const fieldName = arg.slice(2) as keyof SongMetadataOptions;
			options[fieldName] = next;
			consumed.add(i - 1);
			consumed.add(i);
		} else if (arg === "--offset-ms") {
			const next = requireOptionValue("--offset-ms", rawArgs[++i]);
			const offsetMs = Number(next);
			if (!Number.isFinite(offsetMs)) {
				throw new Error(`Invalid --offset-ms value: ${next}`);
			}
			options.offsetMs = offsetMs;
			consumed.add(i - 1);
			consumed.add(i);
		}
	}

	// Find the first non-consumed, non-option argument as the file
	let fileIndex = -1;
	for (let i = 0; i < rawArgs.length; i++) {
		if (!consumed.has(i) && !rawArgs[i].startsWith("-")) {
			fileIndex = i;
			break;
		}
	}

	if (fileIndex === -1) {
		throw new Error("Missing source file path.");
	}

	const file = rawArgs[fileIndex];

	// Validate that remaining unconsumed args are not unknown options or extra positional arguments
	for (let i = 0; i < rawArgs.length; i++) {
		if (!consumed.has(i) && i !== fileIndex) {
			const arg = rawArgs[i];
			if (arg.startsWith("-")) {
				throw new Error(`Unknown option: ${arg}`);
			}
			throw new Error(`Unexpected argument: ${arg}`);
		}
	}

	if (options.trackIndex !== undefined && options.trackIndexes !== undefined) {
		throw new Error("Use either --track <index> or --tracks <csv>, not both.");
	}

	if (!options.outDir) {
		throw new Error("--out <output-dir> is required.");
	}

	return { file, options };
}

export function parseTrackIndexes(rawValue: string): number[] {
	const parts = rawValue.split(",");
	if (parts.length === 0 || parts.some((part) => part.trim() === "")) {
		throw new Error("--tracks must contain comma-separated track indexes without empty values.");
	}

	const indexes = parts.map((part) => {
		const trimmed = part.trim();
		const index = Number(trimmed);
		if (!Number.isInteger(index)) {
			throw new Error(`Invalid --tracks value: ${trimmed}`);
		}
		return index;
	});

	const seen = new Set<number>();
	for (const index of indexes) {
		if (seen.has(index)) {
			throw new Error(`Duplicate --tracks value: ${index}`);
		}
		seen.add(index);
	}

	return indexes;
}
