# Checklist Phase 14A: Audio + Waveform + Timeline Preview

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/desktop/README.md`.
- [x] Read `docs/desktop/decisions.md`.
- [x] Read `docs/desktop/mockup-corrections.md`.
- [x] Read `docs/desktop/feature-inventory.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Read Phase 13 validation docs.
- [x] Read Phase 12 project persistence docs.
- [x] Review visual reference:
  - `docs/desktop/mockups/08-preview-offset.png`
- [x] Read OpenSpec:
  - `openspec/changes/phase-14a-audio-waveform-timeline-preview/proposal.md`
  - `openspec/changes/phase-14a-audio-waveform-timeline-preview/design.md`
  - `openspec/changes/phase-14a-audio-waveform-timeline-preview/tasks.md`
  - `openspec/changes/phase-14a-audio-waveform-timeline-preview/verify.md`
  - `openspec/changes/phase-14a-audio-waveform-timeline-preview/specs/audio-waveform-timeline-preview/spec.md`

## Implementation

- [x] Implement only Phase 14A scope.
- [x] Make Preview page functional.
- [x] Load local preview audio securely.
- [x] Prefer generated `song.ogg` when available.
- [x] Fall back to selected project audio when safe.
- [x] Do not allow arbitrary renderer file reads.
- [x] Render waveform or waveform-like overview.
- [x] Render timeline-style note visualization.
- [x] Add play/pause/seek.
- [x] Show current time and duration.
- [x] Sync playhead to audio.
- [x] Highlight notes near current playback time.
- [x] Keep preview read-only.
- [x] Preserve validation/generation/project behavior.
- [x] Preserve existing tests.
- [x] Add/update tests for new behavior.
- [ ] Update docs if implementation differs.

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
- [ ] Play works.
- [ ] Pause works.
- [ ] Current time updates.
- [ ] Duration appears.
- [ ] Timeline/playhead advances.
- [ ] Waveform or waveform-like overview renders.
- [ ] Note timeline renders when chart/hit data is available.
- [ ] Notes near current time highlight.
- [ ] Missing generated output is handled gracefully.
- [ ] Validation page still works.
- [ ] Generate page still works.

## Deferred

- [x] No Clone Hero highway preview.
- [x] No full persisted offset adjustment loop.
- [x] No automatic offset detection.
- [x] No note editing.
- [x] No mapping overrides.
- [x] No packaging.
- [x] No full UX polish pass.
- [ ] Do not implement future phases unless explicitly approved.
