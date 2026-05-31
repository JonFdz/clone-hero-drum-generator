# Checklist — Phase 17J

## Process

- [x] Accepted OpenSpec is transferred to Engram before implementation.
- [x] Engram is treated as the source of truth after transfer.
- [x] Required files are verified before implementation.
- [ ] Missing files cause a stop/report, not assumptions.
- [ ] Ambiguities are raised before implementation.
- [x] Final review is external by Jon/ChatGPT.

## P0 — Preview

- [x] Preview uses generated `notes.chart`.
- [x] Preview uses generated `song.ogg`.
- [x] Preview does not use `.chdg` `analysis.normalizationPreview` for generated playback.
- [x] `normalizationPreview.firstHits` is not stretched across duration.
- [x] Missing generated output shows clear empty state.
- [x] Missing/unreadable `notes.chart` shows clear chart error.
- [x] Missing/unreadable `song.ogg` shows clear audio error.
- [x] Chart load failures are not swallowed silently.
- [x] Tests cover generated-output-only behavior.

## P1 — Cover

- [x] Project cover attempts to generate `album.jpg` in output.
- [x] JPG/JPEG input is handled.
- [x] Unsupported/failed cover conversion emits warning.
- [x] Cover failure does not block generation.
- [x] Generate result/UI exposes cover warning.
- [x] Tests cover cover success and warning-only failure.

## P2 — Rename

- [x] CHDG auto-created project folders can be detected.
- [x] Renaming project updates folder/file when safe.
- [x] `projectFilePath` is updated.
- [x] default `outputDir` is updated.
- [x] recents are updated.
- [x] custom paths are not renamed.
- [x] conflicts are handled safely.

## P3 — Delete

- [x] `.chdg` deletion remains path-safe.
- [ ] safe auto-created folder deletion is implemented or clearly scoped.
- [x] arbitrary directories are never deleted.
- [x] missing project files are handled gracefully where appropriate.
- [x] recents cleanup works.
- [x] failure messages are actionable.

## Validation commands

- [ ] `pnpm -r build`
- [ ] `pnpm build`
- [x] `pnpm typecheck` *(partial: packages passed; desktop ng build abort trap in local environment)*
- [x] `pnpm test`
- [ ] `pnpm --filter @chdg/project build`
- [ ] `pnpm --filter @chdg/desktop build`
- [x] `pnpm chdg --help`

## Manual validation

- [ ] Open Preview before generation: shows Generate first / generated output unavailable.
- [ ] Generate and open Preview: uses generated `notes.chart` + `song.ogg`.
- [ ] Break/remove `notes.chart`: Preview shows chart error.
- [ ] Break/remove `song.ogg`: Preview shows audio error.
- [ ] Add cover and generate: output contains `album.jpg` or warning if unsupported.
- [ ] Rename auto-created project: folder/file paths update safely.
- [ ] Rename custom-path project: folder is not renamed.
- [ ] Delete project: safe deletion and recents cleanup behave correctly.

## Agent validation notes

- `pnpm test` passed: 57 files / 446 tests.
- `pnpm --filter @chdg/project typecheck` passed.
- `pnpm --filter @chdg/desktop exec tsc -p tsconfig.electron.json --noEmit` passed.
- `pnpm typecheck` reached package checks successfully, then desktop `ng build --configuration development` aborted with `Abort trap: 6` under local Node v25.9.0.
- Build commands were not intentionally run separately because AGENTS.md says never build after changes; `pnpm typecheck` invokes desktop build internally.
- `pnpm chdg --help` passed when rerun outside sandbox; sandbox run failed with tsx IPC `EPERM`.
- Manual desktop validation is still pending local app run by Jon/ChatGPT.
