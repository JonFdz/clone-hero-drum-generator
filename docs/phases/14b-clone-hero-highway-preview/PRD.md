# PRD Phase 14B: Clone Hero Highway Preview

## Goal

Add a Clone Hero-style **read-only** note highway preview to CHDG Desktop.

Phase 14A adds local audio playback, waveform/waveform-like overview, timeline notes, and playhead sync. Phase 14B builds on that foundation by adding a visual highway closer to how the generated chart will feel in Clone Hero.

## Roadmap context

```txt
Phase 14A — Audio + Waveform + Timeline Preview
Phase 14B — Clone Hero Highway Preview
Phase 15  — Offset Adjustment Loop
```

This phase is **14B only**.

## Why this exists

Timeline preview is useful, but the final target is a Clone Hero drum chart. A highway preview helps the user judge:

```txt
lane mapping
cymbals
open hi-hat
accent/ghost modifiers
note density
rough playability
timing feel while audio plays
```

without needing to open an external editor.

## Visual references

```txt
docs/desktop/mockups/08-preview-offset.png
```

Also read:

```txt
docs/desktop/README.md
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
docs/desktop/feature-inventory.md
docs/phases/14a-audio-waveform-timeline-preview/PRD.md
docs/phases/14a-audio-waveform-timeline-preview/ADR.md
```

If mockup text conflicts with this PRD/OpenSpec, this PRD/OpenSpec is canonical.

## Scope

- Add a Clone Hero-style highway section to the Preview page.
- Reuse Phase 14A audio playback state where possible.
- Reuse generated `notes.chart` preview data or structured generated/normalized hit data where available.
- Render drum lanes:
  - kick;
  - red/snare;
  - yellow;
  - blue;
  - green.
- Show cymbal state for yellow/blue/green when data is available.
- Show open hi-hat when data is available.
- Show accent/ghost state when data is available.
- Show notes moving toward a hit line based on current audio playback time.
- Keep highway synced with audio playback.
- Allow speed/zoom/readability controls if simple:
  - lookahead window;
  - note speed;
  - pause/play inherited from Phase 14A.
- Show clear limited states when only partial note data is available.
- Keep preview read-only.
- Preserve validation/generation/project behavior.
- Preserve Electron security boundaries.

## Source data priority

Use the best available project data:

```txt
1. generated notes.chart parsed into preview note events
2. structured generated result / hit data already available in app state
3. normalization preview data already available in app state
```

When generated `notes.chart` is available, prefer it because it reflects the actual Clone Hero output.

## Chart semantics

The highway should represent Clone Hero drum lanes.

Base note lanes:

```txt
0 -> kick
1 -> red
2 -> yellow
3 -> blue
4 -> green
```

Modifier notes, where present:

```txt
66 -> yellow cymbal
67 -> blue cymbal
68 -> green cymbal
34/35/36/37 -> accent modifiers
40/41/42/43 -> ghost modifiers
```

Use existing chart writer/mapping conventions as the source of truth.

## Timing

Use the same chart timing conversion as Phase 14A:

```txt
Resolution = ticks per beat
B tempo values = BPM * 1000
Offset = seconds
```

If timing is limited or unavailable, show a clear limited state.

## Read-only behavior

This phase must not edit the chart.

The user must not be able to:

```txt
add notes
remove notes
move notes
change lane mapping
persist offset changes
```

## Non-goals

- No note editing.
- No manual note add/remove/move.
- No persisted offset adjustment loop. That is Phase 15.
- No automatic offset detection.
- No gameplay/scoring.
- No exact Clone Hero clone.
- No mapping override UI.
- No mapping profiles.
- No packaging/distribution.
- No full desktop UX polish pass.
- No external editor/Moonscraper dependency.

## UX guidance

The highway should be useful and readable, not a perfect game clone.

Prefer:

```txt
clear lane labels
stable hit line
simple falling/scrolling notes
clear limited states
consistent dark UI
```

Do not do a broad visual redesign. Only fix UX blockers needed for highway usability.

## Acceptance criteria

- Preview page includes a highway section.
- Highway renders notes when chart/hit data is available.
- Highway syncs to audio playback time.
- Highway has visible lanes for kick/red/yellow/blue/green.
- Cymbal/open hi-hat/accent/ghost states are represented when data is available.
- Highway handles missing/limited data gracefully.
- Preview remains read-only.
- Validation page still works.
- Generate page still works.
- Project save/load still works.
- Electron security boundaries are preserved.
