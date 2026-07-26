# Design — Phase 17J Preview and Project Lifecycle Bugfixes

## P0 Preview generated-output-only

### Current risk

Preview can use `normalizationPreview.firstHits` when chart preview data is unavailable. This is unsafe because `firstHits` is a small Source Review sample, not the generated chart.

### Design

Preview should resolve generated output:

1. `notes.chart`
2. `song.ogg`

If either is missing or unreadable, Preview should show a clear empty/error state.

Preview must not derive generated timing from `.chdg` analysis cache.

### Expected states

- **Not generated**: show `Generate this project to preview notes.chart and song.ogg.`
- **Chart missing/unreadable**: show generated chart unavailable.
- **Audio missing/unreadable**: show generated audio unavailable.
- **Ready**: load generated chart and audio only.

## P1 Cover output

### Design

When `cover.imagePath` exists, Generate attempts to create `album.jpg` in output.

Cover export failure is a warning. Generation continues and returns chart/audio/ini outputs.

### Conversion policy

Initial implementation may support JPEG/JPG copy/normalization first. PNG/WebP conversion can be added if feasible without destabilizing the phase. Unsupported conversion should produce warning-only failure.

## P2 Project rename sync

### Design

When project folder/file was auto-created by CHDG, changing project name should rename:

- containing project folder;
- `.chdg` file;
- default outputDir path if it points inside the old auto-created folder.

Custom paths must not be renamed.

The app must update:

- in-memory projectFilePath;
- in-memory outputDir when default;
- recents.

## P3 Safe deletion

### Design

Deletion must remain conservative.

- `.chdg` deletion must require allowed/recent path.
- Folder deletion is allowed only for CHDG-managed auto-created project folders.
- Arbitrary directories must never be deleted.
- If files are already missing, recents cleanup should still happen where safe.
