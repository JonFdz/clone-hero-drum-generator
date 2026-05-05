# ADR 0005: Use Vitest for Tests

## Status

Accepted

## Decision

Vitest is accepted as the test framework for CHDG.

## Rationale

- The project uses TypeScript with ESM in a pnpm monorepo, which Vitest supports natively.
- A future Vite-based frontend would share the same test tooling.
- Tests focus on pure logic with fake in-memory data, so a fast, lightweight runner is ideal.
- Vitest requires minimal configuration and runs natively with ESM.

## Consequences

- **Positive**: Minimal config, fast runs, native ESM support, consistent tooling if a Vite frontend is added later.
- **Negative**: Brief onboarding for team members unfamiliar with Vitest (instead of Jest).
