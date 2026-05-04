# ADR: Use pnpm workspaces and a TypeScript monorepo

## Status

Accepted.

## Decision

Use pnpm workspaces so CLI and future web UI can share packages while keeping strict dependencies and clear architecture boundaries.

## Consequences

Positive:

- Keeps scope controlled.
- Keeps agent tasks easier to review.
- Avoids premature UI/runtime complexity.

Negative:

- Some manual validation remains necessary.
- Some future features may require revisiting this decision.
