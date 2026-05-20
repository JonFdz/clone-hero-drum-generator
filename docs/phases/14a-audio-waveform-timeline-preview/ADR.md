# ADR Phase 14A: Audio + Waveform + Timeline Preview

## Status

Proposed.

## Decision

Implement Phase 14A as a read-only local preview foundation with audio playback, waveform/waveform-like overview, and timeline-style note visualization.

Do **not** implement the Clone Hero highway in this phase.

Do **not** implement the full persisted offset adjustment loop in this phase.

## Context

The current roadmap separates preview/offset work:

```txt
Phase 14A — Audio + Waveform + Timeline Preview
Phase 14B — Clone Hero Highway Preview
Phase 15  — Offset Adjustment Loop
```

An earlier planning draft accidentally combined Phase 14A and Phase 15. This ADR clarifies that Phase 14A is preview-only except for displaying current offset or temporary preview-only offset if trivial.

## Rationale

A simple preview layer is needed before highway and offset tooling.

The app should become increasingly self-sufficient and reduce dependency on external chart editors. However, implementing highway rendering and full offset editing at the same time would make the PR too broad.

## Audio preview decision

Use secure local preview access.

The renderer must request a preview source through the Electron bridge. Electron main must validate that the requested file belongs to the current project/generated output or is an already allowed selected audio path.

Preferred audio source order:

```txt
1. generated song.ogg
2. selected project audio fallback
```

## Visualization decision

Implement a timeline-style preview.

The visualization may be approximate or limited if precise seconds mapping is not available. In that case, the UI must communicate the limitation.

Waveform can be:

```txt
real decoded waveform if practical
lightweight waveform-like amplitude overview if simpler
clear limited state if unavailable
```

## Constraints

- Preserve existing backend/CLI behavior where possible.
- Keep PR scoped to Phase 14A.
- Do not introduce external service dependencies.
- Keep everything local/offline.
- Preserve Electron security boundaries.
- Read `docs/desktop/mockup-corrections.md` before treating mock text as canonical.
- Final PR review is external.
- PRs must not be merged without explicit approval.

## Consequences

Phase 14A creates the technical foundation for:

```txt
Phase 14B — Clone Hero highway preview
Phase 15  — persisted offset adjustment loop
```

Some preview limitations are acceptable in this phase if they are clearly surfaced to the user.
