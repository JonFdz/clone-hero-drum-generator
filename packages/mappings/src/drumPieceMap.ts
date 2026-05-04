import type { DrumPiece } from "@chdg/core";
export type MidiDrumPieceMap = Record<string, DrumPiece>;
export function mapMidiNoteToDrumPiece(noteNumber: number, map: MidiDrumPieceMap): DrumPiece { return map[String(noteNumber)] ?? "unknown"; }
