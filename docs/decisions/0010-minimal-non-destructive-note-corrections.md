# ADR 0010: Minimal Non-Destructive Note Corrections

## Status

Accepted.

## Decision

Imported hits remain immutable. V1 persists per-hit overlays for piece, target, accent, ghost, and delete.

Exclude add, move, timing, duration, batch, tempo, and Expert+ kick editing.

## Rationale

CHDG fixes conversion-specific differences. Structural authoring remains in Guitar Pro.

## Consequences

Stable hit IDs are mandatory; deletion is reversible; individual corrections override mappings; every exported note has length 0.
