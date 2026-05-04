export function bpmToChartValue(bpm: number): number { return Math.round(bpm * 1000); }
export function beatsToTicks(beats: number, resolution: number): number { return Math.round(beats * resolution); }
