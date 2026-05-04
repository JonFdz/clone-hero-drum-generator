# Checklist Phase 01: MIDI Inspection

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/implementation/implementation-plan.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Inspect relevant files.

## Implementation

- [x] Add MIDI parser dependency
- [x] Read MIDI PPQ/resolution
- [x] Read tracks and names
- [x] Read channels
- [x] Read tempo events
- [x] Read time signatures
- [x] Aggregate note numbers and velocities
- [x] Guess drum pieces using mapping JSON

## Validation

- [x] `pnpm chdg -- inspect-midi <file.mid>`
- [x] Output shows note counts and velocity stats
- [x] Unknown notes are visible
- [x] No chart files are generated

## Completion

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] Docs updated if behavior changed.
- [x] No copyrighted MIDI/audio committed.
