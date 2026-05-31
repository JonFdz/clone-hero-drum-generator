# PRD — Phase 17J Preview and Project Lifecycle Bugfixes

## Problem

Several related workflow issues reduce confidence in generated output and project management:

1. Preview can fall back to `.chdg` analysis data instead of generated files. This is incorrect because Preview should show how the generated Clone Hero package behaves.
2. Cover art selected in the project is not included in the generated output as `album.jpg`.
3. A newly-created project folder may keep an old default name after the project name changes.
4. Project deletion sometimes fails or behaves inconsistently.

## Goals

### P0 — Preview generated-output-only

Preview must use generated `notes.chart` and `song.ogg` only.

When generated output is unavailable, Preview should show a clear empty/error state instead of approximating timing from `.chdg` analysis cache.

### P1 — Cover output

When a cover exists, Generate attempts to create `album.jpg` in the output folder.

If cover preparation fails, generation succeeds with a warning.

### P2 — Project rename lifecycle

When the project lives in a CHDG auto-created folder, changing the project name should keep the filesystem path aligned by renaming the folder and `.chdg` file.

### P3 — Safe deletion

Project deletion should reliably delete what the user expects, while avoiding unsafe deletion of arbitrary directories.

## Non-goals

- Do not change GPIF timeline extraction.
- Do not change generated chart timing logic except Preview loading behavior.
- Do not implement a visual redesign.
- Do not add manual note editing.
- Do not silently delete custom folders.

## User stories

### Preview

As a user, when I open Preview, I want to see the generated chart and generated audio, so I can trust that Preview reflects Clone Hero output.

As a user, if I have not generated yet, I want Preview to clearly tell me to generate first.

As a user, if generated `notes.chart` cannot be read, I want a visible error instead of a misleading approximate preview.

### Cover

As a user, when I select a cover and generate, I want the output folder to contain `album.jpg` for Clone Hero.

As a user, if cover export fails, I still want notes/audio to generate and I want a warning explaining what happened.

### Project rename

As a user, if I rename a CHDG-created project, I expect the project folder/file name to update too.

### Deletion

As a user, when I delete a project, I want the app to safely remove the project and its managed files or explain why it cannot.

## Acceptance summary

- Preview never uses `normalizationPreview.firstHits` to simulate generated chart playback.
- Preview requires generated `notes.chart` and generated `song.ogg` for playback.
- Missing generated output results in a clear empty state.
- Cover generation attempts to create `album.jpg` and reports warning-only failures.
- Auto-created project folder rename works safely.
- Project deletion is safer and more reliable, with clear errors/warnings.
