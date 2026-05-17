import { describe, expect, it } from "vitest";
import { writeChart } from "./chartWriter.js";
import type { DrumChart } from "@chdg/core";

function makeChart(overrides: Partial<DrumChart> = {}): DrumChart {
  return {
    resolution: 192,
    tempos: [{ tick: 0, bpm: 120 }],
    timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
    expertDrums: [],
    ...overrides,
  };
}

describe("writeChart", () => {
  it("emits [ExpertDrums] section", () => {
    const chart = makeChart();
    const output = writeChart(chart);
    expect(output).toContain("[ExpertDrums]");
  });

  it("serializes kick as N 0", () => {
    const chart = makeChart({
      expertDrums: [{ tick: 0, lane: "kick", length: 0 }],
    });
    const output = writeChart(chart);
    expect(output).toContain("0 = N 0 0");
  });

  it("serializes red as N 1", () => {
    const chart = makeChart({
      expertDrums: [{ tick: 480, lane: "red", length: 0 }],
    });
    const output = writeChart(chart);
    expect(output).toContain("480 = N 1 0");
  });

  it("serializes yellow as N 2", () => {
    const chart = makeChart({
      expertDrums: [{ tick: 960, lane: "yellow", length: 0 }],
    });
    const output = writeChart(chart);
    expect(output).toContain("960 = N 2 0");
  });

  it("serializes blue as N 3", () => {
    const chart = makeChart({
      expertDrums: [{ tick: 1440, lane: "blue", length: 0 }],
    });
    const output = writeChart(chart);
    expect(output).toContain("1440 = N 3 0");
  });

  it("serializes green as N 4", () => {
    const chart = makeChart({
      expertDrums: [{ tick: 1920, lane: "green", length: 0 }],
    });
    const output = writeChart(chart);
    expect(output).toContain("1920 = N 4 0");
  });

  it("does not serialize green as N 5", () => {
    const chart = makeChart({
      expertDrums: [{ tick: 0, lane: "green", length: 0 }],
    });
    const output = writeChart(chart);
    expect(output).not.toContain("N 5");
  });

  it("writes BPM as BPM * 1000", () => {
    const chart = makeChart({
      tempos: [{ tick: 0, bpm: 195 }],
    });
    const output = writeChart(chart);
    expect(output).toContain("0 = B 195000");
  });

  it("serializes yellow cymbal as base N 2 and modifier N 66", () => {
    const chart = makeChart({
      expertDrums: [{ tick: 0, lane: "yellow", length: 0, cymbal: true }],
    });
    const output = writeChart(chart);
    expect(output).toContain("0 = N 2 0");
    expect(output).toContain("0 = N 66 0");
  });

  it("serializes blue cymbal as base N 3 and modifier N 67", () => {
    const chart = makeChart({
      expertDrums: [{ tick: 480, lane: "blue", length: 0, cymbal: true }],
    });
    const output = writeChart(chart);
    expect(output).toContain("480 = N 3 0");
    expect(output).toContain("480 = N 67 0");
  });

  it("serializes green cymbal as base N 4 and modifier N 68", () => {
    const chart = makeChart({
      expertDrums: [{ tick: 960, lane: "green", length: 0, cymbal: true }],
    });
    const output = writeChart(chart);
    expect(output).toContain("960 = N 4 0");
    expect(output).toContain("960 = N 68 0");
  });

  it("does not serialize cymbal modifiers for tom lanes without cymbal flags", () => {
    const chart = makeChart({
      expertDrums: [
        { tick: 0, lane: "yellow", length: 0 },
        { tick: 480, lane: "blue", length: 0 },
        { tick: 960, lane: "green", length: 0 },
      ],
    });
    const output = writeChart(chart);
    expect(output).toContain("0 = N 2 0");
    expect(output).toContain("480 = N 3 0");
    expect(output).toContain("960 = N 4 0");
    expect(output).not.toContain("N 66");
    expect(output).not.toContain("N 67");
    expect(output).not.toContain("N 68");
  });

  it("does not serialize cymbal modifiers for kick or red even when cymbal is set", () => {
    const chart = makeChart({
      expertDrums: [
        { tick: 0, lane: "kick", length: 0, cymbal: true },
        { tick: 480, lane: "red", length: 0, cymbal: true },
      ],
    });
    const output = writeChart(chart);
    expect(output).toContain("0 = N 0 0");
    expect(output).toContain("480 = N 1 0");
    expect(output).not.toContain("N 66");
    expect(output).not.toContain("N 67");
    expect(output).not.toContain("N 68");
  });

  it("does not write ghost or accent flags even when notes have them set", () => {
    const chart = makeChart({
      expertDrums: [
        { tick: 0, lane: "red", length: 0, ghost: true },
        { tick: 480, lane: "red", length: 0, accent: true },
      ],
    });
    const output = writeChart(chart);
    expect(output).toContain("0 = N 1 0");
    expect(output).toContain("480 = N 1 0");
    expect(output).not.toContain("N 40");
    expect(output).not.toContain("N 66");
    expect(output).not.toContain("N 67");
    expect(output).not.toContain("N 68");
  });
});
