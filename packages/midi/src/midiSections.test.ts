import { describe, expect, it } from "vitest";
import { writeMidi, type MidiEvent } from "midi-file";
import { extractMidiMetaEvents } from "./readMidi.js";
import { extractSectionsFromMidiMetaEvents, type MidiMetaEvent } from "./midiSections.js";

function makeEvent(overrides: Partial<MidiMetaEvent>): MidiMetaEvent {
  return {
    tick: 0,
    type: "marker",
    text: "Intro",
    trackIndex: 0,
    ...overrides,
  };
}

function makeMidiBuffer(events: MidiEvent[]): Buffer {
  return Buffer.from(
    writeMidi({
      header: { format: 1, numTracks: 1, ticksPerBeat: 192 },
      tracks: [[...events, { deltaTime: 0, type: "endOfTrack" }]],
    }),
  );
}

describe("extractMidiMetaEvents", () => {
  it("reads marker, text, and cue events with ticks and track index", () => {
    const buffer = makeMidiBuffer([
      { deltaTime: 0, type: "marker", text: "Intro" },
      { deltaTime: 192, type: "text", text: "Verse 1" },
      { deltaTime: 192, type: "cuePoint", text: "Chorus" },
    ]);

    expect(extractMidiMetaEvents(buffer)).toEqual([
      { tick: 0, type: "marker", text: "Intro", trackIndex: 0 },
      { tick: 192, type: "text", text: "Verse 1", trackIndex: 0 },
      { tick: 384, type: "cue", text: "Chorus", trackIndex: 0 },
    ]);
  });
});

describe("extractSectionsFromMidiMetaEvents", () => {
  it("imports semantic marker names as sections", () => {
    expect(extractSectionsFromMidiMetaEvents([makeEvent({ text: "Intro" })])).toEqual([
      { tick: 0, name: "Intro" },
    ]);
  });

  it("strips section prefix", () => {
    expect(extractSectionsFromMidiMetaEvents([makeEvent({ tick: 6144, text: "section Chorus" })])).toEqual([
      { tick: 6144, name: "Chorus" },
    ]);
  });

  it("filters generated technical markers", () => {
    const events = [
      makeEvent({ text: "MEASURE_0" }),
      makeEvent({ text: "MEASURE_12" }),
      makeEvent({ text: "END_OF_VOICE" }),
      makeEvent({ text: "END" }),
      makeEvent({ text: "Start" }),
    ];

    expect(extractSectionsFromMidiMetaEvents(events)).toEqual([]);
  });

  it("deduplicates sections by normalized tick and name", () => {
    const events = [
      makeEvent({ tick: 0, text: "Verse 1" }),
      makeEvent({ tick: 0, text: "Verse 1" }),
      makeEvent({ tick: 0.9, text: "Verse 1" }),
    ];

    expect(extractSectionsFromMidiMetaEvents(events)).toEqual([{ tick: 0, name: "Verse 1" }]);
  });

  it("ignores non-semantic marker text unless explicitly prefixed", () => {
    const events = [makeEvent({ text: "Random Label" }), makeEvent({ text: "section Custom Label" })];

    expect(extractSectionsFromMidiMetaEvents(events)).toEqual([{ tick: 0, name: "Custom Label" }]);
  });

  it("creates no sections from demo-style marker lists", () => {
    const events = [
      makeEvent({ text: "MEASURE_0" }),
      makeEvent({ tick: 768, text: "MEASURE_1" }),
      makeEvent({ tick: 1536, text: "END_OF_VOICE" }),
    ];

    expect(extractSectionsFromMidiMetaEvents(events)).toEqual([]);
  });
});
