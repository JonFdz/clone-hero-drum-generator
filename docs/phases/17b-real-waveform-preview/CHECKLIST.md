# Checklist Phase 17B: Real Waveform Preview

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/desktop/README.md`.
- [x] Read `docs/desktop/decisions.md`.
- [x] Read `docs/desktop/mockup-corrections.md`.
- [x] Read `docs/desktop/feature-inventory.md`.
- [x] Read `docs/desktop/bug-and-ui-backlog.md`.
- [x] Read `docs/phases/17a-desktop-bug-bash/PRD.md`.
- [x] Read `docs/phases/17b-real-waveform-preview/PRD.md`.
- [x] Read `docs/phases/17b-real-waveform-preview/ADR.md`.
- [x] Read this checklist.
- [x] Read OpenSpec if present.

## Implementation

- [x] Identify current Preview waveform placeholder implementation.
- [x] Identify current audio playback source resolution.
- [x] Decide waveform extraction strategy consistent with Electron security.
- [x] Add waveform overview model/DTO.
- [x] Decode/read real audio waveform.
- [x] Downsample waveform into renderable buckets.
- [x] Render real waveform in Preview.
- [x] Align waveform duration with audio/playhead.
- [x] Show audio source label.
- [x] Add loading state.
- [x] Add error state.
- [x] Remove or replace placeholder copy.
- [x] Preserve existing playback.
- [x] Preserve timeline/highway behavior.
- [x] Preserve offset loop behavior.
- [x] Add/update tests.

## Tests

- [x] Test waveform bucket normalization/downsampling helper.
- [x] Test empty/silent audio handling where practical.
- [x] Test finite normalized amplitudes.
- [ ] Test preview model handles decode error state where practical.
- [x] Preserve existing tests.

## Validation

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

## Manual desktop validation

- [ ] Open project with audio.
- [ ] Generate output.
- [ ] Open Preview.
- [ ] Confirm waveform reflects actual audio, not placeholder.
- [ ] Confirm waveform duration matches audio duration.
- [ ] Press Play.
- [ ] Confirm playhead moves over waveform correctly.
- [ ] Adjust offset.
- [ ] Confirm offset preview still works.
- [ ] Confirm timeline/highway still render.
- [ ] Confirm app handles decode failure without crashing.

## Out of scope confirmation

Do not implement in this phase:

- [ ] Timeline Notes redesign.
- [ ] Clone Hero Highway redesign.
- [ ] Home dashboard redesign.
- [ ] Projects library redesign.
- [ ] packaging/distribution.
- [ ] external editor integration.
- [ ] individual note editing.
- [ ] automatic offset detection.
