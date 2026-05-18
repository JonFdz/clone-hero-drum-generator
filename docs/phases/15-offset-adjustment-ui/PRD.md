# PRD Phase 15: Offset Adjustment UI

## Goal

Allow users to adjust chart offset visually using the internal preview.

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

- Show current chart offset in ms.
- Add nudge controls ±10/±50/±100 ms.
- Add direct offset input.
- Preview offset live without writing files.
- Save offset by updating `.chart` `[Song]` `Offset` seconds and project state.
- Mark generation/validation/preview as outdated when inputs change.

## Non-goals

- No automatic offset detection.
- No note tick shifting.
- No individual note editing.
- No tempo map editing.

## Notes

This phase should preserve existing CLI/backend behavior unless explicitly extending it.

Final PR review is external and PRs must not be merged without explicit approval.
