# ADR Phase 04: Manual Validation Setup

## Status

Accepted as setup phase

## Context

Phase 03 can generate `notes.chart` and `song.ini`, and an initial Moonscraper check showed that the chart opens and displays `ExpertDrums`.

However, full manual validation should not be considered complete yet because:

- audio packaging is not implemented;
- the current process still requires manual audio conversion/copying;
- Pro Drums cymbal flags are not implemented;
- the main demo source is being changed from Stairway to Eat My Dust;
- future validation should happen against a complete local song folder.

## Decision

Treat Phase 04 as a manual validation setup phase.

The checklist and validation process exist now, but full Moonscraper/Clone Hero validation is deferred until after:

1. audio packaging can generate/copy `song.ogg`;
2. the new demo source is in use;
3. Pro Drums cymbal flags are implemented.

## Rationale

This avoids repeatedly validating an incomplete package while still preserving the useful discovery that Phase 03 output is structurally readable by Moonscraper.

## Consequences

Positive:

- Validation work remains documented.
- The project can move to the next practical implementation phases.
- Full validation will happen with a more realistic package.

Negative:

- Phase 04 remains partially pending.
- Some visual/game validation risks remain open until audio packaging and Pro Drums flags are complete.
