import { describe, expect, it } from "vitest";
import { deduplicateBaseNotes } from "./deduplicateBaseNotes.js";
import type { CloneHeroDrumNote } from "@chdg/core";

describe("deduplicateBaseNotes", () => {
  it("removes exact duplicate same tick/lane/length", () => {
    const notes: CloneHeroDrumNote[] = [
      { tick: 0, lane: "kick", length: 0 },
      { tick: 0, lane: "kick", length: 0 },
    ];
    const result = deduplicateBaseNotes(notes);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ tick: 0, lane: "kick", length: 0 });
  });

  it("keeps same lane on nearby ticks", () => {
    const notes: CloneHeroDrumNote[] = [
      { tick: 0, lane: "kick", length: 0 },
      { tick: 120, lane: "kick", length: 0 },
      { tick: 240, lane: "kick", length: 0 },
    ];
    const result = deduplicateBaseNotes(notes);
    expect(result).toHaveLength(3);
  });

  it("keeps different lanes on the same tick", () => {
    const notes: CloneHeroDrumNote[] = [
      { tick: 480, lane: "kick", length: 0 },
      { tick: 480, lane: "red", length: 0 },
      { tick: 480, lane: "yellow", length: 0 },
    ];
    const result = deduplicateBaseNotes(notes);
    expect(result).toHaveLength(3);
  });

  it("keeps different lengths on same tick and lane", () => {
    const notes: CloneHeroDrumNote[] = [
      { tick: 0, lane: "red", length: 0 },
      { tick: 0, lane: "red", length: 120 },
    ];
    const result = deduplicateBaseNotes(notes);
    expect(result).toHaveLength(2);
  });

  it("deduplicates exact duplicate with same tick/lane/length/flags", () => {
    const notes: CloneHeroDrumNote[] = [
      { tick: 0, lane: "yellow", length: 0 },
      { tick: 0, lane: "yellow", length: 0 },
    ];
    const result = deduplicateBaseNotes(notes);
    expect(result).toHaveLength(1);
  });

  it("preserves notes that differ only by cymbal flag", () => {
    const notes: CloneHeroDrumNote[] = [
      { tick: 0, lane: "yellow", length: 0 },
      { tick: 0, lane: "yellow", length: 0, cymbal: true },
    ];
    const result = deduplicateBaseNotes(notes);
    expect(result).toHaveLength(2);
  });

  it("preserves notes that differ only by ghost flag", () => {
    const notes: CloneHeroDrumNote[] = [
      { tick: 480, lane: "red", length: 0 },
      { tick: 480, lane: "red", length: 0, ghost: true },
    ];
    const result = deduplicateBaseNotes(notes);
    expect(result).toHaveLength(2);
  });

  it("preserves notes that differ only by accent flag", () => {
    const notes: CloneHeroDrumNote[] = [
      { tick: 960, lane: "blue", length: 0 },
      { tick: 960, lane: "blue", length: 0, accent: true },
    ];
    const result = deduplicateBaseNotes(notes);
    expect(result).toHaveLength(2);
  });
});
