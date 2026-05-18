# PRD Phase 10B: Multi-track Normalization / Generation

## Goal

Support selecting and merging multiple complementary drum tracks for one generated output.

## Visual references

```txt
docs/desktop/mockups/05-track-selection.png
```

Also read:

```txt
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
```

## Scope

- Add CLI `--tracks 3,10` while preserving `--track 3`.
- Support multi-track for MIDI and GPIF where feasible.
- Merge selected tracks into combined `DrumHit[]`.
- Deduplicate identical hits.
- Preserve source trace for hits.
- Warn on impossible hand chords.
- Keep open hi-hat priority over closed hi-hat when conflicting.
- Add structured combined summary for UI.
- Do not average timing/velocity unless explicitly specified in this phase.

## Non-goals

- No visual multi-track editor.
- No aggressive automatic deletion of impossible chords.
- No individual note editing.
- No mapping override UI.

## Notes

This phase should preserve existing CLI/backend behavior unless explicitly extending it.

Final PR review is external and PRs must not be merged without explicit approval.
