# Checklist — Phase 17H Generate + Validation Unification

## Setup

- [ ] Confirm Phase 17H docs and mockups are present.
- [ ] Confirm accepted OpenSpec is transferred to Engram before implementation.
- [ ] Confirm Engram is treated as source of truth after transfer.

## Routing / Navigation

- [ ] Sidebar shows `Generate`.
- [ ] Sidebar does not show `Validation`.
- [ ] `/generate` remains canonical Generate route.
- [ ] `/validation` redirects to `/generate`.
- [ ] Standalone Validation page/component is removed if no longer used.
- [ ] No dead links to `/validation` remain.
- [ ] No `Open full validation checklist` link remains.

## Generate page UI

- [ ] Header title is `Generate`.
- [ ] Header subtitle is `Validate project readiness and create the Clone Hero package.`
- [ ] Header status pill supports ready/warnings/blocked/generating/generated/failed.
- [ ] Validation Report card exists.
- [ ] Generation Configuration card exists.
- [ ] QA Checklist card exists.
- [ ] Generation Steps card exists.
- [ ] Generation Log card exists and is compact.
- [ ] Output Files Preview card exists.
- [ ] Bottom action bar exists.
- [ ] UI matches `12-generate-ready.png` for ready state.
- [ ] UI matches `12a-generate-complete.png` for generated state, with documented corrections.

## Validation behavior

- [ ] Validation runs automatically on page entry.
- [ ] Validation runs immediately before generation.
- [ ] Errors block generation.
- [ ] Warnings do not block generation.
- [ ] Info does not block generation.
- [ ] QA checklist rows have fix actions when available.
- [ ] QA checklist is compact when all checks pass.
- [ ] QA checklist has internal scroll when many items exist.

## Generation behavior

- [ ] `Start Generate` is disabled when blocking errors exist.
- [ ] `Start Generate` works when warnings only exist.
- [ ] Existing overwrite confirmation behavior remains.
- [ ] Generation Steps show pending/running/completed/failed states using existing state/logs/results.
- [ ] Generation Log shows logs with internal scroll.
- [ ] Output Files Preview appears after successful generation.
- [ ] `Open Preview` is enabled after successful generation.
- [ ] Generated state uses `Regenerate`, not `Start Generate`.

## Autosave

- [ ] Successful generation autosaves when `projectFilePath` exists.
- [ ] Autosave does not trigger generation again.
- [ ] Autosave does not mark generated output as needing regenerate by itself.
- [ ] Autosave failure is non-blocking and visible.

## Cleanup

- [ ] Remove unused imports/components/tests for standalone Validation page.
- [ ] Keep `DesktopValidationService` as validation logic source.
- [ ] Update fix routes to Source Review / Project Details / Settings / Generate as appropriate.
- [ ] No OpenSpec committed unless Jon explicitly asks.
- [ ] No temporary files committed.

## Validation commands

- [ ] `pnpm build`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm --filter @chdg/desktop build`
- [ ] `pnpm --filter @chdg/desktop typecheck`
- [ ] `pnpm chdg --help`

## Manual validation

- [ ] Ready state visually matches mockup.
- [ ] Blocked state disables generation and shows errors.
- [ ] Warnings allow generation.
- [ ] Generated state shows output files and Preview action.
- [ ] Sidebar is stable/fixed while scrolling.
- [ ] No standalone Validation UI remains.
