# Phase 17J — Preview and Project Lifecycle Bugfixes

## Summary

Phase 17J is a focused bugfix phase after the GPIF timeline/tempo-map fix. It addresses correctness and consistency problems around generated output, Preview, project folders, cover art, and safe project deletion.

The highest priority is Preview: Preview must represent the generated Clone Hero package exactly. It must use generated `notes.chart` and generated `song.ogg`, not cached `.chdg` analysis data.

## Priority order

1. **P0 — Preview generated-output-only**
2. **P1 — Cover output as `album.jpg`, warning-only**
3. **P2 — Rename auto-created project folder when project name changes**
4. **P3 — Reliable safe project deletion**

If P0 becomes larger than expected, finish P0 first and stop. Do not block the Preview fix on cover, rename, or delete work.

## Product decisions

### Preview

Preview is the generated package preview. It must always use generated output files:

- `notes.chart`
- `song.ogg`

Preview must not use `.chdg` `analysis.normalizationPreview` as a timing source. `normalizationPreview.firstHits` is a small Source Review sample, not a generated chart model.

If generated files are missing, Preview should show a clear empty state asking the user to generate first.

### Cover

If a project has a cover image, Generate should attempt to create `album.jpg` in the output folder.

Cover failure is warning-only. It must not block chart/audio generation.

### Project rename

If a project folder was auto-created by CHDG, changing the project name should rename the project folder and `.chdg` file to match the new project name.

Do not rename custom user paths without explicit future design/confirmation.

### Project deletion

Project deletion must be reliable and safe.

Deleting arbitrary directories is not allowed. Deleting a project folder is only allowed when CHDG can determine that it is a safe auto-created project folder.

## Out of scope

- UI redesign.
- Preview + Generate unification.
- GPIF timeline changes.
- Tempo map changes.
- Audio beat detection.
- Manual note editing.
- Broad project model migration unless required for safe lifecycle tracking.
