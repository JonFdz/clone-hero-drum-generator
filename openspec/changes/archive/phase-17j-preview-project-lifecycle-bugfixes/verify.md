# Verify — Phase 17J Preview and Project Lifecycle Bugfixes

## Automated

Run:

```bash
pnpm -r build
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/project build
pnpm --filter @chdg/desktop build
pnpm chdg --help
```

If any command fails, report exact output. Do not classify deterministic errors as environment-only without evidence.

## Manual P0 Preview

1. Open a project that has not generated output.
2. Open Preview.
3. Confirm Preview shows a generated-output-required empty state.
4. Generate successfully.
5. Open Preview.
6. Confirm it uses generated `notes.chart` and generated `song.ogg`.
7. Temporarily remove/rename `notes.chart`.
8. Confirm Preview shows generated chart unavailable.
9. Restore chart and remove/rename `song.ogg`.
10. Confirm Preview shows generated audio unavailable.
11. Confirm Preview does not show fake timing from `analysis.normalizationPreview.firstHits`.

## Manual P1 Cover

1. Add a JPG/JPEG cover.
2. Generate.
3. Confirm output contains `album.jpg`.
4. Try an unsupported/failing cover case if applicable.
5. Confirm generation succeeds with warning.

## Manual P2 Rename

1. Create a new project in CHDG default location.
2. Rename the project.
3. Confirm folder and `.chdg` file update safely.
4. Confirm outputDir updates if it was default.
5. Confirm recents point to the new path.
6. Repeat with a custom path and confirm it is not renamed.

## Manual P3 Delete

1. Delete a project from a known safe path.
2. Confirm `.chdg` is removed and recents cleaned.
3. Try deleting when the file is already missing.
4. Confirm the app handles it gracefully.
5. Confirm arbitrary directories cannot be deleted.
