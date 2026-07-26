# Proposal: Phase 16A — Project Mapping Overrides

## Change ID

`phase-16a-project-mapping-overrides`

## Summary

Add project-level mapping overrides for source notes/articulations.

This allows the user to correct source-specific mapping issues per project, persist those overrides in `.chdg`, and apply them during normalization/generation.

## Roadmap boundary

```txt
Phase 16A — Project Mapping Overrides
Phase 16B — Mapping Override Profiles
```

Do not implement Phase 16B in this change.

## Branch

```txt
feat/phase-16a-project-mapping-overrides
```

## Existing docs path

Use the existing repo docs folder:

```txt
docs/phases/16a-project-mapping-overrides/
```

Do not create a differently named Phase 16A docs folder.

## Goals

1. Add project-level mapping override data model.
2. Persist overrides in `.chdg`.
3. Show source notes/articulations where available.
4. Show automatic/current mapping where available.
5. Allow MIDI note number -> `DrumPiece` override.
6. Allow GPIF source/articulation key -> `DrumPiece` override.
7. Allow ignore override.
8. Allow reset to automatic/default.
9. Support sidestick -> snare or ignore.
10. Apply overrides during normalization/generation.
11. Mark preview/generated output stale or needs-regenerate when overrides change.
12. Preserve existing generation/validation/preview/offset behavior.
13. Preserve Electron security boundaries.

## Non-goals

- No global mapping profiles. That is Phase 16B.
- No Songsterr-specific profile system yet.
- No automatic ML mapping.
- No individual note editing.
- No manual note add/remove/move.
- No mapping community database.
- No cloud sync.
- No packaging/distribution.
- No full desktop UX polish pass.
- No external editor/Moonscraper dependency.

## Required docs to read

```txt
AGENTS.md
docs/desktop/README.md
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
docs/desktop/feature-inventory.md
docs/phases/16a-project-mapping-overrides/PRD.md
docs/phases/16a-project-mapping-overrides/ADR.md
docs/phases/16a-project-mapping-overrides/CHECKLIST.md
docs/phases/15-offset-adjustment-ui/PRD.md
docs/phases/14a-audio-waveform-timeline-preview/PRD.md
docs/phases/14b-clone-hero-highway-preview/PRD.md
```

Visual reference:

```txt
docs/desktop/mockups/09-mapping-overrides.png
```

If mockup text conflicts with docs/OpenSpec, docs/OpenSpec are canonical.

## Override semantics

Project-level override keys should distinguish source kind.

Recommended concepts:

```txt
MIDI note number -> DrumPiece
GPIF articulation/source key -> DrumPiece
ignore source note/articulation
sidestick -> snare or ignore
```

Persist musical `DrumPiece`, not Clone Hero lane/color names.

## Staleness behavior

Changing overrides should:

```txt
mark project dirty
mark output needs-regenerate if generated output exists
clear or mark normalization preview stale
make stale state visible to the user
```

## Validation

Required:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

Manual desktop validation:

```txt
open/create project
inspect/normalize source
add MIDI mapping override
add GPIF/source override where test data allows
ignore source note/articulation
reset override
save/reopen project
override persists
normalization/generation uses override
generated output becomes stale/needs-regenerate after changes
Validation/Generate/Preview/Offset still work
```

## Review policy

Final PR review is external and will be performed by Jon/ChatGPT.

The agent must not merge.
