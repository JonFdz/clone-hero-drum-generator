import type { DrumChart, DrumHit } from "./types.js";
export type GenerateChartInput = { resolution: number; hits: DrumHit[] };
export function createEmptyDrumChart(resolution = 192): DrumChart { return { resolution, tempos: [{ tick: 0, bpm: 120 }], timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }], expertDrums: [] }; }
