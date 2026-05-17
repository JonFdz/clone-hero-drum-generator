import type { CloneHeroDrumLane, CloneHeroDrumNote, DrumHit, DrumPiece } from "@chdg/core";

export type CloneHeroProDrumsMapping = Partial<Record<DrumPiece, { lane: CloneHeroDrumLane; cymbal?: boolean }>>;
export type DynamicsOptions = { ghostVelocityMax: number; accentVelocityMin: number };

const DEFAULT_DYNAMICS: DynamicsOptions = { ghostVelocityMax: 45, accentVelocityMin: 110 };

export function mapHitToCloneHeroNote(
  hit: DrumHit,
  mapping: CloneHeroProDrumsMapping,
  dynamics: DynamicsOptions = DEFAULT_DYNAMICS,
): CloneHeroDrumNote | null {
  const target = mapping[hit.piece];
  if (!target) return null;

  const forceOpenHihatAccent = hit.piece === "hihat_open";
  const accent = forceOpenHihatAccent || hit.velocity >= dynamics.accentVelocityMin;
  const ghost = !accent && hit.velocity <= dynamics.ghostVelocityMax;

  return {
    tick: hit.tick,
    lane: target.lane,
    length: 0,
    cymbal: target.cymbal,
    ghost,
    accent,
  };
}
