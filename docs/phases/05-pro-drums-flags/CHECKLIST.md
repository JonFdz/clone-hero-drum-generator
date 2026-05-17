# Checklist Phase 05: Pro Drums Flags

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/implementation/implementation-plan.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Read OpenSpec Phase 05 artifacts.
- [x] Inspect relevant files.

## Implementation

- [x] Encode cymbal flags for yellow/blue/green.
  - yellow cymbal -> `N 66`
  - blue cymbal -> `N 67`
  - green cymbal -> `N 68`
- [x] Preserve base lane notes for cymbals.
- [x] Preserve tom/cymbal distinction from mapping data.
- [x] Prevent ghost and accent conflicts.
- [x] Keep velocity thresholds configurable in code.
- [x] Do not emit guessed ghost/accent chart constants.
- [x] Document exact chart encoding.

## Deferred

- [ ] Ghost/accent chart encoding is deferred until constants are verified.
- [ ] Manual Moonscraper validation is not marked complete unless performed or explicitly provided by Jon.

## Validation

- [x] Chart writer tests cover yellow/blue/green cymbal modifiers.
- [x] Chart writer tests cover toms without cymbal modifiers.
- [x] Chart writer tests cover invalid kick/red cymbal flags.
- [x] Mapping tests cover cymbal intent and tom intent.
- [x] Mapping tests cover velocity thresholds and overlap conflict prevention.
- [ ] Moonscraper displays cymbals as cymbals.
- [x] Local demo generation produced `notes.chart`, `song.ini`, and `song.ogg`.
- [x] Local demo chart contains `N 66` and `N 68`, and does not contain `N 5`.
- [ ] Generated chart remains loadable in manual review.
- [x] Threshold behavior can be adjusted in code.

## Completion

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] Docs updated if behavior changed.
- [x] No copyrighted MIDI/audio committed.
