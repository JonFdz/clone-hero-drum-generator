import { describe, expect, it } from "vitest";
import type { MidiTrack } from "./readMidi.js";
import type { MidiDrumPieceMap } from "@chdg/mappings";
import {
  classifyDrumTracks,
  scoreDrumTrack,
  selectDrumTrack,
} from "./drumTrackSelection.js";

const testMap: MidiDrumPieceMap = {
  "36": "kick",
  "38": "snare",
  "42": "hihat_closed",
  "49": "crash",
};

function fakeTrack(overrides: Partial<MidiTrack> = {}): MidiTrack {
  return {
    name: overrides.name ?? "",
    channel: overrides.channel ?? 0,
    notes: overrides.notes ?? [],
    noteCount: overrides.noteCount ?? (overrides.notes?.length ?? 0),
  };
}

function makeNotes(midi: number, count: number) {
  return Array.from({ length: count }, () => ({
    midi,
    velocity: 100,
    ticks: 0,
    durationTicks: 0,
  }));
}

describe("scoreDrumTrack", () => {
  it("scores channel 9 + 'Drums' name >= 45", () => {
    const track = fakeTrack({
      name: "Drums",
      channel: 9,
      notes: [
        ...makeNotes(36, 4),
        ...makeNotes(38, 4),
        ...makeNotes(42, 4),
      ],
    });
    expect(scoreDrumTrack(track, testMap)).toBeGreaterThanOrEqual(45);
  });

  it("returns -1000 for 'Guitar' name", () => {
    const track = fakeTrack({ name: "Guitar", notes: makeNotes(36, 10) });
    expect(scoreDrumTrack(track, testMap)).toBe(-1000);
  });

  it("returns -1000 for 'Bass' name", () => {
    const track = fakeTrack({ name: "Bass", notes: makeNotes(36, 10) });
    expect(scoreDrumTrack(track, testMap)).toBe(-1000);
  });

  it("returns -1000 for 'Vocals' name", () => {
    const track = fakeTrack({ name: "Vocals", notes: makeNotes(36, 10) });
    expect(scoreDrumTrack(track, testMap)).toBe(-1000);
  });

  it("returns -1000 for 'Keys' name", () => {
    const track = fakeTrack({ name: "Keys", notes: makeNotes(36, 10) });
    expect(scoreDrumTrack(track, testMap)).toBe(-1000);
  });

  it("returns -1000 for 'Piano' name", () => {
    const track = fakeTrack({ name: "Piano", notes: makeNotes(36, 10) });
    expect(scoreDrumTrack(track, testMap)).toBe(-1000);
  });

  it("returns -1000 for 'Recorder' name", () => {
    const track = fakeTrack({ name: "Recorder", notes: makeNotes(36, 10) });
    expect(scoreDrumTrack(track, testMap)).toBe(-1000);
  });

  it("returns -1000 for 'Synth' name", () => {
    const track = fakeTrack({ name: "Synth", notes: makeNotes(36, 10) });
    expect(scoreDrumTrack(track, testMap)).toBe(-1000);
  });

  it("returns -1000 for 'Strings' name", () => {
    const track = fakeTrack({ name: "Strings", notes: makeNotes(36, 10) });
    expect(scoreDrumTrack(track, testMap)).toBe(-1000);
  });

  it("scores only crash notes < 45", () => {
    const track = fakeTrack({ notes: makeNotes(49, 10) });
    expect(scoreDrumTrack(track, testMap)).toBeLessThan(45);
  });

  it("scores kick+snare+hihat >= 45", () => {
    const track = fakeTrack({
      notes: [
        ...makeNotes(36, 4),
        ...makeNotes(38, 4),
        ...makeNotes(42, 4),
      ],
    });
    expect(scoreDrumTrack(track, testMap)).toBeGreaterThanOrEqual(45);
  });
});

describe("classifyDrumTracks", () => {
  it("classifies mixed tracks correctly", () => {
    const tracks = [
      fakeTrack({ name: "Guitar" }),
      fakeTrack({
        name: "Drums",
        channel: 9,
        notes: [
          ...makeNotes(36, 4),
          ...makeNotes(38, 4),
          ...makeNotes(42, 4),
        ],
      }),
      fakeTrack({
        notes: [...makeNotes(36, 3), ...makeNotes(38, 3)],
      }),
    ];
    const { strong, weak } = classifyDrumTracks(tracks, testMap);
    expect(strong).toEqual([1]);
    expect(weak).toEqual([2]);
  });
});

describe("selectDrumTrack", () => {
  it("selects explicit index", () => {
    const tracks = [fakeTrack({ name: "Drums", notes: makeNotes(36, 10) })];
    const result = selectDrumTrack(tracks, testMap, 0);
    expect(result).toEqual({ kind: "selected", trackIndex: 0 });
  });

  it("selects when one strong track exists", () => {
    const tracks = [
      fakeTrack({ name: "Guitar" }),
      fakeTrack({
        name: "Drums",
        channel: 9,
        notes: [
          ...makeNotes(36, 4),
          ...makeNotes(38, 4),
          ...makeNotes(42, 4),
        ],
      }),
    ];
    const result = selectDrumTrack(tracks, testMap);
    expect(result).toEqual({ kind: "selected", trackIndex: 1 });
  });

  it("errors when zero strong tracks exist", () => {
    const tracks = [fakeTrack({ name: "Guitar" })];
    const result = selectDrumTrack(tracks, testMap);
    expect(result.kind).toBe("error");
    if (result.kind === "error") {
      expect(result.message).toMatch(/no strong drum track/i);
    }
  });

  it("errors when multiple strong tracks exist", () => {
    const tracks = [
      fakeTrack({
        name: "Drums",
        channel: 9,
        notes: [...makeNotes(36, 4), ...makeNotes(38, 4), ...makeNotes(42, 4)],
      }),
      fakeTrack({
        name: "Percussion",
        channel: 9,
        notes: [...makeNotes(36, 4), ...makeNotes(38, 4), ...makeNotes(42, 4)],
      }),
    ];
    const result = selectDrumTrack(tracks, testMap);
    expect(result.kind).toBe("error");
    if (result.kind === "error") {
      expect(result.message).toMatch(/multiple strong drum tracks/i);
      expect(result.message).toMatch(/0/);
      expect(result.message).toMatch(/1/);
    }
  });

  it("errors when explicit index is out of range", () => {
    const tracks = [fakeTrack({ name: "Drums", notes: makeNotes(36, 10) })];
    const result = selectDrumTrack(tracks, testMap, 5);
    expect(result.kind).toBe("error");
    if (result.kind === "error") {
      expect(result.message).toMatch(/out of range/i);
    }
  });
});
