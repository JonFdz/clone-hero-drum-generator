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

  it.each([
    ["red", 1, 34],
    ["yellow", 2, 35],
    ["blue", 3, 36],
    ["green", 4, 37],
  ] as const)("serializes %s accent as base N %i and modifier N %i", (lane, base, modifier) => {
    const chart = makeChart({
      expertDrums: [{ tick: 0, lane, length: 0, accent: true }],
    });
    const output = writeChart(chart);
    expect(output).toContain(`0 = N ${base} 0`);
    expect(output).toContain(`0 = N ${modifier} 0`);
  });

  it.each([
    ["red", 1, 40],
    ["yellow", 2, 41],
    ["blue", 3, 42],
    ["green", 4, 43],
  ] as const)("serializes %s ghost as base N %i and modifier N %i", (lane, base, modifier) => {
    const chart = makeChart({
      expertDrums: [{ tick: 0, lane, length: 0, ghost: true }],
    });
    const output = writeChart(chart);
    expect(output).toContain(`0 = N ${base} 0`);
    expect(output).toContain(`0 = N ${modifier} 0`);
  });

  it("does not serialize accent or ghost modifiers for kick", () => {
    const chart = makeChart({
      expertDrums: [
        { tick: 0, lane: "kick", length: 0, accent: true },
        { tick: 480, lane: "kick", length: 0, ghost: true },
      ],
    });
    const output = writeChart(chart);
    expect(output).toContain("0 = N 0 0");
    expect(output).toContain("480 = N 0 0");
    for (const modifier of [34, 35, 36, 37, 40, 41, 42, 43]) {
      expect(output).not.toContain(`N ${modifier}`);
    }
  });

  it("serializes accent instead of ghost when both are set", () => {
    const chart = makeChart({
      expertDrums: [{ tick: 0, lane: "red", length: 0, accent: true, ghost: true }],
    });
    const output = writeChart(chart);
    expect(output).toContain("0 = N 1 0");
    expect(output).toContain("0 = N 34 0");
    expect(output).not.toContain("N 40");
  });

  it("serializes open hi-hat style notes as yellow base, yellow cymbal, and yellow accent", () => {
    const chart = makeChart({
      expertDrums: [{ tick: 0, lane: "yellow", length: 0, cymbal: true, accent: true }],
    });
    const output = writeChart(chart);
    expect(output).toContain("0 = N 2 0");
    expect(output).toContain("0 = N 66 0");
    expect(output).toContain("0 = N 35 0");
  });
});
