# PRD Phase 16A: Project Mapping Overrides

## Goal

Allow project-level mapping overrides for source notes/articulations.

## Visual references

```txt
docs/desktop/mockups/09-mapping-overrides.png
```

Also read:

```txt
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
```

## Scope

- Show source notes/articulations and current mappings.
- Allow MIDI note number -> DrumPiece override.
- Allow GPIF source/articulation key -> DrumPiece override.
- Allow ignore.
- Allow sidestick -> snare or ignore.
- Apply overrides during normalization.
- Save overrides in `.chdg` project.

## Non-goals

- No global profiles yet.
- No individual note editing.
- No automatic ML mapping.
- No community profile database.
- Avoid misleading lane/color labels until mapping is confirmed.

## Notes

This phase should preserve existing CLI/backend behavior unless explicitly extending it.

Final PR review is external and PRs must not be merged without explicit approval.
