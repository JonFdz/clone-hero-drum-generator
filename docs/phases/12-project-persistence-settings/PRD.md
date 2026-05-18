# PRD Phase 12: Project Persistence + Settings

## Goal

Introduce `.chdg` project files, recent projects, and local settings.

## Visual references

```txt
docs/desktop/mockups/02-projects-library.png
docs/desktop/mockups/10-settings.png
```

Also read:

```txt
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
```

## Scope

- Define `.chdg` JSON schema.
- Save/load project state.
- Store absolute source/audio/output paths initially.
- Default project location under `~/Documents/CHDG Projects`.
- Store selected tracks, metadata, offset, status.
- Add recent projects.
- Add settings for output folder, project location, default charter, default offset, ffmpeg path.
- Validate ffmpeg path/PATH availability.

## Non-goals

- No bundle format yet.
- No file association/double-click opening yet.
- No cloud sync.
- No copied audio/source assets by default.

## Notes

This phase should preserve existing CLI/backend behavior unless explicitly extending it.

Final PR review is external and PRs must not be merged without explicit approval.
