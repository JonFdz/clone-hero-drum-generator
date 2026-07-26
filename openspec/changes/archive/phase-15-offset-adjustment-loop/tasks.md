# Tasks: Phase 15 — Offset Adjustment Loop

## 1. Read context

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/phases/15-offset-adjustment-loop/PRD.md`.
- [ ] Read `docs/phases/15-offset-adjustment-loop/ADR.md`.
- [ ] Read `docs/phases/15-offset-adjustment-loop/CHECKLIST.md`.
- [ ] Read `docs/phases/14a-audio-waveform-timeline-preview/PRD.md`.
- [ ] Read `docs/phases/14b-clone-hero-highway-preview/PRD.md`.
- [ ] Review visual reference:
  - `docs/desktop/mockups/08-preview-offset.png`
- [ ] Read OpenSpec artifacts:
  - `proposal.md`
  - `design.md`
  - `specs/offset-adjustment-loop/spec.md`
  - `tasks.md`
  - `verify.md`

## 2. Sync context to Engram

- [ ] Save change ID: `phase-15-offset-adjustment-loop`.
- [ ] Save branch name: `feat/phase-15-offset-adjustment-loop`.
- [ ] Save issue number once created.
- [ ] Save roadmap split: 14A timeline, 14B highway, 15 offset loop.
- [ ] Save scope: offset adjustment loop only.
- [ ] Save offset semantics: UI ms, chart seconds.
- [ ] Save rule: offset does not shift note/event ticks.
- [ ] Save rule: offset does not modify audio.
- [ ] Save rule: preview offset is live and does not write until apply/save.
- [ ] Save non-goals: no auto detection, no note editing, no mapping overrides, no packaging.
- [ ] Save security rule: no generic file writes.
- [ ] Save review rule: final PR review external by Jon/ChatGPT.
- [ ] Save merge rule: do not merge without Jon approval.

## 3. Inspect current implementation

- [ ] Inspect Preview page.
- [ ] Inspect DesktopPreviewService.
- [ ] Inspect highway/timeline timing helpers.
- [ ] Inspect project/generate offset state.
- [ ] Inspect project save/load offset behavior.
- [ ] Inspect generated chart writer.
- [ ] Inspect Electron bridge path validation.
- [ ] Inspect tests.

## 4. Add offset preview state/helpers

- [ ] Add saved offset state.
- [ ] Add preview offset state.
- [ ] Add dirty calculation.
- [ ] Add ms to chart seconds helper.
- [ ] Add visual timing helper using preview offset.
- [ ] Add reset/revert helper.
- [ ] Add validation for finite offset values.

## 5. Integrate preview timing

- [ ] Timeline notes use preview offset.
- [ ] Highway notes use preview offset.
- [ ] Near-current highlight uses preview offset.
- [ ] Audio playback is not shifted.
- [ ] Note/event ticks are not shifted.

## 6. Add UI controls

- [ ] Add Chart Offset card/section.
- [ ] Show saved offset.
- [ ] Show preview offset.
- [ ] Show delta.
- [ ] Add quick nudge buttons.
- [ ] Add manual ms input.
- [ ] Add reset/revert.
- [ ] Add apply/save.
- [ ] Add clear explanation that chart offset changes `notes.chart` Offset.
- [ ] Show error/status messages.

## 7. Add secure chart offset apply

- [ ] Add narrow Electron bridge method.
- [ ] Validate chart path is `notes.chart`.
- [ ] Validate chart belongs to allowed output folder.
- [ ] Validate offset is finite.
- [ ] Update only `[Song] Offset`.
- [ ] Preserve all note/event ticks.
- [ ] Return structured result/error.

## 8. Persist project state

- [ ] Applying offset updates DesktopGenerateState offsetMs.
- [ ] Applying offset persists through `.chdg` save/load.
- [ ] Applying offset updates generated chart if available.
- [ ] Handle generated chart missing gracefully.
- [ ] Preserve validation/generation behavior.

## 9. Tests

- [ ] Test ms to seconds conversion.
- [ ] Test positive offset chart write.
- [ ] Test negative offset chart write.
- [ ] Test existing Offset replacement.
- [ ] Test Offset insertion if missing.
- [ ] Test notes/events unchanged.
- [ ] Test invalid offset rejected.
- [ ] Test arbitrary chart path rejected where practical.
- [ ] Test preview timing helper.
- [ ] Test reset/apply state behavior.
- [ ] Preserve existing tests.

## 10. Validate

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

- [ ] Open existing `.chdg` project with generated output.
- [ ] Preview page loads audio/highway.
- [ ] Quick nudge changes preview offset.
- [ ] Manual input changes preview offset.
- [ ] Timeline/highway alignment changes live.
- [ ] Reset restores saved offset.
- [ ] Apply/save updates `.chdg`.
- [ ] Apply/save updates `notes.chart`.
- [ ] `900 ms` writes `0.9`.
- [ ] Ticks are unchanged.
- [ ] Validation still works.
- [ ] Generate still works.

## 11. Docs/checklist

- [ ] Update `docs/phases/15-offset-adjustment-loop/CHECKLIST.md`.
- [ ] Update PRD/ADR if implementation differs.
- [ ] Do not mark future phase work complete.

## 12. Git and PR

- [ ] Confirm branch is `feat/phase-15-offset-adjustment-loop`.
- [ ] Commit changes.
- [ ] Push branch.
- [ ] Create PR linked to issue.
- [ ] Do not merge.
