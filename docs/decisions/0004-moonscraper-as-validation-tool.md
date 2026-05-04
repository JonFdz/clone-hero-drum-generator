# ADR: Use Moonscraper as validation tool, not runtime dependency

## Status

Accepted.

## Decision

CHDG generates files; Moonscraper is used manually to inspect and validate those files. CHDG should not automate or embed Moonscraper.

## Consequences

Positive:

- Keeps scope controlled.
- Keeps agent tasks easier to review.
- Avoids premature UI/runtime complexity.

Negative:

- Some manual validation remains necessary.
- Some future features may require revisiting this decision.
