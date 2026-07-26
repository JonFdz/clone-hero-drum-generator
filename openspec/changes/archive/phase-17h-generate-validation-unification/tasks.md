# Tasks: Phase 17H Generate + Validation Unification

## 0. Engram / prerequisites

- [ ] Read accepted OpenSpec.
- [ ] Transfer accepted decisions, requirements, constraints, and validation rules into Engram.
- [ ] Confirm Engram is aligned before implementation.
- [ ] Verify required files exist:
  - `docs/phases/17h-generate-validation-unification/README.md`
  - `docs/phases/17h-generate-validation-unification/PRD.md`
  - `docs/phases/17h-generate-validation-unification/ADR.md`
  - `docs/phases/17h-generate-validation-unification/COMPONENTS.md`
  - `docs/phases/17h-generate-validation-unification/CHECKLIST.md`
  - `docs/desktop/mockups/12-generate-ready.png`
  - `docs/desktop/mockups/12a-generate-complete.png`
- [ ] If any required file is missing, stop and report it.

## 1. Routing/sidebar cleanup

- [ ] Remove `Validation` from sidebar nav.
- [ ] Keep `Generate` sidebar item pointing to `/generate`.
- [ ] Route `/validation` redirects to `/generate`.
- [ ] Remove standalone Validation component route.
- [ ] Remove dead links to `/validation`.
- [ ] Update fix actions/routes where necessary.

## 2. Generate UI redesign

- [ ] Implement unified Generate header/status.
- [ ] Add/migrate Validation Report card.
- [ ] Add/migrate QA Checklist card.
- [ ] Refine Generation Configuration card.
- [ ] Add/refine Generation Steps card.
- [ ] Add/refine compact Generation Log card.
- [ ] Add/refine Output Files Preview card.
- [ ] Add unified bottom action bar.
- [ ] Match `12-generate-ready.png` for ready state.
- [ ] Match `12a-generate-complete.png` for generated state, applying known corrections.

## 3. Validation behavior

- [ ] Run validation on Generate page entry.
- [ ] Run validation before generation.
- [ ] Disable Start Generate on blocking errors.
- [ ] Allow Start Generate with warnings/info.
- [ ] Keep fix actions working.
- [ ] Ensure QA checklist has internal scroll and severity/category display.

## 4. Generation behavior

- [ ] Preserve current generation bridge/service call.
- [ ] Preserve current overwrite confirmation behavior.
- [ ] Show pending/running/completed/failed generation steps from existing state/result.
- [ ] Show logs with compact scroll behavior.
- [ ] Show output files after success.
- [ ] Enable Open Preview after success.
- [ ] Change Start Generate label to Regenerate after success.

## 5. Autosave

- [ ] Autosave generation result when `projectFilePath` exists.
- [ ] Avoid validation/generation loops.
- [ ] Do not mark generated result as needing regenerate by saving generation metadata.
- [ ] Show non-blocking autosave warning if save fails.

## 6. Remove dead Validation UI code

- [ ] Delete `ValidationPageComponent` if unused.
- [ ] Delete/adjust tests tied to removed standalone page.
- [ ] Keep `DesktopValidationService`.
- [ ] Keep compatibility redirect only.

## 7. Tests

- [ ] Sidebar test: Generate exists, Validation does not.
- [ ] Route test: `/validation` redirects to `/generate`.
- [ ] Generate validation behavior: errors block, warnings allow.
- [ ] Generated state behavior: output preview and Open Preview enabled.
- [ ] Autosave behavior after generation, if testable.

## 8. Validation commands

- [ ] `pnpm build`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm --filter @chdg/desktop build`
- [ ] `pnpm --filter @chdg/desktop typecheck`
- [ ] `pnpm chdg --help`

## 9. Manual validation

- [ ] Ready state screenshot reviewed against mockup.
- [ ] Generated state screenshot reviewed against mockup.
- [ ] Blocked state checked manually.
- [ ] Sidebar and route cleanup checked manually.
- [ ] Open Preview action works after generation.
- [ ] No final review performed by implementing agent.
