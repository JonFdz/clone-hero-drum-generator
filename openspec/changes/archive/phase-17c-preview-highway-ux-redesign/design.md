# Design: Phase 17C — Preview Highway UX Redesign

## Current implementation

Current Preview is a monolithic standalone component:

```txt
apps/desktop/src/app/pages/preview/preview-page.component.ts
```

Current state and methods are in:

```txt
apps/desktop/src/app/services/desktop-preview.service.ts
```

Current old projection helpers are in:

```txt
apps/desktop/src/app/services/desktop-preview-model.ts
```

Phase 17C should reuse service data but replace the visual layout.

## New architecture

```txt
PreviewPageComponent
  PreviewTransportCardComponent
  PreviewChartStageComponent
    PreviewTimeRulerComponent
    PreviewWaveformBackgroundComponent
    PreviewLaneLabelsComponent
    PreviewLaneGridComponent
    PreviewNoteLayerComponent
    PreviewPlayheadComponent
    PreviewFooterStatsComponent
  PreviewOffsetPanelComponent
```

## Model/helper file

Add:

```txt
apps/desktop/src/app/services/preview-chart-stage-model.ts
```

It should be Angular-free and unit tested.

### Required exports

```txt
PREVIEW_LANES
pieceToPreviewLane()
pieceToPreviewGlyph()
computePreviewViewport()
projectSecondsToPercent()
filterVisiblePreviewNotes()
adaptChartPreviewDataToPreviewNotes()
```

Exact names may differ, but these responsibilities are required.

## Lane definition

Required order:

```txt
kick
snare
hi_hat
tom_high
ride
tom_mid
crash
tom_floor
```

Required visible labels:

```txt
KICK
SNARE
HI-HAT
TOM 1
RIDE
TOM 2
CRASH
TOM 3
```

## Glyph rules

```txt
hi_hat = yellow diamond
ride = blue diamond
crash = green diamond
kick = orange circle
snare = red circle
tom_high = yellow circle
tom_mid = blue circle
tom_floor = green circle
```

## Time model

Recommended viewport:

```txt
start = currentTime - 2s
end = currentTime + 6s
clamped to 0..duration
```

Projection:

```txt
xPercent = ((seconds - viewportStart) / (viewportEnd - viewportStart)) * 100
```

## Waveform

Use existing `WaveformOverview`.

Draw one waveform path behind all lanes.

Do not repeat waveform per lane.

## Visual replacement

Remove/replace old visible sections:

```txt
Timeline Notes
Clone Hero Highway (Preview)
separate Waveform overview
```

with the integrated chart stage.

## Offset

Do not rewrite offset persistence.

Move/restyle controls into `PreviewOffsetPanelComponent` and call existing `DesktopPreviewService` methods.

## Rendering

Use SVG.

No rendering dependency should be added.
