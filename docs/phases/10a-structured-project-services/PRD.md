# PRD Phase 10A: Structured Project Services + CLI --json

## Goal

Create `packages/project` as the shared orchestration layer and add machine-readable JSON outputs.

## Visual references

```txt
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

- Add `packages/project`.
- Define DTOs for inspection, normalization preview, generation result, validation result and warnings.
- Expose high-level functions for CLI and desktop.
- Add `--json` to key CLI commands.
- Ensure JSON mode emits clean JSON.
- Keep human CLI output working.

## Non-goals

- No desktop generation UI.
- No preview player.
- No validation checklist UI.
- No project persistence yet unless needed for DTO shape.

## Notes

This phase should preserve existing CLI/backend behavior unless explicitly extending it.

Final PR review is external and PRs must not be merged without explicit approval.
