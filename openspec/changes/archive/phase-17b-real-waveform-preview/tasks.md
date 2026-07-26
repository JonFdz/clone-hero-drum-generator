# Tasks: Phase 17B — Real Waveform Preview

## 1. Read context

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/desktop/bug-and-ui-backlog.md`.
- [ ] Read `docs/phases/17b-real-waveform-preview/PRD.md`.
- [ ] Read `docs/phases/17b-real-waveform-preview/ADR.md`.
- [ ] Read `docs/phases/17b-real-waveform-preview/CHECKLIST.md`.

## 2. Sync context to Engram

- [ ] Save change ID `phase-17b-real-waveform-preview`.
- [ ] Save branch `fix/phase-17b-real-waveform-preview`.
- [ ] Save scope: real waveform only.
- [ ] Save non-goals: no timeline/highway redesign, no UI polish, no packaging.
- [ ] Save security rule: no direct renderer filesystem/Node access.
- [ ] Save validation commands.
- [ ] Save review rule: external review, no merge without Jon approval.

## 3. Inspect implementation

- [ ] Locate Preview page/component.
- [ ] Locate audio playback implementation.
- [ ] Locate placeholder waveform rendering/copy.
- [ ] Locate Electron bridge/audio path patterns.
- [ ] Locate existing audio package helpers.
- [ ] Locate tests for preview/audio if any.

## 4. Implement waveform model

- [ ] Add waveform overview/bucket model.
- [ ] Add downsampling helper.
- [ ] Add tests for downsampling/normalization.
- [ ] Handle empty/silent audio.

## 5. Implement extraction

- [ ] Use secure browser-safe or narrow bridge extraction.
- [ ] Prefer actual preview audio source.
- [ ] Prefer generated `song.ogg` for post-generation preview when available.
- [ ] Add loading/error state.
- [ ] Avoid renderer Node imports.

## 6. Render waveform

- [ ] Replace placeholder waveform rendering.
- [ ] Show real waveform.
- [ ] Align width/time with duration.
- [ ] Align playhead/current time.
- [ ] Show duration/source label.
- [ ] Keep rendering performant.

## 7. Preserve behavior

- [ ] Existing playback works.
- [ ] Offset preview works.
- [ ] Timeline still renders.
- [ ] Highway still renders.
- [ ] Generate/Validation still work.
- [ ] Mapping overrides/profiles still work.

## 8. Validate

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

## 9. Manual validation

- [ ] Open project with audio.
- [ ] Generate.
- [ ] Open Preview.
- [ ] Confirm real waveform.
- [ ] Press play.
- [ ] Confirm playhead alignment.
- [ ] Adjust offset.
- [ ] Confirm no crash on unsupported/decode-fail file.

## 10. PR

- [ ] Update checklist.
- [ ] Create PR.
- [ ] Do not merge.
