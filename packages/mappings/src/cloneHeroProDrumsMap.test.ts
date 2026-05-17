import { describe, expect, it } from "vitest";
import { mapHitToCloneHeroNote, type CloneHeroProDrumsMapping } from "./cloneHeroProDrumsMap.js";
import type { DrumHit, DrumPiece } from "@chdg/core";

const mapping: CloneHeroProDrumsMapping = {
  kick: { lane: "kick" },
  snare: { lane: "red" },
  hihat_closed: { lane: "yellow", cymbal: true },
  hihat_open: { lane: "yellow", cymbal: true },
  ride: { lane: "blue", cymbal: true },
  crash: { lane: "green", cymbal: true },
  tom_high: { lane: "yellow" },
  tom_mid: { lane: "blue" },
  tom_floor: { lane: "green" },
};

function makeHit(piece: DrumPiece, velocity = 80): DrumHit {
  return {
    tick: 0,
    piece,
    velocity,
    durationTicks: 0,
    source: { midiNote: 0, trackIndex: 0, trackName: "test", channel: 9 },
  };
}

describe("mapHitToCloneHeroNote", () => {
  it.each([
    ["hihat_closed", "yellow"],
    ["hihat_open", "yellow"],
    ["ride", "blue"],
    ["crash", "green"],
  ] as const)("maps %s to %s cymbal", (piece, lane) => {
    expect(mapHitToCloneHeroNote(makeHit(piece), mapping)).toMatchObject({
      lane,
      cymbal: true,
    });
  });

  it.each([
    ["tom_high", "yellow"],
    ["tom_mid", "blue"],
    ["tom_floor", "green"],
  ] as const)("maps %s to %s tom", (piece, lane) => {
    expect(mapHitToCloneHeroNote(makeHit(piece), mapping)).toMatchObject({
      lane,
      cymbal: undefined,
    });
  });

  it("applies default velocity thresholds", () => {
    const ghost = mapHitToCloneHeroNote(makeHit("snare", 45), mapping);
    const neutral = mapHitToCloneHeroNote(makeHit("snare", 80), mapping);
    const accent = mapHitToCloneHeroNote(makeHit("snare", 110), mapping);

    expect(ghost).toMatchObject({ ghost: true, accent: false });
    expect(neutral).toMatchObject({ ghost: false, accent: false });
    expect(accent).toMatchObject({ ghost: false, accent: true });
  });

  it("prevents overlapping thresholds from returning both ghost and accent", () => {
    const note = mapHitToCloneHeroNote(makeHit("snare", 100), mapping, {
      ghostVelocityMax: 110,
      accentVelocityMin: 90,
    });

    expect(note).toMatchObject({ ghost: false, accent: true });
  });
});
