# CHDG Desktop Planning Decisions

## Architecture

- Start simple in Phase 10.
- Use Electron + Angular.
- Use `apps/desktop` initially.
- Leave room for a future shared `packages/ui` if needed, but the product is expected to remain a local desktop app.
- Use Electron safely:
  - `contextIsolation: true`
  - `nodeIntegration: false`
  - explicit preload bridge
  - no direct Node access in Angular renderer
- Plan cleanup/scaling with `packages/project`.

## Offline and copyright

- CHDG Desktop must work 100% offline.
- It processes local user-provided files.
- It should not upload user music/chart files to a web server.
- It should not scrape/download copyrighted content.
- It should not include YouTube/URL import as a core feature.
- The app should move toward self-sufficiency rather than depending on Moonscraper.

## Multiplatform

Target platforms:

```txt
Windows
macOS
Linux
```

Electron + Angular gives a shared UI/runtime, but packaging and tooling remain platform-specific.

Known platform-specific concerns:

```txt
paths
ffmpeg binary/discovery
opening folders
permissions
macOS signing/notarization
Linux packaging variants
file associations
```

FFmpeg strategy:

```txt
MVP: hybrid
- use ffmpeg from PATH when available
- allow user-configured ffmpeg path
- later evaluate bundling per platform
```

## Project format

- `.chdg` is the project file extension.
- Initially `.chdg` is JSON internally.
- `.chdg` is not the generated Clone Hero output package.
- Default project location:

```txt
~/Documents/CHDG Projects/<project-name>/<project-name>.chdg
```

- Output folder should live inside the project folder by default.
- Initially store absolute paths to source/audio files.
- Relative paths or bundle format can be planned later.
- File association / double-click opening is deferred until the format/packaging matures.

## Structured services

Create `packages/project` as the high-level orchestration layer.

Expected responsibilities:

```txt
inspectSource()
normalizeSelection()
mergeTracks()
generatePackage()
validatePackage()
readProjectFile()
writeProjectFile()
```

CLI and desktop should both use this layer.

CLI `--json` is required for key commands. JSON mode should produce clean machine-readable JSON, with human logs avoided or moved into structured JSON/stderr.

## Multi-track

Support both:

```txt
--track 3
--tracks 3,10
```

Multi-track should exist in CLI and UI.

Initial merge behavior:

```txt
merge selected tracks into one DrumHit[] stream
deduplicate identical hits: same tick + same piece
allow real chords such as kick + snare + crash
open hi-hat wins over closed hi-hat when conflicting
accent wins over normal when conflicting
normal hit wins over ghost when conflicting
warn on impossible hand chords instead of auto-deleting aggressively
preserve source trace for hits where possible
```

The UI should show combined summary:

```txt
selected tracks
combined hit count
duplicates removed
unknowns
warnings
```

Do not average timing or velocity unless a future spec explicitly defines that behavior.

## Preview

Preview should be split into:

```txt
Phase 14A — Audio + Waveform + Timeline Preview
Phase 14B — Clone Hero Highway Preview
```

Post-generation preview should read:

```txt
notes.chart + song.ogg
```

because that is the real output Clone Hero receives.

Pre-generation preview can use simplified normalized data for track selection and mapping review.

## Offset

- UI uses milliseconds.
- Chart uses seconds.
- Offset is stored in `notes.chart` `[Song]` `Offset`.
- Offset does not shift note/event ticks.
- Offset adjustment should preview live without writing files.
- Save should update the chart/project when the user confirms.
- If source/track/audio changes, keep state but mark preview/generation/validation as outdated.
- UI wording should describe chart offset, not audio shifting.

## Mapping

Phase 16A starts with project-level mapping overrides.

Supported initial override concepts:

```txt
MIDI note number -> DrumPiece
GPIF articulation/source key -> DrumPiece
ignore source note/articulation
sidestick -> snare or ignore
```

Do not edit individual notes in Phase 16A.

Mapping profiles are Phase 16B, after observing real cases. Songsterr profiles should be based on real repeated patterns, not invented too early.

## External tools

Moonscraper/external chart editors are optional and late.

Primary path:

```txt
CHDG internal validation
CHDG internal preview
CHDG internal offset adjustment
CHDG internal mapping review
```

Optional future integration:

```txt
external chart editor path
open generated folder/file with external editor
```
