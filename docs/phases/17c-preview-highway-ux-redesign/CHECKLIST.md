# Checklist Phase 17C: Preview Highway UX Redesign

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/desktop/bug-and-ui-backlog.md`.
- [ ] Read `docs/phases/17b-real-waveform-preview/PRD.md`.
- [ ] Read `docs/phases/17c-preview-highway-ux-redesign/PRD.md`.
- [ ] Read `docs/phases/17c-preview-highway-ux-redesign/ADR.md`.
- [ ] Read `docs/phases/17c-preview-highway-ux-redesign/COMPONENTS.md`.
- [ ] Read this checklist.
- [ ] Open `docs/desktop/mockups/08a-preview-highway-redesign.png`.
- [ ] Read OpenSpec if present.

## Current repo review

- [ ] Review `apps/desktop/src/app/pages/preview/preview-page.component.ts`.
- [ ] Review `apps/desktop/src/app/services/desktop-preview.service.ts`.
- [ ] Review `apps/desktop/src/app/services/desktop-preview-model.ts`.
- [ ] Review `apps/desktop/src/app/services/desktop-waveform-overview.ts`.
- [ ] Identify existing offset methods and keep behavior unchanged.
- [ ] Identify existing chartData/waveform/currentTime/duration signals.

## Pure helper/model work

- [ ] Add `preview-chart-stage-model.ts`.
- [ ] Add lane definitions in required order.
- [ ] Add piece-to-lane mapping.
- [ ] Add piece-to-glyph style mapping.
- [ ] Add viewport helper.
- [ ] Add time projection helper.
- [ ] Add visible note filtering.
- [ ] Add chart note adapter.
- [ ] Add unit tests.

## Component work

- [ ] Extract/add `PreviewTransportCardComponent`.
- [ ] Extract/add `PreviewOffsetPanelComponent`.
- [ ] Add `PreviewChartStageComponent`.
- [ ] Add `PreviewTimeRulerComponent`.
- [ ] Add `PreviewWaveformBackgroundComponent`.
- [ ] Add `PreviewLaneLabelsComponent`.
- [ ] Add `PreviewLaneGridComponent`.
- [ ] Add `PreviewNoteLayerComponent`.
- [ ] Add `PreviewPlayheadComponent`.
- [ ] Add `PreviewFooterStatsComponent`.

## Visual rules

- [ ] Match `08a-preview-highway-redesign.png` as closely as practical.
- [ ] Use left-to-right 2D layout.
- [ ] Draw one waveform background behind all lanes.
- [ ] Do not repeat waveform per lane.
- [ ] Use vertical purple playhead.
- [ ] Use top time ruler.
- [ ] Use right offset panel.
- [ ] Use bottom stats/source strip.

## Lane rules

- [ ] KICK = orange circle.
- [ ] SNARE = red circle.
- [ ] HI-HAT = yellow diamond.
- [ ] TOM 1 / tom_high = yellow circle.
- [ ] RIDE = blue diamond.
- [ ] TOM 2 / tom_mid = blue circle.
- [ ] CRASH = green diamond.
- [ ] TOM 3 / tom_floor = green circle.

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

- [ ] Old Timeline Notes panel is removed or no longer primary.
- [ ] Old rough Clone Hero Highway block is replaced by the new chart stage.

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

- [ ] note editing;
- [ ] automatic offset detection;
- [ ] new rendering dependency;
- [ ] sidebar/global UI redesign;
- [ ] Home/Projects redesign;
- [ ] packaging;
- [ ] external editor integration.
