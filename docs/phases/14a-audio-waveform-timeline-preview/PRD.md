# PRD Phase 14A: Audio + Waveform + Timeline Preview

## Goal

Add an internal local preview for audio playback, waveform/waveform-like visualization, and timeline-style note visualization.

This phase is **14A** in the roadmap.

The surrounding roadmap is:

```txt
Phase 14A — Audio + Waveform + Timeline Preview
Phase 14B — Clone Hero Highway Preview
Phase 15  — Offset Adjustment Loop
```

## Why this exists

CHDG can already generate a Clone Hero song folder and validate whether a project can be generated. The next step is to let the user inspect generated or project audio inside the app without relying on Moonscraper or another external editor.

This phase gives the user a read-only preview foundation before adding:

```txt
Phase 14B — Clone Hero-style highway
Phase 15  — persisted offset adjustment loop
```

## Visual references

```txt
docs/desktop/mockups/08-preview-offset.png
```

Also read:

```txt
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
docs/desktop/feature-inventory.md
```

If mockup text conflicts with this PRD/OpenSpec, this PRD/OpenSpec is canonical.

## Scope

- Make the existing Preview page functional.
- Load local preview audio.
- Prefer generated `song.ogg` from the current project output when available.
- Fall back to selected project audio when generated `song.ogg` is unavailable.
- Use a secure Electron bridge for local audio preview source creation.
- Do not let the renderer freely construct arbitrary `file://` URLs.
- Load/read generated `notes.chart` when available, or use structured normalized/generated hit data already available in state.
- Render a waveform or lightweight waveform-like amplitude overview.
- Render a timeline-style note visualization.
- Play/pause/seek audio.
- Show current playback time and duration.
- Sync timeline/playhead to audio playback.
- Highlight notes near the current playback time.
- Keep preview read-only.
- Handle missing generated output gracefully.
- Preserve validation/generation/project behavior.
- Preserve Electron security boundaries.

## Audio source priority

Use this order:

```txt
1. generated song.ogg from current project output, if available and allowed
2. selected project audio as fallback, if allowed/current project audio
```

The user should not need internet access.

## Timeline/note source priority

Use the best available source:

```txt
1. generated notes.chart, if available and readable through a safe bridge/service
2. structured generated result/hit data already in app state
3. normalization preview hit data already in app state
```

If exact seconds mapping is unavailable, the UI must show a clear limited state rather than pretending sync is accurate.

## Non-goals

- No Clone Hero highway preview. That is Phase 14B.
- No full persisted offset adjustment loop. That is Phase 15.
- No automatic offset detection.
- No note editing.
- No manual note add/remove/move.
- No mapping override UI.
- No mapping profiles.
- No audio stretching/time manipulation.
- No metronome/click track.
- No packaging/distribution.
- No full desktop UX polish pass.
- No external editor/Moonscraper dependency.

## Offset clarification

Phase 14A may show the current offset and may allow temporary preview-only offset if trivial, but it must **not** implement the full persisted offset adjustment loop.

Persisted offset controls belong to Phase 15 unless explicitly approved later.

## Security requirements

The renderer must not:

```txt
read arbitrary files
use fs directly
use child_process directly
construct arbitrary file:// URLs without bridge validation
```

Electron main/preload must validate local preview paths before returning a preview source.

## Acceptance criteria

- Preview page is no longer a placeholder.
- A generated project can load local preview audio.
- Audio play/pause works.
- Current time and duration are visible.
- Timeline/playhead advances with playback.
- Waveform or waveform-like overview is visible.
- Timeline-style note visualization is visible when chart/hit data exists.
- Notes near current playback time are highlighted.
- Missing generated output has a clear empty/limited state.
- Validation page still works.
- Generate page still works.
- Project save/load still works.
- Electron security boundaries are preserved.
