import { describe, expect, it } from "vitest";
import { writeChart } from "./chartWriter.js";
import type { DrumChart } from "@chdg/core";

function makeChart(overrides: Partial<DrumChart> = {}): DrumChart {
  return {
    resolution: 192,
    tempos: [{ tick: 0, bpm: 120 }],
    timeSignatures: [{ tick: 0, numerator: 4, denominator: 4 }],
    sections: [],
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

  it("keeps an empty [Events] block when there are no sections", () => {
    const chart = makeChart();
    const output = writeChart(chart);
    expect(output).toContain(`[Events]\n{\n}\n`);
  });

  it("serializes one section as a global event", () => {
    const chart = makeChart({ sections: [{ tick: 0, name: "Intro" }] });
    const output = writeChart(chart);
    expect(output).toContain(`0 = E "section Intro"`);
  });

  it("serializes sections in deterministic tick and name order", () => {
    const chart = makeChart({
      sections: [
        { tick: 6144, name: "Verse 1" },
        { tick: 0, name: "Intro" },
        { tick: 6144, name: "Chorus" },
      ],
    });
    const output = writeChart(chart);
    expect(output.indexOf(`0 = E "section Intro"`)).toBeLessThan(
      output.indexOf(`6144 = E "section Chorus"`),
    );
    expect(output.indexOf(`6144 = E "section Chorus"`)).toBeLessThan(
      output.indexOf(`6144 = E "section Verse 1"`),
    );
  });

  it("deduplicates normalized section tick/name pairs", () => {
    const chart = makeChart({
      sections: [
        { tick: 0, name: "Intro" },
        { tick: 0.2, name: "Intro" },
      ],
    });
    const output = writeChart(chart);
    expect(output.match(/0 = E "section Intro"/g)).toHaveLength(1);
  });

  it("safely serializes section names with quotes and extra whitespace", () => {
    const chart = makeChart({ sections: [{ tick: 0, name: `  Verse "1"  ` }] });
    const output = writeChart(chart);
    expect(output).toContain(`0 = E "section Verse 1"`);
    expect(output).not.toContain(`Verse "1"`);
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

  it("orders SyncTrack events by tick with time signature before tempo at the same tick", () => {
    const output = writeChart(
      makeChart({
        tempos: [
          { tick: 960, bpm: 150 },
          { tick: 0, bpm: 120 },
        ],
        timeSignatures: [
          { tick: 960, numerator: 6, denominator: 8 },
          { tick: 0, numerator: 4, denominator: 4 },
        ],
      }),
    );
    const syncTrack = output.slice(
      output.indexOf("[SyncTrack]"),
      output.indexOf("[Events]"),
    );

    expect(syncTrack.indexOf("0 = TS 4 2")).toBeLessThan(
      syncTrack.indexOf("0 = B 120000"),
    );
    expect(syncTrack.indexOf("0 = B 120000")).toBeLessThan(
      syncTrack.indexOf("960 = TS 6 3"),
    );
    expect(syncTrack.indexOf("960 = TS 6 3")).toBeLessThan(
      syncTrack.indexOf("960 = B 150000"),
    );
  });

  it("writes default offset as zero", () => {
    const chart = makeChart();
    const output = writeChart(chart);
    expect(output).toContain("Offset = 0");
  });

  it.each([
    [0.9, "Offset = 0.9"],
    [1.2, "Offset = 1.2"],
  ] as const)("writes configured offset seconds: %s", (offsetSeconds, expected) => {
    const chart = makeChart({ offsetSeconds });
    const output = writeChart(chart);
    expect(output).toContain(expected);
  });

  it("does not shift notes or events when offset is configured", () => {
    const chart = makeChart({
      offsetSeconds: -0.25,
      sections: [{ tick: 480, name: "Verse" }],
      expertDrums: [{ tick: 960, lane: "red", length: 0 }],
    });
    const output = writeChart(chart);
    expect(output).toContain("Offset = -0.25");
    expect(output).toContain(`480 = E "section Verse"`);
    expect(output).toContain("960 = N 1 0");
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
