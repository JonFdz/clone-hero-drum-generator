# Checklist Phase 05A: Pro Drums Dynamics and Open Hi-Hat Encoding

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/implementation/implementation-plan.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Read `docs/research/pro-drums-dynamics-and-open-hihat.md`.
- [x] Inspect relevant files.

## Implementation

- [x] Emit red accent as `N 34`.
- [x] Emit yellow accent as `N 35`.
- [x] Emit blue accent as `N 36`.
- [x] Emit green accent as `N 37`.
- [x] Emit red ghost as `N 40`.
- [x] Emit yellow ghost as `N 41`.
- [x] Emit blue ghost as `N 42`.
- [x] Emit green ghost as `N 43`.
- [x] Do not emit kick accent/ghost flags.
- [x] Preserve cymbal modifiers `N 66`, `N 67`, `N 68`.
- [x] Encode `hihat_open` as yellow cymbal + yellow accent.
- [x] Encode `hihat_closed` as yellow cymbal only.
- [x] Preserve accent-over-ghost conflict prevention.
- [x] Document exact encoding and open hi-hat convention.

## Validation

- [x] Chart writer tests cover accent flags.
- [x] Chart writer tests cover ghost flags.
- [x] Chart writer tests confirm no kick accent/ghost output.
- [x] Chart writer tests cover open hi-hat encoding.
- [x] Chart writer tests cover closed hi-hat encoding.
- [x] Mapping tests cover dynamics behavior.
- [ ] Generated chart remains loadable in Moonscraper if manually validated. (Not performed by implementation agent.)

## Completion

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] Docs updated if behavior changed.
- [x] No copyrighted MIDI/audio committed.
