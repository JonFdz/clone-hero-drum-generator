# ADR — Preview uses generated chart sections for navigation

## Context

Source Review can use `.chdg` analysis cache for persistence and fast reloading. Preview, however, represents the generated Clone Hero package and must use generated output files.

Phase 17K fixed generated GPIF section ticks. The next useful step is to make Preview show and navigate those generated sections.

## Decision

Preview Section Navigation will parse section markers from generated `notes.chart`.

It will not read sections from `.chdg` analysis cache, Source Review inspection data, or source GPIF/MIDI files.

## Rationale

This keeps Preview semantically correct: it shows what Clone Hero will see in the generated package.

## Consequences

### Positive

- Preview becomes easier to use for QA.
- Users can jump quickly to song parts.
- Sections are validated through the actual generated chart output.

### Negative / risks

- If generated `notes.chart` has no sections, Preview has no sections to show.
- If generated chart section parsing is incomplete, Preview may omit some sections.
- Section editor functionality remains a separate future phase.

## Future-compatible model

Section preview data should leave room for future sources:

```ts
source?: "generated-chart" | "manual" | "project-override"
```

For Phase 17K.1, only `"generated-chart"` is in scope.
