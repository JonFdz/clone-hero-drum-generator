# Checklist Phase 04B: Demo and Track Detection Hardening

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/implementation/implementation-plan.md`.
- [x] Inspect `packages/midi/src/drumTrackSelection.ts`.
- [x] Inspect current tests for drum track scoring.
- [x] Review `docs/research/demo-source-selection.md`.

## Implementation

- [x] Update drum track scoring so channel 9 is a strong signal.
- [x] Avoid classifying empty-name non-channel-9 drum-like tracks as strong.
- [x] Keep explicit `--track` behavior unchanged.
- [x] Ensure auto-selection chooses track 53 for the Eat My Dust demo scenario.
- [x] Update CLI output labels if needed.

## Tests

- [x] Channel 9 + drum-like notes => strong.
- [x] Empty name + non-channel-9 + drum-like notes => weak, not strong.
- [x] Clear drums/percussion name + drum-like notes => strong.
- [x] Guitar/bass/vocals/keys names are rejected or not strong.
- [x] Auto-selection succeeds when exactly one strong track exists.
- [x] Auto-selection errors when multiple true strong tracks exist.

## Validation

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] `pnpm chdg inspect-midi --drums-only samples/demo.mid` reports track 53 as the only strong drum track for the local demo.

## Completion

- [x] Docs updated if behavior changed.
- [x] No copyrighted MIDI/audio committed.
