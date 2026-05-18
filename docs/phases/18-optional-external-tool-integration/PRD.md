# PRD Phase 18: Optional External Tool Integration

## Goal

Optionally support external chart editor integration without depending on it.

## Visual references

```txt
docs/desktop/mockups/07-validation.png
```

Also read:

```txt
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
```

## Scope

- Add optional external chart editor path setting.
- Open generated output/file with configured editor.
- Keep Open Output Folder and internal Preview as primary actions.
- Do not make any external editor required.

## Non-goals

- No Moonscraper-specific dependency.
- No blocking core workflow on external tools.
- No platform-specific editor assumptions.

## Notes

This phase should preserve existing CLI/backend behavior unless explicitly extending it.

Final PR review is external and PRs must not be merged without explicit approval.
