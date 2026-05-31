# Components / Implementation Areas — Phase 17J

## P0 — Preview generated-output-only

Likely files:

- `apps/desktop/src/app/services/desktop-preview.service.ts`
- `apps/desktop/src/app/services/preview-chart-stage-model.ts`
- `apps/desktop/src/app/pages/preview/preview-page.component.ts`
- `apps/desktop/electron/previewData.ts`
- `apps/desktop/electron/main.ts`
- preview-related tests

Required behavior:

- Load generated audio source only from `outputFiles.songOgg` or `outputDir/song.ogg`.
- Load chart preview data only from generated `notes.chart`.
- Do not use `normalizationPreview.firstHits` as generated preview fallback.
- Make chart/audio load failures visible.
- Show an empty state when output is not generated.

## P1 — Cover output as album.jpg

Likely files:

- `packages/project/src/generatePackage.ts`
- new helper such as `packages/project/src/prepareCover.ts` or equivalent
- `apps/desktop/src/app/pages/generate/generate-page.component.ts`
- project/generate tests

Required behavior:

- If project cover exists, attempt to generate/copy `album.jpg` into output folder.
- JPG/JPEG inputs may be copied/normalized to `album.jpg`.
- PNG/WebP conversion can be implemented if feasible without destabilizing the phase.
- If conversion is not supported, emit a warning and keep generation successful.
- Return warning/evidence in `GeneratePackageResult.issues` or an equivalent existing warning channel.

## P2 — Project rename sync

Likely files:

- `apps/desktop/electron/projectFileService.ts`
- `apps/desktop/electron/main.ts`
- desktop project state services
- project details page where project name changes
- recents/settings service

Required behavior:

- Detect whether project path is CHDG auto-created.
- On name change, rename folder and `.chdg` file when safe.
- Update `projectFilePath` and `outputDir` if outputDir was default.
- Update recents.
- Avoid renaming custom paths.

## P3 — Safe deletion

Likely files:

- `apps/desktop/electron/projectFileDeletion.ts`
- `apps/desktop/electron/main.ts`
- project list UI/service
- tests around deletion

Required behavior:

- Delete `.chdg` safely when path is allowed/known.
- Support safe deletion of CHDG auto-created project folders if appropriate.
- Do not delete arbitrary folders.
- Handle already-missing files gracefully where appropriate.
- Clean recents after successful delete or when project is already missing.
