export type DrumPiece = "kick" | "snare" | "hihat_closed" | "hihat_open" | "crash" | "ride" | "tom_high" | "tom_mid" | "tom_floor" | "unknown";
export type MidiDrumHitSource = { midiNote: number; trackIndex: number; trackName: string; channel: number };
export type GpifDrumHitSource = {
  kind: "gpif";
  trackIndex: number;
  trackName?: string;
  articulationKey?: string;
  rawArticulation?: string;
  noteName?: string;
  inputMidiNumbers?: number[];
  outputMidiNumber?: number;
  resolvedVia?: string;
  measureIndex?: number;
  beatIndex?: number;
  noteIndex?: number;
};
export type DrumHit = {
  tick: number;
  piece: DrumPiece;
  velocity: number;
  durationTicks: number;
  source: MidiDrumHitSource | GpifDrumHitSource;
};
export type CloneHeroDrumLane = "kick" | "red" | "yellow" | "blue" | "green";
export type CloneHeroDrumNote = { tick: number; lane: CloneHeroDrumLane; length: number; cymbal?: boolean; ghost?: boolean; accent?: boolean };
export type TempoEvent = { tick: number; bpm: number };
export type TimeSignatureEvent = { tick: number; numerator: number; denominator: number };
export type SongSection = { tick: number; name: string };
export type DrumChart = { resolution: number; offsetSeconds?: number; tempos: TempoEvent[]; timeSignatures: TimeSignatureEvent[]; sections: SongSection[]; expertDrums: CloneHeroDrumNote[] };
