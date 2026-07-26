# Proposal: Phase 15 — Offset Adjustment Loop

## Change ID

`phase-15-offset-adjustment-loop`

## Summary

Add an in-app chart offset adjustment loop to CHDG Desktop.

Phase 14A/14B added local audio, timeline, and highway preview. Phase 15 lets the user nudge chart offset in milliseconds, preview alignment live, and apply the offset safely to project state and generated `notes.chart`.

## Roadmap boundary

```txt
Phase 14A — Audio + Waveform + Timeline Preview
Phase 14B — Clone Hero Highway Preview
Phase 15  — Offset Adjustment Loop
```

## Goals

1. Add Chart Offset controls to the Preview page.
2. Show saved offset in milliseconds.
3. Show preview offset in milliseconds.
4. Show delta from saved offset.
5. Add quick nudge buttons:
   - `-100 ms`
   - `-50 ms`
   - `-10 ms`
   - `+10 ms`
   - `+50 ms`
   - `+100 ms`
6. Add manual offset input in milliseconds.
7. Add reset/revert to saved offset.
8. Apply preview offset live to timeline/highway note timing.
9. Apply/save offset to project state.
10. Apply/save offset to generated `notes.chart` `[Song] Offset` when generated output exists.
11. Convert milliseconds to chart seconds.
12. Preserve note/event ticks.
13. Preserve audio file.
14. Preserve validation/generation/project behavior.
15. Preserve Electron security boundaries.

## Non-goals

- No automatic offset detection.
- No beat/onset analysis.
- No audio stretching/time manipulation.
- No note editing.
- No manual note add/remove/move.
- No mapping override UI.
- No mapping profiles.
- No gameplay/scoring.
- No packaging/distribution.
- No full desktop UX polish pass.
- No external editor/Moonscraper dependency.

## Branch

```txt
feat/phase-15-offset-adjustment-loop
```

## Required docs to read

```txt
docs/desktop/README.md
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
docs/desktop/feature-inventory.md
docs/phases/15-offset-adjustment-loop/PRD.md
docs/phases/15-offset-adjustment-loop/ADR.md
docs/phases/15-offset-adjustment-loop/CHECKLIST.md
docs/phases/14a-audio-waveform-timeline-preview/PRD.md
docs/phases/14b-clone-hero-highway-preview/PRD.md
docs/phases/13-validation-checklist/PRD.md
docs/phases/12-project-persistence-settings/PRD.md
```

Visual reference:

```txt
docs/desktop/mockups/08-preview-offset.png
```

If mockup text conflicts with docs/OpenSpec, docs/OpenSpec are canonical.

## Offset semantics

```txt
UI: milliseconds
notes.chart: seconds
900 ms -> 0.9
-120 ms -> -0.12
```

Offset is stored in `notes.chart` `[Song]` `Offset`.

Offset does not shift note/event ticks.

Offset does not modify audio.

## Preview model

Use:

```txt
savedOffsetMs
previewOffsetMs
offsetDirty
```

Preview uses `previewOffsetMs`.

Generated/project output changes only when the user confirms apply/save.

## Secure apply/save

Use a narrow Electron bridge method for updating generated chart offset.

The handler must validate:

```txt
target file is notes.chart
target chart belongs to allowed output folder
offset is finite
only [Song] Offset is changed
```

Do not expose arbitrary file writes.

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
Preview page loads audio/highway
quick buttons update preview offset
manual input updates preview offset
timeline/highway alignment changes live
reset restores saved offset
apply/save updates .chdg offset
apply/save updates notes.chart Offset
900 ms writes 0.9
note/event ticks remain unchanged
Validation and Generate pages still work
```

## Review policy

Final PR review is external and will be performed by Jon/ChatGPT.

The agent must not merge.
