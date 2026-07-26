# Tasks: Phase 14A — Audio + Waveform + Timeline Preview

## 1. Read context

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/phases/14a-audio-waveform-timeline-preview/PRD.md`.
- [ ] Read `docs/phases/14a-audio-waveform-timeline-preview/ADR.md`.
- [ ] Read `docs/phases/14a-audio-waveform-timeline-preview/CHECKLIST.md`.
- [ ] Read `docs/phases/13-validation-checklist/PRD.md`.
- [ ] Read `docs/phases/12-project-persistence-settings/PRD.md`.
- [ ] Read `docs/phases/11-desktop-generate-mvp/PRD.md`.
- [ ] Review visual reference:
  - `docs/desktop/mockups/08-preview-offset.png`
- [ ] Read OpenSpec artifacts:
  - `proposal.md`
  - `design.md`
  - `specs/audio-waveform-timeline-preview/spec.md`
  - `tasks.md`
  - `verify.md`

## 2. Sync context to Engram

- [ ] Save change ID: `phase-14a-audio-waveform-timeline-preview`.
- [ ] Save branch name: `feat/phase-14a-audio-waveform-timeline-preview`.
- [ ] Save issue number once created.
- [ ] Save roadmap split: 14A preview, 14B highway, 15 offset loop.
- [ ] Save scope: audio waveform timeline preview only.
- [ ] Save non-goals: no highway, no persisted offset adjustment loop, no note editing, no mapping overrides, no packaging.
- [ ] Save security rule: renderer must not read arbitrary files or build arbitrary file URLs.
- [ ] Save preview source priority: generated song.ogg, then selected project audio fallback.
- [ ] Save review rule: final PR review external by Jon/ChatGPT.
- [ ] Save merge rule: do not merge without Jon approval.

## 3. Inspect current implementation

- [ ] Inspect Preview page placeholder.
- [ ] Inspect project state/output files.
- [ ] Inspect generated output result model.
- [ ] Inspect Electron path allowlists.
- [ ] Inspect preload/bridge patterns.
- [ ] Inspect generated notes.chart availability.
- [ ] Inspect normalized/generated hit data shape.
- [ ] Inspect tests.

## 4. Add secure preview bridge

- [ ] Add explicit bridge method for preview audio source.
- [ ] Validate generated `song.ogg` path belongs to current project output.
- [ ] Validate selected audio fallback is allowed/current project audio.
- [ ] Reject arbitrary paths.
- [ ] Add explicit bridge method or service for chart preview data if needed.
- [ ] Do not expose generic file reads.

## 5. Add preview model/service

- [ ] Add DesktopPreviewService or equivalent.
- [ ] Track audio source.
- [ ] Track loaded/error/playback state.
- [ ] Track current time/duration.
- [ ] Build waveform/waveform-like overview data.
- [ ] Build timeline note data where possible.
- [ ] Build current-time note highlight logic.

## 6. Implement Preview page

- [ ] Replace placeholder with real preview UI.
- [ ] Show audio source status.
- [ ] Add play/pause.
- [ ] Add seek/progress.
- [ ] Show current time/duration.
- [ ] Show waveform/waveform-like overview.
- [ ] Show timeline notes.
- [ ] Show playhead.
- [ ] Highlight nearby notes.
- [ ] Show missing/limited states clearly.
- [ ] Keep preview read-only.

## 7. Preserve behavior

- [ ] Preserve validation.
- [ ] Preserve generation.
- [ ] Preserve project save/load.
- [ ] Preserve Electron security settings.
- [ ] Do not implement Phase 14B/15 work.

## 8. Tests

- [ ] Test preview source priority.
- [ ] Test arbitrary preview path rejection where practical.
- [ ] Test waveform helper where practical.
- [ ] Test timeline note derivation where practical.
- [ ] Test current-time highlight helper.
- [ ] Test missing audio/generated output states where practical.
- [ ] Preserve existing tests.

## 9. Validate

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
- [ ] Preview page loads audio.
- [ ] Play/pause works.
- [ ] Current time and duration display.
- [ ] Timeline advances.
- [ ] Waveform/waveform-like overview renders.
- [ ] Timeline notes render when data exists.
- [ ] Notes near current time highlight.
- [ ] Missing generated output handled gracefully.
- [ ] Generate still works.
- [ ] Validation still works.

## 10. Docs/checklist

- [ ] Update `docs/phases/14a-audio-waveform-timeline-preview/CHECKLIST.md`.
- [ ] Update PRD/ADR if implementation differs.
- [ ] Do not mark future phase work complete.

## 11. Git and PR

- [ ] Confirm branch is `feat/phase-14a-audio-waveform-timeline-preview`.
- [ ] Commit changes.
- [ ] Push branch.
- [ ] Create PR linked to issue.
- [ ] Do not merge.
