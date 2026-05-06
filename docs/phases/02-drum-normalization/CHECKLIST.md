# Checklist Phase 02: Drum Normalization

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/implementation/implementation-plan.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Inspect relevant files.

## Implementation

- [x] Define or extend DrumHit types
- [x] Map MIDI note numbers to DrumPiece
- [x] Preserve tick, velocity, note number, channel and track
- [x] Report unknown notes
- [x] Keep pure functions testable

## Validation

- [x] A debug command or inspection mode prints normalized hits
- [x] Unknown notes are not silently dropped
- [x] Mapping changes require only data/config updates

## Completion

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] Docs updated if behavior changed.
- [x] No copyrighted MIDI/audio committed.

## Notes

Normalization operates on a **selected strong drum track**, not the whole MIDI file. If multiple strong tracks are detected, the user must pass `--track <index>` to select one explicitly.
