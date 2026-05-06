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
- [x] Deduplicate exact duplicate base notes (same tick/lane/length)
- [x] Support `--audio <file>` option
- [x] Robust generate argument parsing (options before/after file)
- [x] Print warning for unknown MIDI notes during generation

## Validation

- [x] `pnpm chdg generate samples/demo.mid --out output/demo`
- [x] `output/demo/notes.chart` exists
- [x] `output/demo/song.ini` exists
- [ ] ~~Moonscraper opens chart~~ — deferred to Phase 04 manual validation
- [ ] ~~Clone Hero detects ExpertDrums~~ — deferred to Phase 04 manual validation

> **Note:** Phase 03 output is a base `ExpertDrums` chart suitable for Moonscraper/Clone Hero review. It is not yet a fully-authored final chart. Cymbals, ghost notes, accents, double kick, star power and drum fills are out of scope for this phase.
>
> Manual validation in Moonscraper and Clone Hero will be performed in Phase 04.

## Completion

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] Docs updated if behavior changed.
- [x] No copyrighted MIDI/audio committed.
