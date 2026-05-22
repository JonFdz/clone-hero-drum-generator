# ADR Phase 16A: Project Mapping Overrides

## Status

Proposed.

## Decision

Implement project-level mapping overrides for source notes/articulations.

Overrides are saved in the `.chdg` project and applied during normalization/generation.

This phase does not implement global profiles or individual note editing.

## Roadmap boundary

```txt
Phase 16A — Project Mapping Overrides
Phase 16B — Mapping Override Profiles
```

Phase 16A is project-scoped only.

## Existing docs path

Use:

```txt
docs/phases/16a-project-mapping-overrides/
```

Do not rename this folder and do not create another Phase 16A docs folder.

## Context

Different sources can use different MIDI note numbers or GPIF articulations for the same drum piece.

Automatic mapping is useful, but real files will need per-project corrections, especially during early Songsterr-based testing.

## Rationale

Project-level overrides are the safest next step because:

```txt
they solve real local cases
they do not require global profile design too early
they keep corrections attached to the project
they avoid overfitting fake Songsterr profiles before enough real cases exist
```

## Decision details

Supported initial override concepts:

```txt
MIDI note number -> DrumPiece
GPIF articulation/source key -> DrumPiece
ignore source note/articulation
sidestick -> snare or ignore
```

The persisted target should be musical `DrumPiece`, not Clone Hero lane/color.

## Persistence decision

Persist overrides in `.chdg`.

Existing projects without overrides must still load.

If a schema version bump is needed, add a simple migration/default behavior.

## Normalization decision

Overrides apply before/inside normalization so that downstream systems receive corrected `DrumHit` data.

Expected logic:

```txt
if override target is ignore -> skip
if override target is piece -> use that piece
otherwise -> automatic mapping
```

## Staleness decision

Changing overrides makes previous normalization/generation potentially stale.

At minimum, mark project dirty and generated output `needs-regenerate` when relevant.

If automatic re-normalization is simple it may be added, but it is not required.

## Security decision

No new filesystem permissions should be needed for project mapping overrides beyond existing project save/load.

The renderer must not gain direct filesystem access.

## Non-goals

- No global profiles.
- No Songsterr profile system.
- No ML/automatic mapping training.
- No individual note editing.
- No manual note add/remove/move.
- No mapping community database.
- No packaging/distribution.
- No broad UX polish pass.

## Constraints

- Keep everything local/offline.
- Preserve existing CLI/backend behavior unless explicitly extending project-based workflows.
- Preserve validation/generation/preview/offset behavior.
- Keep PR scoped to Phase 16A.
- Final PR review is external.
- PRs must not be merged without explicit approval.
