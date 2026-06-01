import type { DrumPiece } from "@chdg/core";
import generalMidiDrumsUntyped from "@chdg/mappings/data/general-midi-drums.json" with { type: "json" };
import {
	resolveMidiDrumNote,
	type DrumMappingAction,
	type DrumMappingConfidence,
	type DrumNoteResolution,
	type MidiDrumNoteAtlas,
	type MappableDrumPiece,
} from "@chdg/mappings";

export const GPIF_ARTICULATION_RESOLVER_VERSION = "0.1.0";

const generalMidiDrums = generalMidiDrumsUntyped as MidiDrumNoteAtlas;

export type GpifArticulationResolvedVia =
	| "override"
	| "output-midi-number"
	| "name-pattern"
	| "input-midi-number"
	| "conflict"
	| "unknown";

export type GpifArticulationMetadata = {
	id?: string;
	name?: string;
	inputMidiNumbers?: number[];
	outputMidiNumber?: number;
	element?: string;
	instrument?: string;
	trackId?: string;
	trackIndex?: number;
	trackName?: string;
};

export type GpifArticulationResolution = {
	sourceKind: "gpif";
	key: string;
	sourceValue: string;
	noteName?: string;
	inputMidiNumbers?: number[];
	outputMidiNumber?: number;
	resolvedVia: GpifArticulationResolvedVia;
	action: DrumMappingAction;
	automaticPiece?: DrumPiece;
	suggestedPiece?: MappableDrumPiece;
	confidence: DrumMappingConfidence;
	family?: string;
	reason: string;
};

export type GpifMappingOverride = {
	target: { kind: "piece"; piece: MappableDrumPiece } | { kind: "ignore" };
};

export type GpifMappingOverrides = Record<string, GpifMappingOverride>;

type NameResolution = Omit<GpifArticulationResolution, "key" | "sourceKind" | "sourceValue" | "noteName" | "inputMidiNumbers" | "outputMidiNumber">;

export function resolveGpifArticulation(
	metadata: GpifArticulationMetadata,
	overrides?: GpifMappingOverrides,
): GpifArticulationResolution {
	const key = buildGpifArticulationKey(metadata);
	const sourceValue = metadata.name?.trim() || formatMidiEvidence(metadata) || key.replace(/^gpif:/, "");
	const base = {
		sourceKind: "gpif" as const,
		key,
		sourceValue,
		...(metadata.name ? { noteName: metadata.name } : {}),
		...(metadata.inputMidiNumbers?.length ? { inputMidiNumbers: metadata.inputMidiNumbers } : {}),
		...(metadata.outputMidiNumber !== undefined ? { outputMidiNumber: metadata.outputMidiNumber } : {}),
	};

	const legacyKey = `gpif:${sourceValue.trim().toLowerCase()}`;
	const override = overrides?.[key] ?? overrides?.[legacyKey];
	if (override?.target.kind === "ignore") {
		return {
			...base,
			resolvedVia: "override",
			action: "ignore",
			confidence: "high",
			reason: "Project override ignores this GPIF articulation.",
		};
	}
	if (override?.target.kind === "piece") {
		return {
			...base,
			resolvedVia: "override",
			action: "map",
			automaticPiece: override.target.piece,
			confidence: "high",
			reason: "Project override maps this GPIF articulation.",
		};
	}

	const outputResolution = metadata.outputMidiNumber === undefined
		? undefined
		: fromMidiResolution(resolveMidiDrumNote(metadata.outputMidiNumber, generalMidiDrums), "output-midi-number");
	const nameResolution = resolveNamePattern(metadata);
	if (outputResolution && nameResolution && conflicts(outputResolution, nameResolution)) {
		return {
			...base,
			resolvedVia: "conflict",
			action: "candidate",
			suggestedPiece: firstMappablePiece(nameResolution, outputResolution),
			confidence: "low",
			family: nameResolution.family ?? outputResolution.family,
			reason: `Name/output conflict: ${metadata.name ?? "articulation name"} suggests ${pieceOrAction(nameResolution)}, but OutputMidiNumber ${metadata.outputMidiNumber} suggests ${pieceOrAction(outputResolution)}.`,
		};
	}
	if (outputResolution && outputResolution.action !== "unknown") {
		return { ...base, ...outputResolution };
	}
	if (nameResolution) return { ...base, ...nameResolution };

	const inputResolution = resolveInputMidiNumbers(metadata.inputMidiNumbers);
	if (inputResolution) return { ...base, ...inputResolution };

	return {
		...base,
		resolvedVia: "unknown",
		action: "unknown",
		automaticPiece: "unknown",
		confidence: "low",
		family: "unknown",
		reason: "No OutputMidiNumber, controlled name pattern, or safe input MIDI fallback resolved this GPIF articulation.",
	};
}

