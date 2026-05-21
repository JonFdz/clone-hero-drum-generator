# Checklist Phase 15: Offset Adjustment Loop

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/desktop/README.md`.
- [x] Read `docs/desktop/decisions.md`.
- [x] Read `docs/desktop/mockup-corrections.md`.
- [x] Read `docs/desktop/feature-inventory.md`.
- [x] Read `docs/phases/14a-audio-waveform-timeline-preview/PRD.md`.
- [x] Read `docs/phases/14b-clone-hero-highway-preview/PRD.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Review visual reference:
  - `docs/desktop/mockups/08-preview-offset.png`
- [x] Read OpenSpec:
  - `openspec/changes/phase-15-offset-adjustment-loop/proposal.md`
  - `openspec/changes/phase-15-offset-adjustment-loop/design.md`
  - `openspec/changes/phase-15-offset-adjustment-loop/tasks.md`
  - `openspec/changes/phase-15-offset-adjustment-loop/verify.md`
  - `openspec/changes/phase-15-offset-adjustment-loop/specs/offset-adjustment-loop/spec.md`

## Implementation

- [x] Implement only Phase 15 scope.
- [x] Add Chart Offset controls to Preview page.
- [x] Show saved offset.
- [x] Show preview offset.
- [x] Show delta from saved offset.
- [x] Add quick nudge buttons.
- [x] Add manual ms input.
- [x] Add reset/revert.
- [x] Add apply/save.
- [x] Preview offset updates timeline notes live.
- [x] Preview offset updates highway notes live.
- [x] Apply/save updates project offset.
- [x] Apply/save updates generated `notes.chart` `[Song] Offset`.
- [x] Do not shift note ticks.
- [x] Do not modify audio.
- [x] Preserve Phase 14A/14B preview.
- [x] Preserve validation/generation/project behavior.
- [x] Preserve Electron security boundaries.
- [x] Add/update tests.

## Validation

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] `pnpm --filter @chdg/desktop build` passes.
- [x] `pnpm --filter @chdg/desktop typecheck` passes.
- [x] `pnpm chdg --help` passes.
- [ ] Manual desktop validation recorded if relevant.

## Manual desktop smoke

- [ ] Open existing `.chdg` project with generated output.
- [ ] Preview page loads audio.
- [ ] Chart Offset controls are visible.
- [ ] Quick buttons update preview offset.
- [ ] Manual input updates preview offset.
- [ ] Timeline/highway alignment changes live.
- [ ] Reset/revert restores saved offset.
- [ ] Apply/save updates `.chdg` offset.
- [ ] Apply/save updates `notes.chart` `[Song] Offset`.
- [ ] `900 ms` becomes `0.9` in chart.
- [ ] Note/event ticks are unchanged.
- [ ] Validation page still works.
- [ ] Generate page still works.
- [ ] Project save/load still works.

## Deferred

- [x] No automatic offset detection.
- [x] No note editing.
- [x] No mapping overrides.
- [x] No packaging.
- [x] No full UX polish pass.
- [x] Do not implement future phases unless explicitly approved.
