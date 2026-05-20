# Checklist Phase 14B: Clone Hero Highway Preview

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/desktop/README.md`.
- [x] Read `docs/desktop/decisions.md`.
- [x] Read `docs/desktop/mockup-corrections.md`.
- [x] Read `docs/desktop/feature-inventory.md`.
- [x] Read `docs/phases/14a-audio-waveform-timeline-preview/PRD.md`.
- [x] Read `docs/phases/14a-audio-waveform-timeline-preview/ADR.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Review visual reference:
  - `docs/desktop/mockups/08-preview-offset.png`
- [x] Read OpenSpec:
  - `openspec/changes/phase-14b-clone-hero-highway-preview/proposal.md`
  - `openspec/changes/phase-14b-clone-hero-highway-preview/design.md`
  - `openspec/changes/phase-14b-clone-hero-highway-preview/tasks.md`
  - `openspec/changes/phase-14b-clone-hero-highway-preview/verify.md`
  - `openspec/changes/phase-14b-clone-hero-highway-preview/specs/clone-hero-highway-preview/spec.md`

## Implementation

- [x] Implement only Phase 14B scope.
- [x] Add highway section to Preview page.
- [x] Reuse Phase 14A audio/playback state.
- [x] Reuse generated chart preview data where available.
- [x] Render kick/red/yellow/blue/green lanes.
- [x] Render notes relative to current audio time.
- [x] Render visible hit line.
- [x] Represent cymbals where available.
- [x] Represent open hi-hat where available.
- [x] Represent accent/ghost where available.
- [x] Show limited state when modifier data is unavailable.
- [x] Keep preview read-only.
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

- [x] No note editing.
- [x] No persisted offset adjustment loop.
- [x] No automatic offset detection.
- [x] No gameplay/scoring.
- [x] No mapping overrides.
- [x] No packaging.
- [x] No full UX polish pass.
- [x] Do not implement future phases unless explicitly approved.
