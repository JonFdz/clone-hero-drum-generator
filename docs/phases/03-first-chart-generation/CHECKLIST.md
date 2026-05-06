# Checklist Phase 03: First Chart Generation

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/implementation/implementation-plan.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Inspect relevant files.

## Implementation

- [x] Implement generate command
- [x] Read MIDI
- [x] Normalize DrumHit objects
- [x] Map hits to Clone Hero lanes
- [x] Write notes.chart
- [x] Write song.ini
- [x] Create output directory

## Validation

- [x] `pnpm chdg generate samples/demo.mid --out output/demo`
- [x] `output/demo/notes.chart` exists
- [x] `output/demo/song.ini` exists
- [ ] Moonscraper opens chart (manual validation required)
- [ ] Clone Hero detects ExpertDrums (manual validation required)

## Completion

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] Docs updated if behavior changed.
- [x] No copyrighted MIDI/audio committed.
