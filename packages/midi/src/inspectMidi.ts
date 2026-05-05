import type { DrumPiece, TempoEvent, TimeSignatureEvent } from "@chdg/core";
import type { MidiDrumPieceMap } from "@chdg/mappings";
import { mapMidiNoteToDrumPiece } from "@chdg/mappings";
import type { MidiNote } from "./readMidi.js";
import { readMidi } from "./readMidi.js";
import { classifyDrumTracks } from "./drumTrackSelection.js";

export type NoteStats = {
  count: number;
  avgVelocity: number;
  minVelocity: number;
  maxVelocity: number;
  guessedPiece: DrumPiece;
};

export type TrackInfo = {
  index: number;
  name: string;
  channel?: number;
  noteCount: number;
  noteStats: Record<number, NoteStats>;
  unknownNotes: number[];
};

export type MidiInspection = {
  filePath: string;
  resolution: number;
  tracks: TrackInfo[];
  strongDrumTracks: number[];
  weakDrumTracks: number[];
  tempos: TempoEvent[];
  timeSignatures: TimeSignatureEvent[];
  noteStats: Record<number, NoteStats>;
  unknownNotes: number[];
};

export type InspectMidiOptions = {
  trackIndex?: number;
  drumsOnly?: boolean;
};

export function computeNoteStats(
  notes: MidiNote[],
  drumPieceMap: MidiDrumPieceMap
): { noteStats: Record<number, NoteStats>; unknownNotes: number[] } {
  const statsMap = new Map<number, { count: number; velocities: number[] }>();

  for (const note of notes) {
    const existing = statsMap.get(note.midi);
    if (existing) {
      existing.count++;
      existing.velocities.push(note.velocity);
    } else {
      statsMap.set(note.midi, {
        count: 1,
        velocities: [note.velocity],
      });
    }
  }

  const noteStats: Record<number, NoteStats> = {};
  const unknownNotes: number[] = [];

  for (const [noteNumber, data] of statsMap) {
    const velocities = data.velocities;
    const sum = velocities.reduce((a, b) => a + b, 0);
    const avgVelocity = sum / velocities.length;
    const minVelocity = Math.min(...velocities);
    const maxVelocity = Math.max(...velocities);
    const guessedPiece = mapMidiNoteToDrumPiece(noteNumber, drumPieceMap);

    noteStats[noteNumber] = {
      count: data.count,
      avgVelocity,
      minVelocity,
      maxVelocity,
      guessedPiece,
    };

    if (guessedPiece === "unknown") {
      unknownNotes.push(noteNumber);
    }
  }

  unknownNotes.sort((a, b) => a - b);

  return { noteStats, unknownNotes };
}

export async function inspectMidi(
  filePath: string,
  drumPieceMap: MidiDrumPieceMap,
  options?: InspectMidiOptions
): Promise<MidiInspection> {
  const result = await readMidi(filePath);

  const { strong: strongDrumTracks, weak: weakDrumTracks } = classifyDrumTracks(
    result.tracks,
    drumPieceMap
  );

  const allTracks = result.tracks.map((track, index) => ({ ...track, index }));

  let targetTracks = allTracks;

  if (options?.trackIndex !== undefined) {
    if (options.trackIndex < 0 || options.trackIndex >= allTracks.length) {
      throw new Error(
        `Track index ${options.trackIndex} is out of range. MIDI file has ${allTracks.length} track(s).`
      );
    }
    targetTracks = [allTracks[options.trackIndex]];
  } else if (options?.drumsOnly) {
    targetTracks = allTracks.filter((track) =>
      strongDrumTracks.includes(track.index)
    );
  }

  const tracks: TrackInfo[] = targetTracks.map((track) => {
    const { noteStats, unknownNotes } = computeNoteStats(track.notes, drumPieceMap);
    return {
      index: track.index,
      name: track.name,
      channel: track.channel,
      noteCount: track.noteCount,
      noteStats,
      unknownNotes,
    };
  });

  const allNotes = targetTracks.flatMap((t) => t.notes);
  const { noteStats, unknownNotes } = computeNoteStats(allNotes, drumPieceMap);

  return {
    filePath,
    resolution: result.resolution,
    tracks,
    strongDrumTracks,
    weakDrumTracks,
    tempos: result.tempos,
    timeSignatures: result.timeSignatures,
    noteStats,
    unknownNotes,
  };
}