export function buildGpifArticulationKey(metadata: GpifArticulationMetadata): string {
	const trackPart = normalizeKeyPart(metadata.trackId ?? (metadata.trackIndex !== undefined ? String(metadata.trackIndex) : "unknown-track"));
	if (metadata.id?.trim()) return `gpif:${trackPart}:${normalizeKeyPart(metadata.id)}`;
	const name = normalizeKeyPart(metadata.name ?? "unknown");
	const output = metadata.outputMidiNumber === undefined ? "no-output" : String(metadata.outputMidiNumber);
	const inputs = metadata.inputMidiNumbers?.length ? metadata.inputMidiNumbers.join("-") : "no-input";
	return `gpif:${trackPart}:${name}:${output}:${inputs}`;
}

function fromMidiResolution(
	resolution: DrumNoteResolution,
	resolvedVia: "output-midi-number" | "input-midi-number",
): NameResolution {
	if (resolution.action === "map") {
		return {
			resolvedVia,
			action: "map",
			automaticPiece: resolution.piece,
			confidence: resolution.entry.confidence,
			family: resolution.entry.family,
			reason: `Resolved from ${resolvedVia === "output-midi-number" ? "OutputMidiNumber" : "InputMidiNumbers"} ${resolution.note}: ${resolution.entry.name}.`,
		};
	}
	if (resolution.action === "candidate") {
		return {
			resolvedVia,
			action: "candidate",
			suggestedPiece: resolution.suggestedPiece,
			confidence: resolution.entry.confidence,
			family: resolution.entry.family,
			reason: `Resolved as review candidate from ${resolvedVia === "output-midi-number" ? "OutputMidiNumber" : "InputMidiNumbers"} ${resolution.note}: ${resolution.entry.name}. ${resolution.entry.reason}`,
		};
	}
	if (resolution.action === "ignore") {
		return {
			resolvedVia,
			action: "ignore",
			confidence: resolution.entry.confidence,
			family: resolution.entry.family,
			reason: `Known auxiliary percussion from ${resolvedVia === "output-midi-number" ? "OutputMidiNumber" : "InputMidiNumbers"} ${resolution.note}: ${resolution.entry.name}.`,
		};
	}
	return {
		resolvedVia,
		action: "unknown",
		automaticPiece: "unknown",
		confidence: "low",
		family: "unknown",
		reason: `${resolvedVia === "output-midi-number" ? "OutputMidiNumber" : "InputMidiNumbers"} ${resolution.note} is not covered by the MIDI Drum Note Atlas.`,
	};
}

function resolveNamePattern(metadata: GpifArticulationMetadata): NameResolution | undefined {
	const name = normalizeText(metadata.name);
	if (!name) return undefined;
	const rideContext = /\bride\b/.test(normalizeText([metadata.trackName, metadata.instrument, metadata.element].filter(Boolean).join(" ")) + " " + name);

	if (/\b(pedal hi hat|pedal hihat|foot hi hat|foot hihat|hi hat chick|hihat chick)\b/.test(name)) return candidate("hihat_closed", "hihat", "medium", "Foot hi-hat/chick may not represent a playable hand note.");
	if (/\b(hi hat splash|hihat splash)\b/.test(name)) return candidate("hihat_open", "hihat", "low", "Hi-hat splash is review-only by default.");
	if (/\b(open hi hat|open hihat|hi hat open|hihat open|hi hat half|hihat half|half open hi hat|half open hihat|semi open hi hat|semi open hihat|loose hi hat|loose hihat)\b/.test(name)) return map("hihat_open", "hihat", /half|semi|loose/.test(name) ? "medium" : "high", "Controlled GPIF name pattern resolves to open hi-hat.");
	if (/\b(closed hi hat|closed hihat|hi hat closed|hihat closed)\b/.test(name)) return map("hihat_closed", "hihat", "high", "Controlled GPIF name pattern resolves to closed hi-hat.");

	if (/\b(kick|bass drum|acoustic bass drum|bass drum 1)\b/.test(name)) return map("kick", "kick", "high", "Controlled GPIF name pattern resolves to kick.");
	if (/\b(side stick|sidestick|cross stick|rimshot|rim shot)\b/.test(name)) return map("snare", "snare", "high", "Controlled GPIF name pattern resolves rim/side-stick to snare.");
	if (/\b(snare rim|snare|acoustic snare|electric snare)\b/.test(name)) return map("snare", "snare", "high", "Controlled GPIF name pattern resolves to snare.");
	if (/\brim\b/.test(name) && /\bsnare\b/.test(name)) return map("snare", "snare", "medium", "Controlled GPIF name pattern resolves snare rim to snare.");
	if (/\b(stick shot|stickshot)\b/.test(name)) return candidate("snare", "snare", "medium", "Stick shot is review-only by default.");

	if (/\b(high tom|hi tom|hi mid tom|high mid tom|tom high)\b/.test(name)) return map("tom_high", "tom", "high", "Controlled GPIF name pattern resolves to high tom.");
	if (/\b(mid tom|low tom|low mid tom|tom mid)\b/.test(name)) return map("tom_mid", "tom", "high", "Controlled GPIF name pattern resolves to mid tom.");
	if (/\b(floor tom|low floor tom|high floor tom|tom floor)\b/.test(name)) return map("tom_floor", "tom", "high", "Controlled GPIF name pattern resolves to floor tom.");

	if (/\b(china|chinese|chinese cymbal|crash|crash cymbal|splash|splash cymbal)\b/.test(name)) return map("crash", "cymbal", "high", "Controlled GPIF name pattern resolves to crash lane.");
	if (/\b(ride bell|bell ride|ride cup|ride cymbal|ride)\b/.test(name) || (/\bcup\b/.test(name) && rideContext)) return map("ride", "cymbal", "high", "Controlled GPIF name pattern resolves to ride lane.");

	if (/\b(tambourine|vibraslap|agogo|cabasa|maracas|whistle|guiro|cuica|triangle|shaker|jingle bell|bell tree|castanets|scratch push|scratch pull|metronome click|metronome bell|count in|tap tempo|high q)\b/.test(name)) return ignore("aux-percussion", "Known auxiliary percussion is ignored by default.");
	if (/\b(hand clap|clap|slap|sticks|stick|square click|claves|high wood block|high woodblock|low wood block|low woodblock)\b/.test(name)) return candidate("snare", "aux-percussion", /square click|wood/.test(name) ? "low" : "medium", "Known auxiliary percussion candidate is review-only by default.");
	if (/\b(high bongo|mute high conga|high timbale)\b/.test(name)) return candidate("tom_high", "aux-percussion", "medium", "Known auxiliary percussion candidate is review-only by default.");
	if (/\b(low bongo|open high conga|low timbale)\b/.test(name)) return candidate("tom_mid", "aux-percussion", "medium", "Known auxiliary percussion candidate is review-only by default.");
	if (/\b(low conga|surdo)\b/.test(name)) return candidate("tom_floor", "aux-percussion", "medium", "Known auxiliary percussion candidate is review-only by default.");

	return undefined;
}

