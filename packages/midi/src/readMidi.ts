import { readFile } from "node:fs/promises";
// @tonejs/midi ships CJS/UMD builds that Node ESM can't resolve named exports from.
// Import the dist ESM build directly where named exports work.
import { Midi } from "@tonejs/midi/dist/Midi.js";
import type { SongSection, TempoEvent, TimeSignatureEvent } from "@chdg/core";
import { parseMidi } from "midi-file";
import type { MidiEvent } from "midi-file";
import { extractSectionsFromMidiMetaEvents, type MidiMetaEvent, type MidiMetaEventType } from "./midiSections.js";

export type MidiNote = {
  midi: number;
  velocity: number;
  ticks: number;
  durationTicks: number;
};

export type MidiTrack = {
  name: string;
  channel: number;
  notes: MidiNote[];
  noteCount: number;
};

export type MidiReadResult = {
  resolution: number;
  tempos: TempoEvent[];
  timeSignatures: TimeSignatureEvent[];
  tracks: MidiTrack[];
  metaEvents: MidiMetaEvent[];
  sections: SongSection[];
};

function midiMetaEventType(event: MidiEvent): MidiMetaEventType | null {
  if (event.type === "marker") return "marker";
  if (event.type === "text") return "text";
  if (event.type === "cuePoint") return "cue";
  return null;
}

function hasText(event: MidiEvent): event is MidiEvent & { text: string } {
  return "text" in event && typeof event.text === "string";
}

export function extractMidiMetaEvents(buffer: Buffer): MidiMetaEvent[] {
  const parsed = parseMidi(buffer);
  const metaEvents: MidiMetaEvent[] = [];

  parsed.tracks.forEach((track, trackIndex) => {
    let tick = 0;
    for (const event of track) {
      tick += event.deltaTime;
      const type = midiMetaEventType(event);
      if (type === null) {
        continue;
      }
      if (hasText(event)) {
        metaEvents.push({ tick, type, text: event.text, trackIndex });
      }
    }
  });

  return metaEvents;
}

export async function readMidi(filePath: string): Promise<MidiReadResult> {
  const buffer = await readFile(filePath);
  const midi = new Midi(buffer);

  const resolution = midi.header.ppq;

  // Deduplicate by tick — some MIDI files repeat header events across tracks
  const seenTempos = new Set<number>();
  const tempos: TempoEvent[] = [];
  for (const t of midi.header.tempos) {
    if (!seenTempos.has(t.ticks)) {
      seenTempos.add(t.ticks);
      tempos.push({ tick: t.ticks, bpm: t.bpm });
    }
  }

  const seenTimeSigs = new Set<number>();
  const timeSignatures: TimeSignatureEvent[] = [];
  for (const ts of midi.header.timeSignatures) {
    if (!seenTimeSigs.has(ts.ticks)) {
      seenTimeSigs.add(ts.ticks);
      timeSignatures.push({
        tick: ts.ticks,
        numerator: ts.timeSignature[0] ?? 4,
        denominator: ts.timeSignature[1] ?? 4,
      });
    }
  }

  const tracks: MidiTrack[] = midi.tracks.map((track) => ({
    name: track.name,
    channel: track.channel,
    notes: track.notes.map((note) => ({
      midi: note.midi,
      // @tonejs/midi normalizes velocity to 0-1; convert back to MIDI 0-127
      velocity: Math.round(note.velocity * 127),
      ticks: note.ticks,
      durationTicks: note.durationTicks,
    })),
    noteCount: track.notes.length,
  }));

  const metaEvents = extractMidiMetaEvents(buffer);
  const sections = extractSectionsFromMidiMetaEvents(metaEvents);

  return {
    resolution,
    tempos,
    timeSignatures,
    tracks,
    metaEvents,
    sections,
  };
}
