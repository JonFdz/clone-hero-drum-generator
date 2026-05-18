# PRD Phase 14B: Clone Hero Highway Preview

## Goal

Add a Clone Hero-style note highway preview.

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

- Render lanes in a Clone Hero-like view.
- Show cymbal/open hi-hat/accent/ghost states.
- Sync highway to audio playback.
- Reuse generated chart model.
- Keep this as preview, not a full editor.

## Non-goals

- No exact Clone Hero clone.
- No note editing.
- No gameplay/scoring.
- No external editor dependency.

## Notes

This phase should preserve existing CLI/backend behavior unless explicitly extending it.

Final PR review is external and PRs must not be merged without explicit approval.
