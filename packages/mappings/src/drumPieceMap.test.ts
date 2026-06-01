import atlas from "../data/general-midi-drums.json" with { type: "json" };
import { describe, expect, it } from "vitest";
import {
	MIDI_DRUM_NOTE_ATLAS_VERSION,
	mapMidiNoteToDrumPiece,
	resolveMidiDrumNote,
	type MidiDrumNoteAtlas,
} from "./drumPieceMap.js";

const generalMidiDrums = atlas as MidiDrumNoteAtlas;

describe("MIDI drum note atlas", () => {
	it("exports development atlas version 0.1.0", () => {
		expect(MIDI_DRUM_NOTE_ATLAS_VERSION).toBe("0.1.0");
	});

	it("covers GM 35-81 plus extended 27-34 and 82-87", () => {
		const notes = new Set(generalMidiDrums.map((entry) => entry.note));
		for (let note = 35; note <= 81; note += 1) expect(notes.has(note)).toBe(true);
		for (const note of [27, 28, 29, 30, 31, 32, 33, 34, 82, 83, 84, 85, 86, 87]) {
			expect(notes.has(note)).toBe(true);
		}
	});

	it("maps safe GM notes automatically", () => {
		expect(resolveMidiDrumNote(36, generalMidiDrums)).toMatchObject({ action: "map", piece: "kick" });
		expect(resolveMidiDrumNote(38, generalMidiDrums)).toMatchObject({ action: "map", piece: "snare" });
		expect(resolveMidiDrumNote(42, generalMidiDrums)).toMatchObject({ action: "map", piece: "hihat_closed" });
		expect(resolveMidiDrumNote(46, generalMidiDrums)).toMatchObject({ action: "map", piece: "hihat_open" });
		expect(resolveMidiDrumNote(49, generalMidiDrums)).toMatchObject({ action: "map", piece: "crash" });
		expect(resolveMidiDrumNote(51, generalMidiDrums)).toMatchObject({ action: "map", piece: "ride" });
	});

	it("marks required review candidates without automapping", () => {
		expect(resolveMidiDrumNote(39, generalMidiDrums)).toMatchObject({ action: "candidate", suggestedPiece: "snare" });
		expect(resolveMidiDrumNote(44, generalMidiDrums)).toMatchObject({ action: "candidate", suggestedPiece: "hihat_closed" });
		expect(resolveMidiDrumNote(56, generalMidiDrums)).toMatchObject({ action: "candidate" });
		expect(resolveMidiDrumNote(65, generalMidiDrums)).toMatchObject({ action: "candidate", suggestedPiece: "tom_high" });
		expect(resolveMidiDrumNote(86, generalMidiDrums)).toMatchObject({ action: "candidate", suggestedPiece: "tom_floor" });
		expect(mapMidiNoteToDrumPiece(44, generalMidiDrums)).toBe("unknown");
	});

	it("marks known auxiliary percussion ignored", () => {
		for (const note of [54, 58, 67, 68, 69, 70, 71, 72, 73, 74, 78, 79, 80, 81, 82, 83, 84, 85]) {
			expect(resolveMidiDrumNote(note, generalMidiDrums).action).toBe("ignore");
		}
	});

	it("returns unknown for valid notes outside atlas", () => {
		expect(resolveMidiDrumNote(92, generalMidiDrums)).toEqual({ action: "unknown", note: 92 });
	});
});
