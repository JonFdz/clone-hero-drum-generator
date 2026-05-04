export type DrumPiece = "kick" | "snare" | "hihat_closed" | "hihat_open" | "crash" | "ride" | "tom_high" | "tom_mid" | "tom_floor" | "unknown";
export type DrumHit = { tick: number; piece: DrumPiece; velocity: number; source?: { midiNote?: number; trackName?: string; channel?: number } };
export type CloneHeroDrumLane = "kick" | "red" | "yellow" | "blue" | "green";
export type CloneHeroDrumNote = { tick: number; lane: CloneHeroDrumLane; length: number; cymbal?: boolean; ghost?: boolean; accent?: boolean };
export type TempoEvent = { tick: number; bpm: number };
export type TimeSignatureEvent = { tick: number; numerator: number; denominator: number };
export type DrumChart = { resolution: number; tempos: TempoEvent[]; timeSignatures: TimeSignatureEvent[]; expertDrums: CloneHeroDrumNote[] };
