import type { DrumPiece, TempoEvent, TimeSignatureEvent } from "@chdg/core";
import type { MidiDrumPieceMap } from "@chdg/mappings";
import { mapMidiNoteToDrumPiece } from "@chdg/mappings";
import type { MidiNote, MidiTrack } from "./readMidi.js";
import { readMidi } from "./readMidi.js";

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

function computeNoteStats(
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

const DISQUALIFYING_NAME_FRAGMENTS = [
  "guitar",
  "bass",
  "vocal",
  "keys",
  "piano",
  "recorder",
  "synth",
  "string",
];

function scoreDrumTrack(track: MidiTrack, drumPieceMap: MidiDrumPieceMap): number {
  const nameLower = track.name.toLowerCase();

  // Step 1: Disqualifying name check
  for (const fragment of DISQUALIFYING_NAME_FRAGMENTS) {
    if (nameLower.includes(fragment)) {
      return -1000;
    }
  }

  // Step 2: Precompute track drum pieces
  const uniquePieces = new Set<DrumPiece>();
  let mappedCount = 0;

  for (const note of track.notes) {
    const piece = mapMidiNoteToDrumPiece(note.midi, drumPieceMap);
    if (piece !== "unknown") {
      uniquePieces.add(piece);
      mappedCount++;
    }
  }

  const hasKick = uniquePieces.has("kick");
  const hasSnare = uniquePieces.has("snare");
  const hasHihat = uniquePieces.has("hihat_closed") || uniquePieces.has("hihat_open");
  const mappedPercentage = track.noteCount === 0 ? 0 : mappedCount / track.noteCount;
  const uniquePieceCount = uniquePieces.size;

  // Step 3: Score calculation
  let score = 0;

  // Positive signals
  if (track.channel === 9) score += 50;
  if (nameLower.includes("drum") || nameLower.includes("drums")) score += 40;
  if (hasKick && hasSnare && hasHihat) score += 30;
  if (uniquePieceCount >= 5) score += 20;
  else if (uniquePieceCount >= 3) score += 10;
  if (hasKick) score += 10;
  if (hasSnare) score += 10;
  if (hasHihat) score += 5;
  if (mappedPercentage >= 0.8) score += 10;
  else if (mappedPercentage >= 0.5) score += 5;
  if (track.noteCount >= 10) score += 5;

  // Negative signals
  if (!hasKick && !hasSnare) score -= 40;
  if (mappedPercentage < 0.3) score -= 25;
  if (track.noteCount < 5) score -= 30;
  if (uniquePieceCount === 1) score -= 20;
  else if (uniquePieceCount === 2) score -= 10;

  return score;
}

export async function inspectMidi(
  filePath: string,
  drumPieceMap: MidiDrumPieceMap,
  options?: InspectMidiOptions
): Promise<MidiInspection> {
  const result = await readMidi(filePath);

  const allTracks = result.tracks.map((track, index) => ({ ...track, index }));

  const trackScores = allTracks.map((track) => ({
    index: track.index,
    score: scoreDrumTrack(track, drumPieceMap),
  }));

  const strongDrumTracks = trackScores
    .filter((t) => t.score >= 45)
    .map((t) => t.index);

  const weakDrumTracks = trackScores
    .filter((t) => t.score >= 20 && t.score < 45)
    .map((t) => t.index);

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
