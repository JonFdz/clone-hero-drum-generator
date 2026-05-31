# Checklist — Phase 17J

## Process

- [ ] Accepted OpenSpec is transferred to Engram before implementation.
- [ ] Engram is treated as the source of truth after transfer.
- [ ] Required files are verified before implementation.
- [ ] Missing files cause a stop/report, not assumptions.
- [ ] Ambiguities are raised before implementation.
- [ ] Final review is external by Jon/ChatGPT.

## P0 — Preview

- [ ] Preview uses generated `notes.chart`.
- [ ] Preview uses generated `song.ogg`.
- [ ] Preview does not use `.chdg` `analysis.normalizationPreview` for generated playback.
- [ ] `normalizationPreview.firstHits` is not stretched across duration.
- [ ] Missing generated output shows clear empty state.
- [ ] Missing/unreadable `notes.chart` shows clear chart error.
- [ ] Missing/unreadable `song.ogg` shows clear audio error.
- [ ] Chart load failures are not swallowed silently.
- [ ] Tests cover generated-output-only behavior.

## P1 — Cover

- [ ] Project cover attempts to generate `album.jpg` in output.
- [ ] JPG/JPEG input is handled.
- [ ] Unsupported/failed cover conversion emits warning.
- [ ] Cover failure does not block generation.
- [ ] Generate result/UI exposes cover warning.
- [ ] Tests cover cover success and warning-only failure.

## P2 — Rename

- [ ] CHDG auto-created project folders can be detected.
- [ ] Renaming project updates folder/file when safe.
- [ ] `projectFilePath` is updated.
- [ ] default `outputDir` is updated.
- [ ] recents are updated.
- [ ] custom paths are not renamed.
- [ ] conflicts are handled safely.

## P3 — Delete

- [ ] `.chdg` deletion remains path-safe.
- [ ] safe auto-created folder deletion is implemented or clearly scoped.
- [ ] arbitrary directories are never deleted.
- [ ] missing project files are handled gracefully where appropriate.
- [ ] recents cleanup works.
- [ ] failure messages are actionable.

## Validation commands

- [ ] `pnpm -r build`
- [ ] `pnpm build`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm --filter @chdg/project build`
- [ ] `pnpm --filter @chdg/desktop build`
- [ ] `pnpm chdg --help`

## Manual validation

- [ ] Open Preview before generation: shows Generate first / generated output unavailable.
- [ ] Generate and open Preview: uses generated `notes.chart` + `song.ogg`.
- [ ] Break/remove `notes.chart`: Preview shows chart error.
- [ ] Break/remove `song.ogg`: Preview shows audio error.
- [ ] Add cover and generate: output contains `album.jpg` or warning if unsupported.
- [ ] Rename auto-created project: folder/file paths update safely.
- [ ] Rename custom-path project: folder is not renamed.
- [ ] Delete project: safe deletion and recents cleanup behave correctly.
