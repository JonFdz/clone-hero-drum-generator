import { describe, expect, it } from "vitest";
import type { MidiReadResult, MidiTrack } from "./readMidi.js";
import type { MidiDrumPieceMap } from "@chdg/mappings";
import { normalizeDrums } from "./normalizeDrums.js";

const testMap: MidiDrumPieceMap = {
  "36": "kick",
  "38": "snare",
  "42": "hihat_closed",
  "99": "unknown",
};

function fakeTrack(overrides: Partial<MidiTrack> = {}): MidiTrack {
  return {
    name: overrides.name ?? "",
    channel: overrides.channel ?? 0,
    notes: overrides.notes ?? [],
    noteCount: overrides.noteCount ?? (overrides.notes?.length ?? 0),
  };
}

function fakeMidiResult(tracks: MidiTrack[]): MidiReadResult {
  return {
    resolution: 192,
    tempos: [{ tick: 0, bpm: 120 }],
    timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
    tracks,
  };
}

describe("normalizeDrums", () => {
  it("produces correct DrumHit array", () => {
    const tracks = [
      fakeTrack({
        name: "Drums",
        channel: 9,
        notes: [
          { midi: 36, velocity: 100, ticks: 0, durationTicks: 10 },
          { midi: 38, velocity: 80, ticks: 480, durationTicks: 20 },
        ],
      }),
    ];
    const result = normalizeDrums(fakeMidiResult(tracks), testMap);
    expect(result.hits).toHaveLength(2);
    expect(result.hits[0]).toMatchObject({
      tick: 0,
      piece: "kick",
      velocity: 100,
      durationTicks: 10,
    });
    expect(result.hits[1]).toMatchObject({
      tick: 480,
      piece: "snare",
      velocity: 80,
      durationTicks: 20,
    });
  });

  it("preserves source metadata", () => {
    const tracks = [
      fakeTrack({
        name: "Drums",
        channel: 9,
        notes: [{ midi: 36, velocity: 100, ticks: 0, durationTicks: 0 }],
      }),
    ];
    const result = normalizeDrums(fakeMidiResult(tracks), testMap);
    expect(result.hits[0].source).toEqual({
      midiNote: 36,
      trackIndex: 0,
      trackName: "Drums",
      channel: 9,
    });
  });

  it("preserves and reports unknown notes", () => {
    const tracks = [
      fakeTrack({
        name: "Drums",
        channel: 9,
        notes: [
          { midi: 36, velocity: 100, ticks: 0, durationTicks: 0 },
          { midi: 99, velocity: 100, ticks: 480, durationTicks: 0 },
          { midi: 99, velocity: 100, ticks: 960, durationTicks: 0 },
        ],
      }),
    ];
    const result = normalizeDrums(fakeMidiResult(tracks), testMap);
    expect(result.hits).toHaveLength(3);
    expect(result.hits[1].piece).toBe("unknown");
    expect(result.unknownNotes).toEqual([99]);
  });

  it("selects explicit trackIndex", () => {
    const tracks = [
      fakeTrack({ name: "Guitar", notes: [] }),
      fakeTrack({
        name: "Drums",
        channel: 9,
        notes: [{ midi: 36, velocity: 100, ticks: 0, durationTicks: 0 }],
      }),
    ];
    const result = normalizeDrums(fakeMidiResult(tracks), testMap, {
      trackIndex: 1,
    });
    expect(result.track.index).toBe(1);
    expect(result.hits[0].source.trackIndex).toBe(1);
  });

  it("auto-selects when one strong track exists", () => {
    const tracks = [
      fakeTrack({ name: "Guitar", notes: [] }),
      fakeTrack({
        name: "Drums",
        channel: 9,
        notes: [
          { midi: 36, velocity: 100, ticks: 0, durationTicks: 0 },
          { midi: 38, velocity: 100, ticks: 480, durationTicks: 0 },
          { midi: 42, velocity: 100, ticks: 960, durationTicks: 0 },
        ],
      }),
    ];
    const result = normalizeDrums(fakeMidiResult(tracks), testMap);
    expect(result.track.index).toBe(1);
  });

  it("throws when zero strong tracks and no explicit index", () => {
    const tracks = [fakeTrack({ name: "Guitar", notes: [] })];
    expect(() => normalizeDrums(fakeMidiResult(tracks), testMap)).toThrow(
      /no strong drum track/i
    );
  });

  it("throws when multiple strong tracks and no explicit index", () => {
    const tracks = [
      fakeTrack({
        name: "Drums",
        channel: 9,
        notes: [
          { midi: 36, velocity: 100, ticks: 0, durationTicks: 0 },
          { midi: 38, velocity: 100, ticks: 480, durationTicks: 0 },
          { midi: 42, velocity: 100, ticks: 960, durationTicks: 0 },
        ],
      }),
      fakeTrack({
        name: "Percussion",
        channel: 9,
        notes: [
          { midi: 36, velocity: 100, ticks: 0, durationTicks: 0 },
          { midi: 38, velocity: 100, ticks: 480, durationTicks: 0 },
          { midi: 42, velocity: 100, ticks: 960, durationTicks: 0 },
        ],
      }),
    ];
    expect(() => normalizeDrums(fakeMidiResult(tracks), testMap)).toThrow(
      /multiple strong drum tracks/i
    );
  });
});
