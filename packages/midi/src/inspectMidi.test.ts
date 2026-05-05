import { describe, expect, it } from "vitest";
import type { MidiNote } from "./readMidi.js";
import type { MidiDrumPieceMap } from "@chdg/mappings";
import { computeNoteStats } from "./inspectMidi.js";

const testMap: MidiDrumPieceMap = {
  "36": "kick",
  "38": "snare",
  "42": "hihat_closed",
  "49": "crash",
};

function makeNote(midi: number, velocity: number): MidiNote {
  return { midi, velocity, ticks: 0, durationTicks: 0 };
}

describe("computeNoteStats", () => {
  it("returns empty stats for empty notes", () => {
    const { noteStats, unknownNotes } = computeNoteStats([], testMap);
    expect(noteStats).toEqual({});
    expect(unknownNotes).toEqual([]);
  });

  it("computes count, avg, min, max velocity for a single note", () => {
    const notes = [makeNote(36, 100)];
    const { noteStats, unknownNotes } = computeNoteStats(notes, testMap);
    expect(noteStats[36]).toEqual({
      count: 1,
      avgVelocity: 100,
      minVelocity: 100,
      maxVelocity: 100,
      guessedPiece: "kick",
    });
    expect(unknownNotes).toEqual([]);
  });

  it("aggregates multiple velocities for the same midi note", () => {
    const notes = [
      makeNote(38, 50),
      makeNote(38, 100),
      makeNote(38, 75),
    ];
    const { noteStats, unknownNotes } = computeNoteStats(notes, testMap);
    expect(noteStats[38]).toEqual({
      count: 3,
      avgVelocity: 75,
      minVelocity: 50,
      maxVelocity: 100,
      guessedPiece: "snare",
    });
    expect(unknownNotes).toEqual([]);
  });

  it("handles multiple different mapped notes", () => {
    const notes = [
      makeNote(36, 80),
      makeNote(38, 90),
      makeNote(42, 70),
    ];
    const { noteStats, unknownNotes } = computeNoteStats(notes, testMap);
    expect(Object.keys(noteStats)).toHaveLength(3);
    expect(noteStats[36].guessedPiece).toBe("kick");
    expect(noteStats[38].guessedPiece).toBe("snare");
    expect(noteStats[42].guessedPiece).toBe("hihat_closed");
    expect(unknownNotes).toEqual([]);
  });

  it("flags unknown notes and returns sorted unique list", () => {
    const notes = [
      makeNote(36, 100),
      makeNote(99, 80),
      makeNote(99, 90),
      makeNote(77, 60),
    ];
    const { noteStats, unknownNotes } = computeNoteStats(notes, testMap);
    expect(noteStats[36].guessedPiece).toBe("kick");
    expect(noteStats[99].guessedPiece).toBe("unknown");
    expect(noteStats[77].guessedPiece).toBe("unknown");
    expect(unknownNotes).toEqual([77, 99]);
  });

  it("does not duplicate unknown note numbers", () => {
    const notes = [
      makeNote(200, 50),
      makeNote(200, 60),
      makeNote(200, 70),
    ];
    const { unknownNotes } = computeNoteStats(notes, testMap);
    expect(unknownNotes).toEqual([200]);
  });
});
