# Checklist Phase 04B: Demo and Track Detection Hardening

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/implementation/implementation-plan.md`.
- [ ] Inspect `packages/midi/src/drumTrackSelection.ts`.
- [ ] Inspect current tests for drum track scoring.
- [ ] Review `docs/research/demo-source-selection.md`.

## Implementation

- [ ] Update drum track scoring so channel 9 is a strong signal.
- [ ] Avoid classifying empty-name non-channel-9 drum-like tracks as strong.
- [ ] Keep explicit `--track` behavior unchanged.
- [ ] Ensure auto-selection chooses track 53 for the Eat My Dust demo scenario.
- [ ] Update CLI output labels if needed.

## Tests

- [ ] Channel 9 + drum-like notes => strong.
- [ ] Empty name + non-channel-9 + drum-like notes => weak, not strong.
- [ ] Clear drums/percussion name + drum-like notes => strong.
- [ ] Guitar/bass/vocals/keys names are rejected or not strong.
- [ ] Auto-selection succeeds when exactly one strong track exists.
- [ ] Auto-selection errors when multiple true strong tracks exist.

## Validation

- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm chdg -- inspect-midi --drums-only samples/demo.mid` reports track 53 as the only strong drum track for the local demo.

## Completion

- [ ] Docs updated if behavior changed.
- [ ] No copyrighted MIDI/audio committed.
