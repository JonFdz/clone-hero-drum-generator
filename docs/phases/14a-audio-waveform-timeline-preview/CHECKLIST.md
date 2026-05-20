# Checklist Phase 14A: Audio + Waveform + Timeline Preview

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read this phase PRD.
- [ ] Read this phase ADR.
- [ ] Read Phase 13 validation docs.
- [ ] Read Phase 12 project persistence docs.
- [ ] Review visual reference:
  - `docs/desktop/mockups/08-preview-offset.png`
- [ ] Read OpenSpec:
  - `openspec/changes/phase-14a-audio-waveform-timeline-preview/proposal.md`
  - `openspec/changes/phase-14a-audio-waveform-timeline-preview/design.md`
  - `openspec/changes/phase-14a-audio-waveform-timeline-preview/tasks.md`
  - `openspec/changes/phase-14a-audio-waveform-timeline-preview/verify.md`
  - `openspec/changes/phase-14a-audio-waveform-timeline-preview/specs/audio-waveform-timeline-preview/spec.md`

## Implementation

- [ ] Implement only Phase 14A scope.
- [ ] Make Preview page functional.
- [ ] Load local preview audio securely.
- [ ] Prefer generated `song.ogg` when available.
- [ ] Fall back to selected project audio when safe.
- [ ] Do not allow arbitrary renderer file reads.
- [ ] Render waveform or waveform-like overview.
- [ ] Render timeline-style note visualization.
- [ ] Add play/pause/seek.
- [ ] Show current time and duration.
- [ ] Sync playhead to audio.
- [ ] Highlight notes near current playback time.
- [ ] Keep preview read-only.
- [ ] Preserve validation/generation/project behavior.
- [ ] Preserve existing tests.
- [ ] Add/update tests for new behavior.
- [ ] Update docs if implementation differs.

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

- [ ] No Clone Hero highway preview.
- [ ] No full persisted offset adjustment loop.
- [ ] No automatic offset detection.
- [ ] No note editing.
- [ ] No mapping overrides.
- [ ] No packaging.
- [ ] No full UX polish pass.
- [ ] Do not implement future phases unless explicitly approved.
