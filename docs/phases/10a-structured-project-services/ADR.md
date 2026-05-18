# ADR Phase 10A: Structured Project Services + CLI --json

## Status

Proposed.

## Decision

Create `packages/project` as the shared orchestration layer and add machine-readable JSON outputs.

## Rationale

This phase supports the long-term direction of CHDG as a local, offline, self-sufficient desktop application.

## Constraints

- Preserve existing backend/CLI behavior where possible.
- Keep PRs scoped to the phase.
- Do not introduce external service dependencies.
- Read `docs/desktop/mockup-corrections.md` before treating mock text as canonical.
