import type { DrumHit, TempoEvent, TimeSignatureEvent } from "@chdg/core";
export type MidiReadResult = { resolution: number; tempos: TempoEvent[]; timeSignatures: TimeSignatureEvent[]; hits: DrumHit[] };
export async function readMidi(_filePath: string): Promise<MidiReadResult> { throw new Error("readMidi is not implemented yet."); }
