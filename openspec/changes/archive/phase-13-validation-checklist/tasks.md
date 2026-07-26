# Tasks: Phase 13 — Validation Checklist / Pre-Generate Review

## 1. Read context

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/phases/13-validation-checklist/PRD.md`.
- [ ] Read `docs/phases/13-validation-checklist/ADR.md`.
- [ ] Read `docs/phases/13-validation-checklist/CHECKLIST.md`.
- [ ] Read `docs/phases/12-project-persistence-settings/PRD.md`.
- [ ] Read `docs/phases/11-desktop-generate-mvp/PRD.md`.
- [ ] Review visual references:
  - `docs/desktop/mockups/07-validation-checklist.png`
  - `docs/desktop/mockups/06-generate.png`
  - `docs/desktop/mockups/10-settings.png`
- [ ] Read these OpenSpec artifacts:
  - `proposal.md`
  - `design.md`
  - `specs/validation-checklist/spec.md`
  - `tasks.md`
  - `verify.md`

## 2. Sync context to Engram

- [ ] Save change ID: `phase-13-validation-checklist`.
- [ ] Save branch name: `feat/phase-13-validation-checklist`.
- [ ] Save issue number once created.
- [ ] Save scope: validation checklist/pre-generate review only.
- [ ] Save non-goals:
  - no preview/waveform/highway
  - no mapping overrides
  - no note editor
  - no packaging
  - no full UX polish
- [ ] Save rule: errors block generation; warnings/info do not.
- [ ] Save rule: Generate page must show validation/preflight.
- [ ] Save rule: Validation page must be real, not placeholder.
- [ ] Save review rule: final PR review is external by Jon/ChatGPT.
- [ ] Save merge rule: do not merge without Jon approval.

## 3. Inspect current implementation

- [ ] Inspect Phase 12 project/generate state services.
- [ ] Inspect current Validation page placeholder.
- [ ] Inspect Generate page.
- [ ] Inspect Settings FFmpeg diagnostic.
- [ ] Inspect project issues and merge summary shapes.
- [ ] Inspect path/missing path handling from Phase 12.
- [ ] Inspect existing tests.

## 4. Add validation types/helpers

- [ ] Add ValidationSeverity.
- [ ] Add ValidationCategory.
- [ ] Add ValidationItem.
- [ ] Add ValidationSummary.
- [ ] Add helper to count errors/warnings/info.
- [ ] Add helper to calculate `canGenerate`.

## 5. Add validation service

- [ ] Create DesktopValidationService or equivalent.
- [ ] Consume generate state.
- [ ] Consume project state.
- [ ] Consume settings/FFmpeg diagnostic state.
- [ ] Consume missing paths.
- [ ] Consume normalization/generation issues.
- [ ] Consume merge summary warnings.
- [ ] Return structured summary.

## 6. Add validation rules

- [ ] Missing source => error.
- [ ] Unsupported source => error.
- [ ] Missing source path after load => error.
- [ ] Missing audio => error.
- [ ] Missing audio path after load => error.
- [ ] Missing output folder => error.
- [ ] Missing selected tracks => error.
- [ ] Invalid offset => error.
- [ ] FFmpeg unavailable => error.
- [ ] Needs-regenerate => warning.
- [ ] Missing recommended metadata => warning.
- [ ] Existing known output files => warning if feasible.
- [ ] Impossible hand chord => warning.
- [ ] Multi-track merge conflict/duplicate => warning.
- [ ] Valid/current states => info where useful.

## 7. Implement Validation page

- [ ] Replace placeholder with real checklist.
- [ ] Show overall readiness.
- [ ] Show error/warning/info counts.
- [ ] Group or filter by severity/category.
- [ ] Show fix actions/routes where useful.
- [ ] Show last checked timestamp.
- [ ] Ensure content scrolls if long.

## 8. Integrate Generate page

- [ ] Show validation summary.
- [ ] Block generation when errors exist.
- [ ] Allow generation with warnings.
- [ ] Preserve overwrite confirmation.
- [ ] Preserve Phase 11/12 generation behavior.

## 9. Update project/docs if needed

- [ ] If validation summary is stored in `.chdg`, update schema docs/tests.
- [ ] Otherwise document that validation is recomputed.
- [ ] Update `docs/phases/13-validation-checklist/CHECKLIST.md`.

## 10. Tests

- [ ] Test missing source.
- [ ] Test unsupported source.
- [ ] Test missing audio.
- [ ] Test missing output folder.
- [ ] Test missing tracks.
- [ ] Test invalid offset.
- [ ] Test FFmpeg unavailable.
- [ ] Test warnings do not block.
- [ ] Test needs-regenerate warning.
- [ ] Test metadata warning.
- [ ] Test project issue/merge warnings.
- [ ] Test Generate page/preflight behavior where practical.
- [ ] Preserve existing tests.

## 11. Validate

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

Manual validation:

- [ ] Validation page renders.
- [ ] Missing source blocks generate.
- [ ] Missing audio blocks generate.
- [ ] Missing output blocks generate.
- [ ] Missing tracks blocks generate.
- [ ] Warnings do not block generate.
- [ ] Needs-regenerate warning appears.
- [ ] Valid project can generate.
- [ ] Existing Phase 12 save/load still works.

## 12. Git and PR

- [ ] Confirm branch is `feat/phase-13-validation-checklist`.
- [ ] Commit changes.
- [ ] Push branch.
- [ ] Create PR linked to issue when issue exists.
- [ ] Do not merge.
