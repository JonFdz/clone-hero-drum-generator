# Checklist Phase 05A: Pro Drums Dynamics and Open Hi-Hat Encoding

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/implementation/implementation-plan.md`.
- [ ] Read this phase PRD.
- [ ] Read this phase ADR.
- [ ] Read `docs/research/pro-drums-dynamics-and-open-hihat.md`.
- [ ] Inspect relevant files.

## Implementation

- [ ] Emit red accent as `N 34`.
- [ ] Emit yellow accent as `N 35`.
- [ ] Emit blue accent as `N 36`.
- [ ] Emit green accent as `N 37`.
- [ ] Emit red ghost as `N 40`.
- [ ] Emit yellow ghost as `N 41`.
- [ ] Emit blue ghost as `N 42`.
- [ ] Emit green ghost as `N 43`.
- [ ] Do not emit kick accent/ghost flags.
- [ ] Preserve cymbal modifiers `N 66`, `N 67`, `N 68`.
- [ ] Encode `hihat_open` as yellow cymbal + yellow accent.
- [ ] Encode `hihat_closed` as yellow cymbal only.
- [ ] Preserve accent-over-ghost conflict prevention.
- [ ] Document exact encoding and open hi-hat convention.

## Validation

- [ ] Chart writer tests cover accent flags.
- [ ] Chart writer tests cover ghost flags.
- [ ] Chart writer tests confirm no kick accent/ghost output.
- [ ] Chart writer tests cover open hi-hat encoding.
- [ ] Chart writer tests cover closed hi-hat encoding.
- [ ] Mapping tests cover dynamics behavior.
- [ ] Generated chart remains loadable in Moonscraper if manually validated.

## Completion

- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] Docs updated if behavior changed.
- [ ] No copyrighted MIDI/audio committed.
