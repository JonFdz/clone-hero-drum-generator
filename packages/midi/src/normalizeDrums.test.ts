import { describe, expect, it } from "vitest";
import type { MidiReadResult, MidiTrack } from "./readMidi.js";
import atlas from "@chdg/mappings/data/general-midi-drums.json" with { type: "json" };
import type { MidiDrumPieceMap } from "@chdg/mappings";
import { MIDI_DRUM_NOTE_ATLAS_VERSION } from "@chdg/mappings";
import { normalizeDrums } from "./normalizeDrums.js";

const testMap = atlas as MidiDrumPieceMap;

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
    metaEvents: [],
    sections: [],
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
    const midiResult = fakeMidiResult(tracks);
    const result = normalizeDrums(midiResult, testMap);
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
    expect(result.resolution).toBe(midiResult.resolution);
    expect(result.tempos).toEqual(midiResult.tempos);
    expect(result.timeSignatures).toEqual(midiResult.timeSignatures);
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

  it("includes MIDI resolution, tempos and time signatures", () => {
    const tracks = [
      fakeTrack({
        name: "Drums",
        channel: 9,
        notes: [{ midi: 36, velocity: 100, ticks: 0, durationTicks: 0 }],
      }),
    ];
    const midiResult = fakeMidiResult(tracks);
    midiResult.resolution = 480;
    midiResult.tempos = [{ tick: 0, bpm: 140 }];
    midiResult.timeSignatures = [{ tick: 0, numerator: 3, denominator: 4 }];
    const result = normalizeDrums(midiResult, testMap);
    expect(result.resolution).toBe(480);
    expect(result.tempos).toEqual([{ tick: 0, bpm: 140 }]);
    expect(result.timeSignatures).toEqual([{ tick: 0, numerator: 3, denominator: 4 }]);
  });

  it("reports true unknown notes without creating hits", () => {
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
    expect(result.hits).toHaveLength(1);
    expect(result.unknownNotes).toEqual([99]);
    expect(result.mappingCoverage).toMatchObject({
      atlasVersion: MIDI_DRUM_NOTE_ATLAS_VERSION,
      mappedEventCount: 1,
      unknownEventCount: 2,
      unknownSourceCount: 1,
    });
  });


  it("skips candidates and ignored known percussion by default while recording coverage", () => {
    const tracks = [
      fakeTrack({
        name: "Drums",
        channel: 9,
        notes: [
          { midi: 36, velocity: 100, ticks: 0, durationTicks: 0 },
          { midi: 44, velocity: 100, ticks: 120, durationTicks: 0 },
          { midi: 54, velocity: 100, ticks: 240, durationTicks: 0 },
          { midi: 56, velocity: 100, ticks: 360, durationTicks: 0 },
        ],
      }),
    ];
    const result = normalizeDrums(fakeMidiResult(tracks), testMap, { trackIndex: 0 });
    expect(result.hits.map((hit) => "midiNote" in hit.source ? hit.source.midiNote : undefined)).toEqual([36]);
    expect(result.candidateNotes).toEqual([44, 56]);
    expect(result.ignoredNotes).toEqual([54]);
    expect(result.mappingCoverage).toMatchObject({
      mappedEventCount: 1,
      candidateEventCount: 2,
      ignoredEventCount: 1,
      candidateSourceCount: 2,
      ignoredSourceCount: 1,
    });
    expect(result.mappingSources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "midi:44", action: "candidate", suggestedPiece: "hihat_closed" }),
        expect.objectContaining({ key: "midi:54", action: "ignore", noteName: "Tambourine" }),
        expect.objectContaining({ key: "midi:56", action: "candidate", suggestedPiece: undefined }),
      ]),
    );
  });

  it("lets overrides map candidate, ignored, and unknown notes or ignore mapped notes", () => {
    const tracks = [
      fakeTrack({
        name: "Drums",
        channel: 9,
        notes: [
          { midi: 36, velocity: 100, ticks: 0, durationTicks: 0 },
          { midi: 44, velocity: 100, ticks: 120, durationTicks: 0 },
          { midi: 54, velocity: 100, ticks: 240, durationTicks: 0 },
          { midi: 99, velocity: 100, ticks: 360, durationTicks: 0 },
        ],
      }),
    ];
    const result = normalizeDrums(fakeMidiResult(tracks), testMap, {
      trackIndex: 0,
      mappingOverrides: {
        "midi:36": { target: { kind: "ignore" } },
        "midi:44": { target: { kind: "piece", piece: "hihat_closed" } },
        "midi:54": { target: { kind: "piece", piece: "snare" } },
        "midi:99": { target: { kind: "piece", piece: "crash" } },
      },
    });
    expect(result.hits.map((hit) => hit.piece)).toEqual(["hihat_closed", "snare", "crash"]);
    expect(result.unknownNotes).toEqual([]);
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
