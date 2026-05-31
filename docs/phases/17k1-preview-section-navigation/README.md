# Phase 17K.1 — Preview Section Navigation

## Status

Draft for Jon validation.

## Summary

Add generated-chart section awareness to Preview.

After Phase 17K, GPIF sections are exported at correct `notes.chart` ticks. Phase 17K.1 makes Preview consume those generated chart sections so the user can see the current song section and jump between sections during playback.

## Core decision

Preview must continue to use generated output only.

Sections in Preview must be parsed from generated `notes.chart`, not from `.chdg` Source Review analysis cache.

## User value

When validating generated drums, the user can quickly navigate to song parts such as Intro, Verse, Chorus, Break, Solo, and Bridge without manually scrubbing through the whole audio.

## Scope

- Parse `[Events]` section markers from generated `notes.chart`.
- Add section events to Preview chart data.
- Show a compact current-section overlay in Preview only when generated chart sections exist.
- Let the user jump to previous/next section.
- Let the user choose a section from a dropdown.
- Respect `previewOffsetMs` consistently with note rendering.
- Preserve play/pause state when jumping between sections.

## Out of scope

- No manual section creation.
- No section editing/renaming/deletion.
- No section persistence in `.chdg`.
- No Source Review section editor.
- No generation changes.
- No chart writer changes.
- No Preview visual redesign beyond the compact section navigation overlay.
- No MIDI Drum Note Atlas/mapping work.
- No tempo-map override/editor.
