import type { CloneHeroDrumLane, CloneHeroDrumNote, DrumHit, DrumPiece } from "@chdg/core";
export type CloneHeroProDrumsMapping = Partial<Record<DrumPiece, { lane: CloneHeroDrumLane; cymbal?: boolean }>>;
export type DynamicsOptions = { ghostVelocityMax: number; accentVelocityMin: number };
export function mapHitToCloneHeroNote(hit: DrumHit, mapping: CloneHeroProDrumsMapping, dynamics: DynamicsOptions = { ghostVelocityMax: 45, accentVelocityMin: 110 }): CloneHeroDrumNote | null { const target = mapping[hit.piece]; if (!target) return null; return { tick: hit.tick, lane: target.lane, length: 0, cymbal: target.cymbal, ghost: hit.velocity <= dynamics.ghostVelocityMax, accent: hit.velocity >= dynamics.accentVelocityMin }; }
