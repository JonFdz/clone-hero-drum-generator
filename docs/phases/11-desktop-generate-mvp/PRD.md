# PRD Phase 11: Desktop Generate MVP

## Goal

Implement the first usable desktop workflow for generating a song package.

## Visual references

```txt
docs/desktop/mockups/03-new-project.png
docs/desktop/mockups/04-inspect-source.png
docs/desktop/mockups/05-track-selection.png
docs/desktop/mockups/06-generate.png
```

Also read:

```txt
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
```

## Scope

- New Project form.
- Native source/audio/output pickers.
- Auto-detect source type by extension.
- Audio required.
- Output subfolder generated from song/project name by default.
- Inspect source.
- Show track candidates and allow single/multi-track selection.
- Show combined summary.
- Generate package.
- Show logs and output files.
- Open output folder.

## Non-goals

- No waveform preview.
- No highway preview.
- No mapping overrides.
- No individual note editing.
- No external editor dependency.
- No chart-only flow unless explicitly added later.

## Notes

This phase should preserve existing CLI/backend behavior unless explicitly extending it.

Final PR review is external and PRs must not be merged without explicit approval.
