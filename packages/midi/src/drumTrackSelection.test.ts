import atlas from "@chdg/mappings/data/general-midi-drums.json" with { type: "json" };
import { describe, expect, it } from "vitest";
import type { MidiTrack } from "./readMidi.js";
import type { MidiDrumPieceMap } from "@chdg/mappings";
import {
  classifyDrumTracks,
  scoreDrumTrack,
  selectDrumTrack,
} from "./drumTrackSelection.js";

const testMap = atlas as MidiDrumPieceMap;

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
  it("scores channel 9 + drum-like notes >= 45", () => {
    const track = fakeTrack({
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

  it("does not disqualify 'Bass Drum' because the name has explicit drum context", () => {
    const track = fakeTrack({
      name: "Bass Drum",
      channel: 5,
      notes: [
        ...makeNotes(36, 4),
        ...makeNotes(38, 4),
        ...makeNotes(42, 4),
      ],
    });
    const { strong } = classifyDrumTracks([track], testMap);
    expect(strong).toEqual([0]);
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

  it("scores kick+snare+hihat as drum-like even without strong context", () => {
    const track = fakeTrack({
      notes: [
        ...makeNotes(36, 4),
        ...makeNotes(38, 4),
        ...makeNotes(42, 4),
      ],
    });
    expect(scoreDrumTrack(track, testMap)).toBeGreaterThanOrEqual(20);
  });
});

describe("classifyDrumTracks", () => {
  it("classifies channel 9 + drum-like notes as strong", () => {
    const tracks = [
      fakeTrack({
        channel: 9,
        notes: [
          ...makeNotes(36, 4),
          ...makeNotes(38, 4),
          ...makeNotes(42, 4),
        ],
      }),
    ];
    const { strong, weak } = classifyDrumTracks(tracks, testMap);
    expect(strong).toEqual([0]);
    expect(weak).toEqual([]);
  });

  it("classifies empty non-channel-9 drum-like tracks as weak, not strong", () => {
    const tracks = [
      fakeTrack({
        channel: 5,
        notes: [
          ...makeNotes(36, 4),
          ...makeNotes(38, 4),
          ...makeNotes(42, 4),
        ],
      }),
    ];
    const { strong, weak } = classifyDrumTracks(tracks, testMap);
    expect(strong).toEqual([]);
    expect(weak).toEqual([0]);
  });

  it("classifies named drum tracks on non-standard channels as strong", () => {
    const tracks = [
      fakeTrack({
        name: "Drums",
        channel: 5,
        notes: [
          ...makeNotes(36, 4),
          ...makeNotes(38, 4),
          ...makeNotes(42, 4),
        ],
      }),
    ];
    const { strong, weak } = classifyDrumTracks(tracks, testMap);
    expect(strong).toEqual([0]);
    expect(weak).toEqual([]);
  });

  it("does not classify named non-drum tracks as strong", () => {
    const tracks = [
      fakeTrack({
        name: "Lead Guitar",
        channel: 5,
        notes: [
          ...makeNotes(36, 4),
          ...makeNotes(38, 4),
          ...makeNotes(42, 4),
        ],
      }),
    ];
    const { strong, weak } = classifyDrumTracks(tracks, testMap);
    expect(strong).toEqual([]);
    expect(weak).toEqual([]);
  });

  it("does not classify generic names containing kit as strong", () => {
    const tracks = [
      fakeTrack({
        name: "Toolkit",
        channel: 5,
        notes: [
          ...makeNotes(36, 4),
          ...makeNotes(38, 4),
          ...makeNotes(42, 4),
        ],
      }),
    ];
    const { strong } = classifyDrumTracks(tracks, testMap);
    expect(strong).toEqual([]);
  });

  it("classifies the Eat My Dust-style candidates as one strong and two weak", () => {
    const tracks = Array.from({ length: 54 }, () => fakeTrack());
    tracks[10] = fakeTrack({
      channel: 5,
      notes: [
        ...makeNotes(36, 172),
        ...makeNotes(38, 172),
        ...makeNotes(42, 172),
      ],
    });
    tracks[28] = fakeTrack({
      channel: 5,
      notes: [
        ...makeNotes(36, 301),
        ...makeNotes(38, 301),
        ...makeNotes(42, 300),
      ],
    });
    tracks[53] = fakeTrack({
      channel: 9,
      notes: [
        ...makeNotes(36, 347),
        ...makeNotes(38, 215),
        ...makeNotes(42, 99),
        ...makeNotes(49, 232),
      ],
    });

    const { strong, weak } = classifyDrumTracks(tracks, testMap);
    expect(strong).toEqual([53]);
    expect(weak).toEqual([10, 28]);
  });

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

	it("does not use candidates or ignored percussion as strong track-selection evidence in Phase 17L", () => {
		const candidateOnly = fakeTrack({
			name: "Percussion",
			channel: 9,
			notes: [...makeNotes(44, 12), ...makeNotes(54, 12)],
		});

		expect(scoreDrumTrack(candidateOnly, testMap)).toBeLessThan(45);
		expect(classifyDrumTracks([candidateOnly], testMap).strong).toEqual([]);
	});
});


describe("selectDrumTrack", () => {
  it("selects explicit index", () => {
    const tracks = [fakeTrack({ name: "Drums", notes: makeNotes(36, 10) })];
    const result = selectDrumTrack(tracks, testMap, 0);
    expect(result).toEqual({ kind: "selected", trackIndex: 0 });
  });

  it("selects explicit weak index", () => {
    const tracks = [
      fakeTrack({
        channel: 5,
        notes: [
          ...makeNotes(36, 4),
          ...makeNotes(38, 4),
          ...makeNotes(42, 4),
        ],
      }),
    ];
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
