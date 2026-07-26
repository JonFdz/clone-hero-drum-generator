# Proposal: Phase 14A — Audio + Waveform + Timeline Preview

## Change ID

`phase-14a-audio-waveform-timeline-preview`

## Summary

Add internal preview with local audio playback, waveform/waveform-like visualization, and timeline-style note visualization.

This is **Phase 14A**, not the full offset adjustment phase.

The roadmap split is:

```txt
Phase 14A — Audio + Waveform + Timeline Preview
Phase 14B — Clone Hero Highway Preview
Phase 15  — Offset Adjustment Loop
```

## Why this phase exists

CHDG can generate, persist projects, and validate readiness. The next step is to inspect output inside the desktop app.

This phase creates a read-only preview foundation before the Clone Hero highway and offset adjustment loop.

## Goals

1. Make the Preview page functional.
2. Load local preview audio.
3. Prefer generated `song.ogg` when available.
4. Fall back to selected project audio when generated output is unavailable.
5. Use secure Electron bridge access for local audio preview.
6. Render waveform or lightweight waveform-like overview.
7. Render timeline-style note visualization.
8. Play/pause/seek audio.
9. Show current playback time and duration.
10. Sync timeline/playhead to audio playback.
11. Highlight notes near current playback time.
12. Handle missing generated output gracefully.
13. Keep preview read-only.
14. Preserve validation/generation/project behavior.
15. Preserve Electron security boundaries.

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

## Branch

```txt
feat/phase-14a-audio-waveform-timeline-preview
```

## Required docs to read

```txt
docs/desktop/README.md
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
docs/desktop/feature-inventory.md
docs/phases/14a-audio-waveform-timeline-preview/PRD.md
docs/phases/14a-audio-waveform-timeline-preview/ADR.md
docs/phases/14a-audio-waveform-timeline-preview/CHECKLIST.md
docs/phases/13-validation-checklist/PRD.md
docs/phases/12-project-persistence-settings/PRD.md
docs/phases/11-desktop-generate-mvp/PRD.md
docs/phases/10b-multi-track-normalization-generation/PRD.md
```

Visual reference:

```txt
docs/desktop/mockups/08-preview-offset.png
```

If mockup text conflicts with docs/OpenSpec, docs/OpenSpec are canonical.

## Important correction

A previous draft incorrectly combined Phase 14A and Phase 15 by including full offset adjustment controls.

This OpenSpec corrects that.

Phase 14A may show current offset and may support temporary preview-only offset if trivial, but it must not implement the full persisted offset adjustment loop.

## Audio source strategy

Use this priority:

```txt
1. generated song.ogg from current project output, if available and allowed
2. selected project audio as safe fallback, if allowed/current project audio
```

The renderer must not construct arbitrary `file://` URLs.

Electron main/preload must validate preview paths.

## Timeline/note strategy

Use the best available project data:

```txt
generated notes.chart where available
structured generated/normalized hit data where available
normalization preview data where available
```

If exact seconds mapping is unavailable, show a clear limited state.

## Validation

Required:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

Manual desktop validation:

```txt
open existing .chdg project with generated output
Preview page loads audio
play/pause works
timeline advances
waveform or waveform-like overview renders
note timeline renders when chart/hit data is available
playhead syncs to audio
timeline seek works if implemented
notes near current time highlight
preview handles missing generated output gracefully
Validation and Generate pages still work
```

## Review policy

Final PR review is external and will be performed by Jon/ChatGPT.

The agent must not merge.
