# CHDG Design V1 Handoff

This directory translates the approved Pencil design into reviewable,
implementation-facing records. Pencil remains the visual source of truth.

## Review order

For the active Simplified V1 D2 visual checkpoint, start with:

1. [`visual-direction-review/simplified-v1-d2-four-anchor-comparison.md`](visual-direction-review/simplified-v1-d2-four-anchor-comparison.md)
2. [`simplified-v1-d2-1440-validation.md`](simplified-v1-d2-1440-validation.md)
3. [`simplified-v1-d2-1440-frame-inventory.md`](simplified-v1-d2-1440-frame-inventory.md)

The historical Design V1 handoff order remains:

1. [`../decisions/design-v1-rationale.md`](../decisions/design-v1-rationale.md)
2. [`state-matrix.md`](state-matrix.md)
3. [`screen-scenario-map.md`](screen-scenario-map.md)
4. [`component-inventory.md`](component-inventory.md)
5. [`implementation-sequence.md`](implementation-sequence.md)
6. [`follow-up-issues.md`](follow-up-issues.md)
7. [`validation-report.md`](validation-report.md)

## Boundary

- Preserve current routes and capabilities.
- Treat interaction proposals as proposals until implementation approval.
- Do not infer product behavior from visual treatment.
- Keep retry scope, downstream invalidation, running-output safety,
  save-state transitions, and audio-backed Preview behavior unresolved.
- Use the browser harness for current behavior and `design/chdg-ui.pen` for V1.
