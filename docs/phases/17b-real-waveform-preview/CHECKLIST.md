# Checklist Phase 17B: Real Waveform Preview

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/desktop/bug-and-ui-backlog.md`.
- [ ] Read `docs/phases/17a-desktop-bug-bash/PRD.md`.
- [ ] Read `docs/phases/17b-real-waveform-preview/PRD.md`.
- [ ] Read `docs/phases/17b-real-waveform-preview/ADR.md`.
- [ ] Read this checklist.
- [ ] Read OpenSpec if present.

## Implementation

- [ ] Identify current Preview waveform placeholder implementation.
- [ ] Identify current audio playback source resolution.
- [ ] Decide waveform extraction strategy consistent with Electron security.
- [ ] Add waveform overview model/DTO.
- [ ] Decode/read real audio waveform.
- [ ] Downsample waveform into renderable buckets.
- [ ] Render real waveform in Preview.
- [ ] Align waveform duration with audio/playhead.
- [ ] Show audio source label.
- [ ] Add loading state.
- [ ] Add error state.
- [ ] Remove or replace placeholder copy.
- [ ] Preserve existing playback.
- [ ] Preserve timeline/highway behavior.
- [ ] Preserve offset loop behavior.
- [ ] Add/update tests.

## Tests

- [ ] Test waveform bucket normalization/downsampling helper.
- [ ] Test empty/silent audio handling where practical.
- [ ] Test finite normalized amplitudes.
- [ ] Test preview model handles decode error state where practical.
- [ ] Preserve existing tests.

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
