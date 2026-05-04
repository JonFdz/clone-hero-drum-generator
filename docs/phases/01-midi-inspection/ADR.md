# ADR Phase 01: MIDI Inspection

## Status

Proposed for implementation.

## Context

CHDG has multiple failure points: MIDI parsing, timing, mapping, chart encoding and validation. This phase isolates one part of that pipeline.

## Decision

Implement only Phase 01: MIDI Inspection, as described in this folder's PRD.

## Rationale

Small phases make agent changes easier to review and make it easier to identify where generated chart errors are introduced.

## Consequences

Positive:

- Clear scope.
- Clear validation.
- Easier debugging.

Negative:

- Some useful behavior remains incomplete until later phases.
- Manual validation remains required for chart correctness.
