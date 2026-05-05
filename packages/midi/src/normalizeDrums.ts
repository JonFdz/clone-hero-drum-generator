import type { DrumHit } from "@chdg/core";
import type { MidiDrumPieceMap } from "@chdg/mappings";
import { mapMidiNoteToDrumPiece } from "@chdg/mappings";
import type { MidiReadResult } from "./readMidi.js";
import { readMidi } from "./readMidi.js";
import { selectDrumTrack } from "./drumTrackSelection.js";

export type DrumNormalizationResult = {
  hits: DrumHit[];
  unknownNotes: number[];
  track: { index: number; name: string; channel: number; noteCount: number };
};

export type NormalizeDrumsOptions = {
  trackIndex?: number;
};

export function normalizeDrums(
  midiResult: MidiReadResult,
  drumPieceMap: MidiDrumPieceMap,
  options?: NormalizeDrumsOptions
): DrumNormalizationResult {
  const selection = selectDrumTrack(
    midiResult.tracks,
    drumPieceMap,
    options?.trackIndex
  );

  if (selection.kind === "error") {
    throw new Error(selection.message);
  }

  const trackIndex = selection.trackIndex;
  const track = midiResult.tracks[trackIndex];

  const hits: DrumHit[] = [];
  const unknownSet = new Set<number>();

  for (const note of track.notes) {
    const piece = mapMidiNoteToDrumPiece(note.midi, drumPieceMap);
    hits.push({
      tick: note.ticks,
      piece,
      velocity: note.velocity,
      durationTicks: note.durationTicks,
      source: {
        midiNote: note.midi,
        trackIndex,
        trackName: track.name,
        channel: track.channel,
      },
    });

    if (piece === "unknown") {
      unknownSet.add(note.midi);
    }
  }

  const unknownNotes = Array.from(unknownSet).sort((a, b) => a - b);

  return {
    hits,
    unknownNotes,
    track: {
      index: trackIndex,
      name: track.name,
      channel: track.channel,
      noteCount: track.noteCount,
    },
  };
}

export async function normalizeDrumsFromFile(
  filePath: string,
  drumPieceMap: MidiDrumPieceMap,
  options?: NormalizeDrumsOptions
): Promise<DrumNormalizationResult> {
  const result = await readMidi(filePath);
  return normalizeDrums(result, drumPieceMap, options);
}
