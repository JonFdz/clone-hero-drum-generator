# Checklist Phase 09: Metadata and Offset Controls

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/implementation/implementation-plan.md`.
- [ ] Read Phase 08 docs and implementation.
- [ ] Read this phase PRD.
- [ ] Read this phase ADR.
- [ ] Read OpenSpec artifacts for `phase-09-metadata-offset-controls`.
- [ ] Inspect `generateArgs.ts`.
- [ ] Inspect `generateCommand.ts`.
- [ ] Inspect `writeSongIni`.
- [ ] Inspect `writeChart`.

## Implementation

- [ ] Add `--name`.
- [ ] Add `--artist`.
- [ ] Add `--album` if supported.
- [ ] Add `--year` if supported.
- [ ] Add `--genre` if supported.
- [ ] Add `--charter` if supported.
- [ ] Add `--offset-ms`.
- [ ] Validate offset is numeric.
- [ ] Convert offset from milliseconds to seconds.
- [ ] Write converted offset to the `.chart` `[Song]` `Offset` field.
- [ ] Do not shift note/event ticks for offset.
- [ ] Preserve existing default metadata behavior when options are omitted.
- [ ] Preserve existing MIDI generation behavior.
- [ ] Preserve existing GPIF generation behavior.
- [ ] Do not implement automatic offset detection.

## Tests

- [ ] Argument parser accepts metadata options.
- [ ] Argument parser rejects missing metadata values.
- [ ] Argument parser accepts valid positive/negative/zero offset values.
- [ ] Argument parser rejects invalid offset values.
- [ ] `song.ini` includes provided metadata.
- [ ] Default metadata output is unchanged when options are omitted.
- [ ] `--offset-ms 900` writes `Offset = 0.9` in `notes.chart`.
- [ ] `--offset-ms 1200` writes `Offset = 1.2` in `notes.chart`.
- [ ] `--offset-ms -250` writes `Offset = -0.25` in `notes.chart`.
- [ ] Note/event ticks are not shifted by offset.
- [ ] MIDI generate path still passes.
- [ ] GPIF generate path still passes.
- [ ] No copyrighted fixtures committed.

## Validation

- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] Optional local MIDI validation recorded if performed.
- [ ] Optional local GPIF validation recorded if performed.
- [ ] Optional Moonscraper offset validation recorded if performed.

## Deferred

- [ ] Automatic audio alignment.
- [ ] Waveform/beat analysis.
- [ ] Desktop UI.
- [ ] Visual preview.
- [ ] Lower difficulties.
- [ ] Star power/fills.