function resolveInputMidiNumbers(inputMidiNumbers: number[] | undefined): NameResolution | undefined {
	const unique = Array.from(new Set(inputMidiNumbers ?? [])).filter(Number.isFinite);
	if (unique.length === 0) return undefined;
	if (unique.length !== 1) {
		const pieces = new Set(unique.map((note) => pieceOrAction(fromMidiResolution(resolveMidiDrumNote(note, generalMidiDrums), "input-midi-number"))));
		if (pieces.size === 1) return fromMidiResolution(resolveMidiDrumNote(unique[0], generalMidiDrums), "input-midi-number");
		return { resolvedVia: "input-midi-number", action: "unknown", automaticPiece: "unknown", confidence: "low", family: "unknown", reason: `Multiple InputMidiNumbers disagree: ${unique.join(", ")}.` };
	}
	const resolution = fromMidiResolution(resolveMidiDrumNote(unique[0], generalMidiDrums), "input-midi-number");
	return resolution.action === "unknown" ? undefined : { ...resolution, confidence: lowerConfidence(resolution.confidence) };
}

function conflicts(left: NameResolution, right: NameResolution): boolean {
	if (left.action === "unknown" || right.action === "unknown") return false;
	if (left.action !== right.action) return true;
	const leftPiece = left.automaticPiece ?? left.suggestedPiece;
	const rightPiece = right.automaticPiece ?? right.suggestedPiece;
	return Boolean(leftPiece && rightPiece && leftPiece !== rightPiece);
}

function map(piece: MappableDrumPiece, family: string, confidence: DrumMappingConfidence, reason: string): NameResolution {
	return { resolvedVia: "name-pattern", action: "map", automaticPiece: piece, confidence, family, reason };
}

function candidate(piece: MappableDrumPiece, family: string, confidence: DrumMappingConfidence, reason: string): NameResolution {
	return { resolvedVia: "name-pattern", action: "candidate", suggestedPiece: piece, confidence, family, reason };
}

function ignore(family: string, reason: string): NameResolution {
	return { resolvedVia: "name-pattern", action: "ignore", confidence: "high", family, reason };
}

function lowerConfidence(confidence: DrumMappingConfidence): DrumMappingConfidence {
	if (confidence === "high") return "medium";
	return "low";
}

function pieceOrAction(resolution: NameResolution): string {
	return resolution.automaticPiece ?? resolution.suggestedPiece ?? resolution.action;
}

function firstMappablePiece(
	...resolutions: NameResolution[]
): MappableDrumPiece | undefined {
	for (const resolution of resolutions) {
		const piece = resolution.automaticPiece ?? resolution.suggestedPiece;
		if (piece && piece !== "unknown") return piece;
	}
	return undefined;
}

function formatMidiEvidence(metadata: GpifArticulationMetadata): string | undefined {
	if (metadata.outputMidiNumber !== undefined) return `Output MIDI ${metadata.outputMidiNumber}`;
	if (metadata.inputMidiNumbers?.length) return `Input MIDI ${metadata.inputMidiNumbers.join(",")}`;
	return undefined;
}

function normalizeText(value: string | undefined): string {
	return (value ?? "").toLowerCase().replace(/[()_\-]+/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeKeyPart(value: string): string {
	return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}
