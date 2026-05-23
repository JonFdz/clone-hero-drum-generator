# Checklist Phase 17C: Preview Highway UX Redesign

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/desktop/README.md`.
- [x] Read `docs/desktop/decisions.md`.
- [x] Read `docs/desktop/mockup-corrections.md`.
- [x] Read `docs/desktop/feature-inventory.md`.
- [x] Read `docs/desktop/bug-and-ui-backlog.md`.
- [x] Read `docs/phases/17b-real-waveform-preview/PRD.md`.
- [x] Read `docs/phases/17c-preview-highway-ux-redesign/PRD.md`.
- [x] Read `docs/phases/17c-preview-highway-ux-redesign/ADR.md`.
- [x] Read `docs/phases/17c-preview-highway-ux-redesign/COMPONENTS.md`.
- [x] Read this checklist.
- [x] Open `docs/desktop/mockups/08a-preview-highway-redesign.png`.
- [x] Read OpenSpec if present.

## Current repo review

- [x] Review `apps/desktop/src/app/pages/preview/preview-page.component.ts`.
- [x] Review `apps/desktop/src/app/services/desktop-preview.service.ts`.
- [x] Review `apps/desktop/src/app/services/desktop-preview-model.ts`.
- [x] Review `apps/desktop/src/app/services/desktop-waveform-overview.ts`.
- [x] Identify existing offset methods and keep behavior unchanged.
- [x] Identify existing chartData/waveform/currentTime/duration signals.

## Pure helper/model work

- [x] Add `preview-chart-stage-model.ts`.
- [x] Add lane definitions in required order.
- [x] Add piece-to-lane mapping.
- [x] Add piece-to-glyph style mapping.
- [x] Add viewport helper.
- [x] Add time projection helper.
- [x] Add visible note filtering.
- [x] Add chart note adapter.
- [x] Add unit tests.

## Component work

- [x] Extract/add `PreviewTransportCardComponent`.
- [x] Extract/add `PreviewOffsetPanelComponent`.
- [x] Add `PreviewChartStageComponent`.
- [x] Add `PreviewTimeRulerComponent`.
- [x] Add `PreviewWaveformBackgroundComponent`.
- [x] Add `PreviewLaneLabelsComponent`.
- [x] Add `PreviewLaneGridComponent`.
- [x] Add `PreviewNoteLayerComponent`.
- [x] Add `PreviewPlayheadComponent`.
- [x] Add `PreviewFooterStatsComponent`.

## Visual rules

- [x] Match `08a-preview-highway-redesign.png` as closely as practical.
- [x] Use left-to-right 2D layout.
- [x] Draw one waveform background behind all lanes.
- [x] Do not repeat waveform per lane.
- [x] Use vertical purple playhead.
- [x] Use top time ruler.
- [x] Use right offset panel.
- [x] Use bottom stats/source strip.

## Lane rules

- [x] KICK = orange circle.
- [x] SNARE = red circle.
- [x] HI-HAT = yellow diamond.
- [x] TOM 1 / tom_high = yellow circle.
- [x] RIDE = blue diamond.
- [x] TOM 2 / tom_mid = blue circle.
- [x] CRASH = green diamond.
- [x] TOM 3 / tom_floor = green circle.

## Behavior preservation

- [ ] Play works.
- [ ] Pause works.
- [ ] Seek works.
- [ ] Current time updates playhead.
- [ ] Waveform stays aligned with notes.
- [ ] Offset nudges work.
- [ ] Direct offset input works.
- [ ] Apply Offset works.
- [ ] Reset Preview works.
- [ ] No-audio/error states still render.
- [ ] Mapping overrides/profile-generated output still previews correctly.

## Remove/deprioritize old visuals

- [x] Old Timeline Notes panel is removed or no longer primary.
- [x] Old rough Clone Hero Highway block is replaced by the new chart stage.

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

## Manual validation

- [ ] Open project with generated output.
- [ ] Open Preview.
- [ ] Compare to `08a-preview-highway-redesign.png`.
- [ ] Confirm waveform is one background.
- [ ] Confirm notes render on correct lanes.
- [ ] Confirm cymbals are diamonds.
- [ ] Confirm non-cymbals are circles.
- [ ] Confirm colors match.
- [ ] Confirm playhead follows audio time.
- [ ] Confirm offset controls work.

## Out of scope confirmation

Do not implement:

- [x] note editing;
- [x] automatic offset detection;
- [x] new rendering dependency;
- [x] sidebar/global UI redesign;
- [x] Home/Projects redesign;
- [x] packaging;
- [x] external editor integration.
