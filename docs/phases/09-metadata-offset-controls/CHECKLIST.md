# Checklist Phase 09: Metadata and Offset Controls

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/implementation/implementation-plan.md`.
- [x] Read Phase 08 docs and implementation.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Read OpenSpec artifacts for `phase-09-metadata-offset-controls`.
- [x] Inspect `generateArgs.ts`.
- [x] Inspect `generateCommand.ts`.
- [x] Inspect `writeSongIni`.
- [x] Inspect `writeChart`.

## Implementation

- [x] Add `--name`.
- [x] Add `--artist`.
- [x] Add `--album` if supported.
- [x] Add `--year` if supported.
- [x] Add `--genre` if supported.
- [x] Add `--charter` if supported.
- [x] Add `--offset-ms`.
- [x] Validate offset is numeric.
- [x] Convert offset from milliseconds to seconds.
- [x] Write converted offset to the `.chart` `[Song]` `Offset` field.
- [x] Do not shift note/event ticks for offset.
- [x] Preserve existing default metadata behavior when options are omitted.
- [x] Preserve existing MIDI generation behavior.
- [x] Preserve existing GPIF generation behavior.
- [x] Do not implement automatic offset detection.

Implementation notes:

- `--offset-ms` uses milliseconds.
- `notes.chart` `Offset` uses seconds.
- Offset is written to chart `[Song]` `Offset`.
- Note/event ticks are not shifted.

## Tests

- [x] Argument parser accepts metadata options.
- [x] Argument parser rejects missing metadata values.
- [x] Argument parser accepts valid positive/negative/zero offset values.
- [x] Argument parser rejects invalid offset values.
- [x] `song.ini` includes provided metadata.
- [x] Default metadata output is unchanged when options are omitted.
- [x] `--offset-ms 900` writes `Offset = 0.9` in `notes.chart`.
- [x] `--offset-ms 1200` writes `Offset = 1.2` in `notes.chart`.
- [x] `--offset-ms -250` writes `Offset = -0.25` in `notes.chart`.
- [x] Note/event ticks are not shifted by offset.
- [x] MIDI generate path still passes.
- [x] GPIF generate path still passes.
- [x] No copyrighted fixtures committed.

## Validation

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] Optional local MIDI validation recorded if performed.
    - Generated `output/demo-midi-meta/notes.chart`, `song.ini`, and `song.ogg` from `/Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mid` with `--offset-ms 900`; `song.ini` contains provided metadata and `notes.chart` contains `Offset = 0.9`.
- [x] Optional local GPIF validation recorded if performed.
    - Generated `output/demo-gp-meta/notes.chart`, `song.ini`, and `song.ogg` from `/Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp` with `--offset-ms 900`; `song.ini` contains provided metadata and `notes.chart` contains `Offset = 0.9`.
- [ ] Optional Moonscraper offset validation recorded if performed.

## Deferred

- [ ] Automatic audio alignment.
- [ ] Waveform/beat analysis.
- [ ] Desktop UI.
- [ ] Visual preview.
- [ ] Lower difficulties.
- [ ] Star power/fills.
