# Component Breakdown Phase 17C: Preview Highway UX Redesign

This document is the implementation blueprint for the Preview redesign.

Visual target:

```txt
docs/desktop/mockups/08a-preview-highway-redesign.png
```

## Current files to refactor/use

Current Preview page:

```txt
apps/desktop/src/app/pages/preview/preview-page.component.ts
```

Current Preview service:

```txt
apps/desktop/src/app/services/desktop-preview.service.ts
```

Current preview projection helpers:

```txt
apps/desktop/src/app/services/desktop-preview-model.ts
```

Current waveform model/helper:

```txt
apps/desktop/src/app/services/desktop-waveform-overview.ts
```

## New suggested file layout

```txt
apps/desktop/src/app/pages/preview/components/preview-transport-card.component.ts
apps/desktop/src/app/pages/preview/components/preview-chart-stage.component.ts
apps/desktop/src/app/pages/preview/components/preview-time-ruler.component.ts
apps/desktop/src/app/pages/preview/components/preview-waveform-background.component.ts
apps/desktop/src/app/pages/preview/components/preview-lane-labels.component.ts
apps/desktop/src/app/pages/preview/components/preview-lane-grid.component.ts
apps/desktop/src/app/pages/preview/components/preview-note-layer.component.ts
apps/desktop/src/app/pages/preview/components/preview-playhead.component.ts
apps/desktop/src/app/pages/preview/components/preview-offset-panel.component.ts
apps/desktop/src/app/pages/preview/components/preview-footer-stats.component.ts

apps/desktop/src/app/services/preview-chart-stage-model.ts
apps/desktop/src/app/services/preview-chart-stage-model.test.ts
```

The exact names can follow repo style, but keep the boundaries.

## Implementation order

### Step 1 — Add pure model

Create `preview-chart-stage-model.ts`.

Add:

```txt
lane definitions
piece-to-lane mapping
piece-to-glyph mapping
viewport helper
time-to-x projection helper
visible note filtering
chart note adapter
```

Add tests before or alongside UI.

### Step 2 — Split offset panel

Extract current offset section from `PreviewPageComponent` into `PreviewOffsetPanelComponent`.

Do not change behavior.

### Step 3 — Add transport card

Extract top audio controls into `PreviewTransportCardComponent`.

Keep current audio element ownership in `PreviewPageComponent` unless moving it is simpler and safe.

### Step 4 — Add chart stage shell

Create `PreviewChartStageComponent` with mock-like card layout:

```txt
left label column
top time ruler
main stage area
footer stats
```

At this point it may render empty lanes and playhead.

### Step 5 — Add lane labels/grid

Implement lane label column and row grid.

Use exact lane order:

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

### Step 6 — Add waveform background

Use existing `WaveformOverview`.

Draw one waveform behind all lanes.

Do not draw one waveform per lane.

### Step 7 — Add note layer

Adapt chart/preview notes into 2D lane notes.

Render:

```txt
circle for kick/snare/toms
diamond for hi-hat/ride/crash
```

### Step 8 — Add playhead and ruler

Make the time ruler/playhead align with the viewport helper.

### Step 9 — Remove old competing visualizations

Remove or hide the old separate `Timeline Notes` panel.

Remove or replace the old 5-lane vertical `Clone Hero Highway` block.

### Step 10 — Manual visual pass

Compare against 08a mock and tune spacing, colors, glow, and card layout.

## Data flow

```txt
DesktopPreviewService
  audioSrc
  currentTime
  duration
  chartData
  waveformOverview
  offset state

PreviewPageComponent
  owns audio element and calls service load/apply
  passes signals/data to child components

PreviewChartStageComponent
  calls pure model helpers
  renders chart stage
```

## Required tests

Add tests for:

```txt
laneDefinitions order
pieceToPreviewLane()
pieceToPreviewGlyph()
computePreviewViewport()
projectSecondsToPercent()
filterVisibleNotes()
adaptChartPreviewDataToPreviewNotes()
```

Required assertions:

```txt
hi-hat, ride, crash are diamonds
kick, snare, tom_high, tom_mid, tom_floor are circles
tom_high shares yellow with hi-hat but is circle
tom_mid shares blue with ride but is circle
tom_floor shares green with crash but is circle
```

## Hard rules

```txt
Do not add a rendering library.
Do not implement note editing.
Do not implement automatic offset detection.
Do not redesign sidebar or other pages.
Do not draw waveform per lane.
Do not keep old Timeline Notes as a competing primary visualization.
```
