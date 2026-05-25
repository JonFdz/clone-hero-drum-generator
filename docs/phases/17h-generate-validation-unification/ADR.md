# ADR — Unify Validation into Generate

## Status

Accepted for Phase 17H.

## Context

CHDG previously exposed Generate and Validation as separate desktop pages. The user flow has since been simplified by unifying Inspect Source, Track Selection, and Mapping into Source Review. The next logical simplification is to make validation part of Generate.

The current Generate page already depends on `DesktopValidationService` and validates before generating. The standalone Validation page mostly duplicates readiness information in a more detailed checklist.

## Decision

Keep **Generate** as the user-facing screen and `/generate` as the canonical route. Move the useful Validation page content into Generate, then remove the standalone Validation page/component. Keep only a compatibility redirect from `/validation` to `/generate`.

Generate will contain:

- Validation Report;
- Generation Configuration;
- QA Checklist;
- Generation Steps;
- Generation Log;
- Output Files Preview;
- bottom action bar.

## Consequences

### Positive

- Simplifies sidebar and user flow.
- Reduces duplicate validation UI.
- Keeps generation readiness near the generation action.
- Matches the new `Source Review → Generate → Preview` flow.

### Negative / Risks

- Generate page can become visually dense if validation, logs, steps, and output all compete for attention.
- Removing Validation page requires careful route/link/fix-action cleanup.
- Autosave after generation must not cause regenerate/validation loops.

## Alternatives considered

### Keep Generate and Validation separate

Rejected. It preserves duplication and a more complex workflow.

### Rename screen to Build Package

Rejected by product decision. The user-facing name remains `Generate`.

### Create `/build-package`

Rejected for this phase. `/generate` remains canonical.

### Add real-time generation progress IPC

Deferred. This phase can show pending/running/completed states based on existing state/logs/results.

## Implementation guidance

- Keep `DesktopValidationService` for validation logic.
- Prefer keeping `GeneratePageComponent` as the component name to avoid unnecessary refactor churn.
- Remove `ValidationPageComponent` only after its useful UI has been migrated.
- Keep `/validation` as a route redirect, not a functional standalone page.
- Do not leave dead links such as `Open full validation checklist`.
