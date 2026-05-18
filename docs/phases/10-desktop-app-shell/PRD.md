# PRD Phase 10: Desktop App Shell

## Goal

Create the first Electron + Angular desktop shell for CHDG.

## Visual references

```txt
docs/desktop/mockups/01-home-dashboard.png
docs/desktop/mockups/10-settings.png
```

Also read:

```txt
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
```

## Scope

- Add `apps/desktop`.
- Use Electron + Angular.
- Implement secure Electron preload bridge.
- Implement dark-mode desktop shell.
- Add sidebar routes for Home, Projects, New Project, Inspect Source, Track Selection, Generate, Validation, Preview, Mapping, Settings.
- Add backend health check/status.
- Keep feature pages as placeholders unless trivial.
- Prepare styling so light mode can be added later.

## Non-goals

- No full generation workflow.
- No project persistence.
- No multi-track UI.
- No preview player.
- No packaging installer.

## Notes

This phase should preserve existing CLI/backend behavior unless explicitly extending it.

Final PR review is external and PRs must not be merged without explicit approval.
