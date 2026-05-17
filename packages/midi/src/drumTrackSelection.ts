import type { DrumPiece } from "@chdg/core";
import type { MidiDrumPieceMap } from "@chdg/mappings";
import { mapMidiNoteToDrumPiece } from "@chdg/mappings";
import type { MidiTrack } from "./readMidi.js";

export const DISQUALIFYING_NAME_FRAGMENTS = [
  "guitar",
  "bass",
  "vocal",
  "voice",
  "keys",
  "piano",
  "recorder",
  "synth",
  "string",
];

export const STRONG_DRUM_NAME_FRAGMENTS = [
  "drum",
  "percussion",
  "perc",
  "cymbal",
  "snare",
  "kick",
];

function hasNameFragment(nameLower: string, fragments: string[]): boolean {
  return fragments.some((fragment) => nameLower.includes(fragment));
}

function hasDisqualifyingName(track: MidiTrack): boolean {
  const nameLower = track.name.toLowerCase();
  return (
    hasNameFragment(nameLower, DISQUALIFYING_NAME_FRAGMENTS) &&
    !hasNameFragment(nameLower, STRONG_DRUM_NAME_FRAGMENTS)
  );
}

function hasStrongDrumName(track: MidiTrack): boolean {
  return hasNameFragment(track.name.toLowerCase(), STRONG_DRUM_NAME_FRAGMENTS);
}

function hasStrongContextSignal(track: MidiTrack): boolean {
  return track.channel === 9 || hasStrongDrumName(track);
}

export function scoreDrumTrack(
  track: MidiTrack,
  drumPieceMap: MidiDrumPieceMap
): number {
  // Step 1: Disqualifying name check
  if (hasDisqualifyingName(track)) {
    return -1000;
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
  const hasHihat =
    uniquePieces.has("hihat_closed") || uniquePieces.has("hihat_open");
  const mappedPercentage =
    track.noteCount === 0 ? 0 : mappedCount / track.noteCount;
  const uniquePieceCount = uniquePieces.size;

  // Step 3: Score calculation
  let score = 0;

  // Positive signals
  if (track.channel === 9) score += 50;
  if (hasStrongDrumName(track)) score += 40;
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

export function classifyDrumTracks(
  tracks: MidiTrack[],
  drumPieceMap: MidiDrumPieceMap
): { strong: number[]; weak: number[] } {
  const scores = tracks.map((track, index) => ({
    index,
    score: scoreDrumTrack(track, drumPieceMap),
  }));

  const strong = scores
    .filter(
      (t) =>
        t.score >= 45 &&
        !hasDisqualifyingName(tracks[t.index]) &&
        hasStrongContextSignal(tracks[t.index])
    )
    .map((t) => t.index);

  const strongSet = new Set(strong);
  const weak = scores
    .filter((t) => t.score >= 20 && !strongSet.has(t.index))
    .map((t) => t.index);

  return { strong, weak };
}

export type DrumTrackSelectionResult =
  | { kind: "selected"; trackIndex: number }
  | { kind: "error"; message: string };

export function selectDrumTrack(
  tracks: MidiTrack[],
  drumPieceMap: MidiDrumPieceMap,
  explicitTrackIndex?: number
): DrumTrackSelectionResult {
  if (explicitTrackIndex !== undefined) {
    if (explicitTrackIndex >= 0 && explicitTrackIndex < tracks.length) {
      return { kind: "selected", trackIndex: explicitTrackIndex };
    }
    return {
      kind: "error",
      message: `Track index ${explicitTrackIndex} is out of range. MIDI file has ${tracks.length} track(s).`,
    };
  }

  const { strong } = classifyDrumTracks(tracks, drumPieceMap);

  if (strong.length === 1) {
    return { kind: "selected", trackIndex: strong[0] };
  }

  if (strong.length === 0) {
    return {
      kind: "error",
      message:
        "No strong drum track detected. Pass --track <index> to select a track explicitly.",
    };
  }

  return {
    kind: "error",
    message: `Multiple strong drum tracks detected: [${strong.join(", ")}]. Pass --track <index> to select one explicitly.`,
  };
}
