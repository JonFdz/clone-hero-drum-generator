# PRD Phase 17: Desktop Packaging / Multiplatform Distribution

## Goal

Package CHDG Desktop for Windows, macOS, and Linux.

## Visual references

```txt
docs/desktop/mockups/10-settings.png
```

Also read:

```txt
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
```

## Scope

- Define packaging toolchain.
- Build Windows package.
- Build macOS package.
- Build Linux package.
- Handle ffmpeg strategy per platform.
- Document platform-specific setup.
- Consider file association only if `.chdg` format is stable enough.

## Non-goals

- No app store release.
- No cloud updater unless explicitly chosen.
- No `.chdg` bundle requirement unless planned.

## Notes

This phase should preserve existing CLI/backend behavior unless explicitly extending it.

Final PR review is external and PRs must not be merged without explicit approval.
