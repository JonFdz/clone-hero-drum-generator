# Tasks: Phase 14B — Clone Hero Highway Preview

## 1. Read context

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/phases/14a-audio-waveform-timeline-preview/PRD.md`.
- [ ] Read `docs/phases/14a-audio-waveform-timeline-preview/ADR.md`.
- [ ] Read `docs/phases/14b-clone-hero-highway-preview/PRD.md`.
- [ ] Read `docs/phases/14b-clone-hero-highway-preview/ADR.md`.
- [ ] Read `docs/phases/14b-clone-hero-highway-preview/CHECKLIST.md`.
- [ ] Review visual reference:
  - `docs/desktop/mockups/08-preview-offset.png`
- [ ] Read OpenSpec artifacts:
  - `proposal.md`
  - `design.md`
  - `specs/clone-hero-highway-preview/spec.md`
  - `tasks.md`
  - `verify.md`

## 2. Sync context to Engram

- [ ] Save change ID: `phase-14b-clone-hero-highway-preview`.
- [ ] Save branch name: `feat/phase-14b-clone-hero-highway-preview`.
- [ ] Save issue number once created.
- [ ] Save roadmap split: 14A preview, 14B highway, 15 offset loop.
- [ ] Save scope: Clone Hero-style highway preview only.
- [ ] Save non-goals: no note editing, no persisted offset loop, no gameplay/scoring, no mapping overrides, no packaging.
- [ ] Save security rule: do not add renderer fs or arbitrary file access.
- [ ] Save data priority: generated notes.chart, structured generated data, normalization preview.
- [ ] Save review rule: final PR review external by Jon/ChatGPT.
- [ ] Save merge rule: do not merge without Jon approval.

## 3. Inspect current implementation

- [ ] Inspect Phase 14A Preview page.
- [ ] Inspect DesktopPreviewService.
- [ ] Inspect ChartPreviewData shape.
- [ ] Inspect previewData.ts parser.
- [ ] Inspect chart writer note/modifier semantics.
- [ ] Inspect current tests.

## 4. Add highway model/helpers

- [ ] Add lane mapping helper.
- [ ] Add modifier grouping helper.
- [ ] Add highway note model.
- [ ] Add visible window / note positioning helper.
- [ ] Add current-time highlight/hit-line positioning helper if needed.

## 5. Extend preview data if needed

- [ ] Preserve existing Phase 14A chart data behavior.
- [ ] Add modifier note information if needed.
- [ ] Keep data shape narrow.
- [ ] Do not expose generic chart reads.

## 6. Implement highway UI

- [ ] Add highway section to Preview page.
- [ ] Render five lanes.
- [ ] Render lane labels.
- [ ] Render visible hit line.
- [ ] Render notes relative to current time.
- [ ] Render cymbal styling where available.
- [ ] Render open hi-hat styling where available.
- [ ] Render accent/ghost styling where available.
- [ ] Show limited state if data unavailable.
- [ ] Keep preview read-only.

## 7. Preserve behavior

- [ ] Preserve audio preview.
- [ ] Preserve timeline preview.
- [ ] Preserve validation.
- [ ] Preserve generation.
- [ ] Preserve project save/load.
- [ ] Preserve Electron security settings.

## 8. Tests

- [ ] Test chart note to highway lane mapping.
- [ ] Test modifier grouping.
- [ ] Test visible window calculation.
- [ ] Test note positioning relative to current time.
- [ ] Test limited state when no notes.
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
- [ ] Highway appears.
- [ ] Lanes render.
- [ ] Notes render.
- [ ] Playback moves highway.
- [ ] Hit line is visible.
- [ ] Modifier states appear when available.
- [ ] Missing/limited data is clear.
- [ ] Generate still works.
- [ ] Validation still works.

## 10. Docs/checklist

- [ ] Update `docs/phases/14b-clone-hero-highway-preview/CHECKLIST.md`.
- [ ] Update PRD/ADR if implementation differs.
- [ ] Do not mark future phase work complete.

## 11. Git and PR

- [ ] Confirm branch is `feat/phase-14b-clone-hero-highway-preview`.
- [ ] Commit changes.
- [ ] Push branch.
- [ ] Create PR linked to issue.
- [ ] Do not merge.
