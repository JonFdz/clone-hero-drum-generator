export type MidiInspection = { filePath: string; noteNumbers: number[] };
export async function inspectMidi(filePath: string): Promise<MidiInspection> { return { filePath, noteNumbers: [] }; }
