# Tasks — Phase 17J Preview and Project Lifecycle Bugfixes

## 0. Source of truth

- [ ] Verify all required docs/OpenSpec files exist.
- [ ] Transfer accepted OpenSpec decisions/tasks/validation rules into Engram.
- [ ] Confirm Engram is aligned before implementation.

## 1. P0 Preview generated-output-only

- [ ] Remove generated Preview fallback to `normalizationPreview.firstHits`.
- [ ] Ensure Preview requires generated `notes.chart` for chart preview.
- [ ] Ensure Preview requires generated `song.ogg` for audio preview.
- [ ] Add clear not-generated empty state.
- [ ] Add visible chart load error state.
- [ ] Add visible audio load error state.
- [ ] Stop swallowing `getChartPreviewData` failures silently when generated output is expected.
- [ ] Update tests for Preview generated-output-only behavior.

## 2. P1 Cover output as album.jpg

- [ ] Add cover output preparation helper.
- [ ] Attempt `album.jpg` creation during Generate when cover exists.
- [ ] Return warning if cover export fails.
- [ ] Ensure cover warning does not block generation.
- [ ] Surface cover warning in Generate output/issues.
- [ ] Add tests for supported cover output and warning-only failure.

## 3. P2 Rename auto-created project folder

- [ ] Add safe detection for CHDG auto-created project folder/file.
- [ ] Rename folder and `.chdg` file on project name change when safe.
- [ ] Update `projectFilePath` in state.
- [ ] Update default `outputDir` if it points to old default output path.
- [ ] Update recents.
- [ ] Do not rename custom paths.
- [ ] Add tests.

## 4. P3 Safe project deletion

- [ ] Review current deletion flow and failure cases.
- [ ] Handle already-missing project files gracefully where appropriate.
- [ ] Add safe managed-folder deletion if in scope.
- [ ] Prevent deletion of arbitrary folders.
- [ ] Clean recents after successful delete or safe missing-file cleanup.
- [ ] Add tests.

## 5. Validation

- [ ] Run `pnpm -r build`.
- [ ] Run `pnpm build`.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm --filter @chdg/project build`.
- [ ] Run `pnpm --filter @chdg/desktop build`.
- [ ] Run `pnpm chdg --help`.
- [ ] Perform manual validation from checklist.
