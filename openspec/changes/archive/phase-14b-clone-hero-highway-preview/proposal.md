# Proposal: Phase 14B — Clone Hero Highway Preview

## Change ID

`phase-14b-clone-hero-highway-preview`

## Summary

Add a read-only Clone Hero-style highway preview to CHDG Desktop.

Phase 14A adds local audio, waveform/waveform-like overview, timeline notes, and synced playhead. Phase 14B adds a more game-like drum highway view that helps users assess how the generated chart will feel in Clone Hero.

## Roadmap boundary

```txt
Phase 14A — Audio + Waveform + Timeline Preview
Phase 14B — Clone Hero Highway Preview
Phase 15  — Offset Adjustment Loop
```

Do not implement Phase 15 in this change.

## Goals

1. Add highway section to the Preview page.
2. Reuse Phase 14A audio playback/current time state.
3. Reuse generated `notes.chart` preview data where available.
4. Render Clone Hero-style drum lanes:
   - kick;
   - red;
   - yellow;
   - blue;
   - green.
5. Render notes relative to audio playback time.
6. Show a visible hit line.
7. Represent cymbal state where available.
8. Represent open hi-hat where available.
9. Represent accent/ghost state where available.
10. Show limited states when data is incomplete.
11. Keep preview read-only.
12. Preserve validation/generation/project behavior.
13. Preserve Electron security boundaries.

## Non-goals

- No note editing.
- No manual note add/remove/move.
- No persisted offset adjustment loop.
- No automatic offset detection.
- No gameplay/scoring.
- No exact Clone Hero clone.
- No mapping override UI.
- No mapping profiles.
- No packaging/distribution.
- No full desktop UX polish pass.
- No external editor/Moonscraper dependency.

## Branch

```txt
feat/phase-14b-clone-hero-highway-preview
```

## Required docs to read

```txt
docs/desktop/README.md
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
docs/desktop/feature-inventory.md
docs/phases/14a-audio-waveform-timeline-preview/PRD.md
docs/phases/14a-audio-waveform-timeline-preview/ADR.md
docs/phases/14b-clone-hero-highway-preview/PRD.md
docs/phases/14b-clone-hero-highway-preview/ADR.md
docs/phases/14b-clone-hero-highway-preview/CHECKLIST.md
docs/phases/13-validation-checklist/PRD.md
docs/phases/12-project-persistence-settings/PRD.md
```

Visual reference:

```txt
docs/desktop/mockups/08-preview-offset.png
```

If mockup text conflicts with docs/OpenSpec, docs/OpenSpec are canonical.

## Data source strategy

Prefer generated chart data:

```txt
1. parsed generated notes.chart
2. structured generated result/hit data
3. normalization preview data
```

Generated `notes.chart` is preferred because it reflects actual Clone Hero output.

## Modifier strategy

Base lanes:

```txt
0 kick
1 red
2 yellow
3 blue
4 green
```

Modifiers where available:

```txt
66 yellow cymbal
67 blue cymbal
68 green cymbal
34/35/36/37 accents
40/41/42/43 ghosts
```

If modifiers are unavailable in fallback data, show a clear limited state rather than inventing them.

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
highway appears
lanes render
notes move/sync with playback
hit line is visible
modifier states appear when data exists
limited states are clear
Validation and Generate pages still work
```

## Review policy

Final PR review is external and will be performed by Jon/ChatGPT.

The agent must not merge.
