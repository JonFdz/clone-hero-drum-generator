# Checklist Phase 14B: Clone Hero Highway Preview

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/phases/14a-audio-waveform-timeline-preview/PRD.md`.
- [ ] Read `docs/phases/14a-audio-waveform-timeline-preview/ADR.md`.
- [ ] Read this phase PRD.
- [ ] Read this phase ADR.
- [ ] Review visual reference:
  - `docs/desktop/mockups/08-preview-offset.png`
- [ ] Read OpenSpec:
  - `openspec/changes/phase-14b-clone-hero-highway-preview/proposal.md`
  - `openspec/changes/phase-14b-clone-hero-highway-preview/design.md`
  - `openspec/changes/phase-14b-clone-hero-highway-preview/tasks.md`
  - `openspec/changes/phase-14b-clone-hero-highway-preview/verify.md`
  - `openspec/changes/phase-14b-clone-hero-highway-preview/specs/clone-hero-highway-preview/spec.md`

## Implementation

- [ ] Implement only Phase 14B scope.
- [ ] Add highway section to Preview page.
- [ ] Reuse Phase 14A audio/playback state.
- [ ] Reuse generated chart preview data where available.
- [ ] Render kick/red/yellow/blue/green lanes.
- [ ] Render notes relative to current audio time.
- [ ] Render visible hit line.
- [ ] Represent cymbals where available.
- [ ] Represent open hi-hat where available.
- [ ] Represent accent/ghost where available.
- [ ] Show limited state when modifier data is unavailable.
- [ ] Keep preview read-only.
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
- [ ] Highway is visible.
- [ ] Highway notes render from chart/hit data.
- [ ] Play/pause updates highway position.
- [ ] Playhead/hit line behavior is understandable.
- [ ] Lane labels are readable.
- [ ] Cymbal/accent/ghost/open states appear when data exists.
- [ ] Missing/limited data is handled gracefully.
- [ ] Validation page still works.
- [ ] Generate page still works.
- [ ] Project save/load still works.

## Deferred

- [ ] No note editing.
- [ ] No persisted offset adjustment loop.
- [ ] No automatic offset detection.
- [ ] No gameplay/scoring.
- [ ] No mapping overrides.
- [ ] No packaging.
- [ ] No full UX polish pass.
- [ ] Do not implement future phases unless explicitly approved.
