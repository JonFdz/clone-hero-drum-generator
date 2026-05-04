import { readFile } from "node:fs/promises";
// @tonejs/midi ships CJS/UMD builds that Node ESM can't resolve named exports from.
// Import the dist ESM build directly where named exports work.
import { Midi } from "@tonejs/midi/dist/Midi.js";
import type { TempoEvent, TimeSignatureEvent } from "@chdg/core";

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
};

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

  return {
    resolution,
    tempos,
    timeSignatures,
    tracks,
  };
}
