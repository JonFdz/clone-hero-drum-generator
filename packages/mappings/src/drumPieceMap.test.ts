import { describe, expect, it } from "vitest";
import { mapMidiNoteToDrumPiece } from "./drumPieceMap.js";
import type { MidiDrumPieceMap } from "./drumPieceMap.js";

const testMap: MidiDrumPieceMap = {
  "36": "kick",
  "38": "snare",
  "42": "hihat_closed",
};

describe("mapMidiNoteToDrumPiece", () => {
  it("maps kick (36)", () => {
    expect(mapMidiNoteToDrumPiece(36, testMap)).toBe("kick");
  });

  it("maps snare (38)", () => {
    expect(mapMidiNoteToDrumPiece(38, testMap)).toBe("snare");
  });

  it("maps hihat_closed (42)", () => {
    expect(mapMidiNoteToDrumPiece(42, testMap)).toBe("hihat_closed");
  });

  it("returns unknown for unmapped notes", () => {
    expect(mapMidiNoteToDrumPiece(999, testMap)).toBe("unknown");
  });
});
