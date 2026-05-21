# Checklist Phase 15: Offset Adjustment Loop

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/phases/14a-audio-waveform-timeline-preview/PRD.md`.
- [ ] Read `docs/phases/14b-clone-hero-highway-preview/PRD.md`.
- [ ] Read this phase PRD.
- [ ] Read this phase ADR.
- [ ] Review visual reference:
  - `docs/desktop/mockups/08-preview-offset.png`
- [ ] Read OpenSpec:
  - `openspec/changes/phase-15-offset-adjustment-loop/proposal.md`
  - `openspec/changes/phase-15-offset-adjustment-loop/design.md`
  - `openspec/changes/phase-15-offset-adjustment-loop/tasks.md`
  - `openspec/changes/phase-15-offset-adjustment-loop/verify.md`
  - `openspec/changes/phase-15-offset-adjustment-loop/specs/offset-adjustment-loop/spec.md`

## Implementation

- [ ] Implement only Phase 15 scope.
- [ ] Add Chart Offset controls to Preview page.
- [ ] Show saved offset.
- [ ] Show preview offset.
- [ ] Show delta from saved offset.
- [ ] Add quick nudge buttons.
- [ ] Add manual ms input.
- [ ] Add reset/revert.
- [ ] Add apply/save.
- [ ] Preview offset updates timeline notes live.
- [ ] Preview offset updates highway notes live.
- [ ] Apply/save updates project offset.
- [ ] Apply/save updates generated `notes.chart` `[Song] Offset`.
- [ ] Do not shift note ticks.
- [ ] Do not modify audio.
- [ ] Preserve Phase 14A/14B preview.
- [ ] Preserve validation/generation/project behavior.
- [ ] Preserve Electron security boundaries.
- [ ] Add/update tests.

## Validation

- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm --filter @chdg/desktop build` passes.
- [ ] `pnpm --filter @chdg/desktop typecheck` passes.
- [ ] `pnpm chdg --help` passes.
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

- [ ] No automatic offset detection.
- [ ] No note editing.
- [ ] No mapping overrides.
- [ ] No packaging.
- [ ] No full UX polish pass.
- [ ] Do not implement future phases unless explicitly approved.
