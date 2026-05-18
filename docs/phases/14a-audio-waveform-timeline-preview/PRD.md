# PRD Phase 14A: Audio + Waveform + Timeline Preview

## Goal

Add internal preview with audio, waveform, and timeline-style note visualization.

## Visual references

```txt
docs/desktop/mockups/08-preview-offset.png
```

Also read:

```txt
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
```

## Scope

- Load generated `song.ogg`.
- Load generated `notes.chart`.
- Render waveform.
- Render timeline lanes.
- Play/pause/seek audio.
- Highlight notes near current playback time.
- Keep preview read-only except previewed offset state.
- Use Clone Hero lane concepts where possible.

## Non-goals

- No highway preview yet.
- No automatic offset detection.
- No note editing.
- No waveform onset analysis beyond simple visualization.

## Notes

This phase should preserve existing CLI/backend behavior unless explicitly extending it.

Final PR review is external and PRs must not be merged without explicit approval.
