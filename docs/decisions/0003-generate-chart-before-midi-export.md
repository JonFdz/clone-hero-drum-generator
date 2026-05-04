# ADR: Generate `.chart` before `.mid` export

## Status

Accepted.

## Decision

Generate text-based `notes.chart` first because it is inspectable, diffable and easy to validate in Moonscraper.

## Consequences

Positive:

- Keeps scope controlled.
- Keeps agent tasks easier to review.
- Avoids premature UI/runtime complexity.

Negative:

- Some manual validation remains necessary.
- Some future features may require revisiting this decision.
