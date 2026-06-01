import type { DrumPiece } from "@chdg/core";

export const MIDI_DRUM_NOTE_ATLAS_VERSION = "0.1.0";

export type MappableDrumPiece = Exclude<DrumPiece, "unknown">;
export type DrumMappingAction = "map" | "candidate" | "ignore" | "unknown";
export type DrumMappingConfidence = "high" | "medium" | "low";
export type DrumMappingFamily =
	| "kick"
	| "snare"
	| "hihat"
	| "tom"
	| "cymbal"
	| "aux-percussion"
	| "fx"
	| "metronome"
	| "digital"
	| "unknown";
export type DrumMappingSource = "gm" | "gm2" | "gs" | "profile" | "unknown";

export type DrumNoteAtlasEntry = {
	note: number;
	name: string;
	action: DrumMappingAction;
	piece?: MappableDrumPiece;
	confidence: DrumMappingConfidence;
	family: DrumMappingFamily;
	source: DrumMappingSource;
	reason: string;
};

export type MidiDrumNoteAtlas = DrumNoteAtlasEntry[];
export type MidiDrumPieceMap = MidiDrumNoteAtlas;

export type DrumNoteResolution =
	| {
			action: "map";
			note: number;
			entry: DrumNoteAtlasEntry;
			piece: MappableDrumPiece;
	  }
	| {
			action: "candidate";
			note: number;
			entry: DrumNoteAtlasEntry;
			suggestedPiece?: MappableDrumPiece;
	  }
	| { action: "ignore"; note: number; entry: DrumNoteAtlasEntry }
	| { action: "unknown"; note: number };

export function resolveMidiDrumNote(
	noteNumber: number,
	atlas: MidiDrumNoteAtlas,
): DrumNoteResolution {
	const entry = atlas.find((item) => item.note === noteNumber);
	if (!entry) return { action: "unknown", note: noteNumber };
	if (entry.action === "map") {
		if (!entry.piece) return { action: "unknown", note: noteNumber };
		return { action: "map", note: noteNumber, entry, piece: entry.piece };
	}
	if (entry.action === "candidate") {
		return {
			action: "candidate",
			note: noteNumber,
			entry,
			suggestedPiece: entry.piece,
		};
	}
	if (entry.action === "ignore") {
		return { action: "ignore", note: noteNumber, entry };
	}
	return { action: "unknown", note: noteNumber };
}

export function mapMidiNoteToDrumPiece(
	noteNumber: number,
	atlas: MidiDrumNoteAtlas,
): DrumPiece {
	const resolution = resolveMidiDrumNote(noteNumber, atlas);
	return resolution.action === "map" ? resolution.piece : "unknown";
}
