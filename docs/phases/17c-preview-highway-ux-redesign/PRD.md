# PRD Phase 17C: Preview Highway UX Redesign

## Goal

Redesign the Preview screen to closely match the new 08a mockup.

Primary visual target:

```txt
docs/desktop/mockups/08a-preview-highway-redesign.png
```

The implementation should convert Preview from the current separated Audio Preview + Timeline Notes + Clone Hero Highway blocks into a focused 2D left-to-right chart review screen.

## Current repo baseline

Current Preview is mostly implemented in one standalone Angular component:

```txt
apps/desktop/src/app/pages/preview/preview-page.component.ts
```

Current Preview state and behavior are provided by:

```txt
apps/desktop/src/app/services/desktop-preview.service.ts
```

Current chart/timeline/highway projection helpers live in:

```txt
apps/desktop/src/app/services/desktop-preview-model.ts
```

Real waveform support from Phase 17B lives in:

```txt
apps/desktop/src/app/services/desktop-waveform-overview.ts
```

The redesign should reuse these existing services/models where practical, but split visual rendering into smaller Preview-specific components and pure helpers.

## Roadmap context

```txt
Phase 17A — Desktop Bug Bash
Phase 17B — Real Waveform Preview
Phase 17C — Preview Highway UX Redesign
Phase 17D — General UI Polish / Information Architecture
Phase 18  — Desktop Packaging / Distribution
```

This phase is **17C only**.

## Product direction

Preview should become a chart review screen for synchronization and note inspection.

Target structure:

```txt
Preview page header/status
top transport/song card
main 2D chart stage
right offset adjustment panel
bottom chart/source stats
```

The main chart stage should show:

```txt
left lane labels/icons
top time ruler
one single real waveform background behind all lanes
horizontal colored drum lanes
note glyphs on lanes
vertical purple playhead/current time marker
```

## Mockup interpretation

Use the mock almost pixel-perfect, with these canonical corrections:

```txt
The waveform is one single background waveform behind all lanes.
It is not one waveform per lane, even if the mock visually suggests bands.
Cymbals are diamonds.
Everything else is circles.
The layout is left-to-right 2D, not top-to-bottom/3D Clone Hero.
Sidebar is not part of this phase.
```

## Scope

Included:

```txt
Preview-only layout redesign
component split for Preview visuals
2D left-to-right chart stage
single waveform background behind all lanes
canonical lane labels/icons/colors/shapes
time ruler
vertical playhead
note glyphs
right offset panel restyle while preserving behavior
transport/song card
footer stats/source row
remove/deprioritize old Timeline Notes panel
tests for pure lane/style/projection helpers
```

Excluded:

```txt
new external rendering dependency
global UI polish
sidebar redesign
Home redesign
Projects redesign
Mapping redesign
Validation redesign
Settings redesign
individual note editing
drag/drop notes
automatic offset detection
packaging/distribution
external editor integration
```

## Canonical lane order

Top to bottom:

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

Use sublabels where helpful:

```txt
TOM 1 (High Tom)
TOM 2 (Mid Tom)
TOM 3 (Floor Tom)
```

## Canonical color and shape map

```txt
kick      = orange circle
snare     = red circle
hi-hat    = yellow diamond
tom_high  = yellow circle
ride      = blue diamond
tom_mid   = blue circle
crash     = green diamond
tom_floor = green circle
```

Rules:

```txt
cymbals = diamonds
non-cymbals = circles
```

This is required to keep overlapping or same-color families readable.

## Required component breakdown

The implementation should create/refactor toward these components. Names may follow repo naming conventions, but responsibilities should stay separated.

### PreviewPageComponent

Current file:

```txt
apps/desktop/src/app/pages/preview/preview-page.component.ts
```

Responsibilities after redesign:

```txt
container only
loads DesktopPreviewService
composes transport, chart stage, offset panel
keeps page-level error/no-audio branches
does not contain waveform path math, lane math, note projection, or large inline chart template
```

### PreviewTransportCardComponent

Suggested location:

```txt
apps/desktop/src/app/pages/preview/components/preview-transport-card.component.ts
```

Responsibilities:

```txt
song/project title
artist/metadata fallback
current time / duration
Play / Pause
seek range if retained in top card
audio source/status pill
volume control only if existing behavior supports it cleanly
```

Inputs:

```txt
title
subtitle
currentTime
duration
audioSourceLabel
previewStatus
isPlaying
```

Outputs:

```txt
play
pause
seek
```

### PreviewChartStageComponent

Suggested location:

```txt
apps/desktop/src/app/pages/preview/components/preview-chart-stage.component.ts
```

Responsibilities:

```txt
main mock-like chart card
layout grid for lane label column and chart drawing area
composes time ruler, waveform background, lane grid, note layer, playhead, footer stats
defines shared viewBox/stage dimensions
```

Inputs:

```txt
waveformOverview
chartData
normalizationPreview
currentTime
duration
previewOffsetMs
audioSourceLabel
noteCount
waveformStatus
waveformError
```

### PreviewTimeRulerComponent

Suggested location:

```txt
apps/desktop/src/app/pages/preview/components/preview-time-ruler.component.ts
```

Responsibilities:

```txt
time labels along x-axis
minor tick marks
highlight current time label near playhead
align with chart viewport
```

Inputs:

```txt
viewportStartSeconds
viewportEndSeconds
currentTime
duration
```

### PreviewWaveformBackgroundComponent

Suggested location:

```txt
apps/desktop/src/app/pages/preview/components/preview-waveform-background.component.ts
```

Responsibilities:

```txt
draw exactly one waveform behind all lanes
low-opacity purple style
aligned to viewport time scale
drawn behind lane grid and notes
show empty/loading/error fallback area if chart stage needs it
```

Inputs:

```txt
waveformOverview
viewportStartSeconds
viewportEndSeconds
stageWidth
stageHeight
```

### PreviewLaneLabelsComponent

Suggested location:

```txt
apps/desktop/src/app/pages/preview/components/preview-lane-labels.component.ts
```

Responsibilities:

```txt
left label column
lane icon/glyph preview
primary label
secondary tom label if needed
color-coded label text/icons
vertical alignment with lane rows
```

Inputs:

```txt
laneDefinitions
```

### PreviewLaneGridComponent

Suggested location:

```txt
apps/desktop/src/app/pages/preview/components/preview-lane-grid.component.ts
```

Responsibilities:

```txt
horizontal row lines
subtle lane color lines
background grid/tick alignment
mock-like dark chart area
```

Inputs:

```txt
laneDefinitions
viewportStartSeconds
viewportEndSeconds
```

### PreviewNoteLayerComponent

Suggested location:

```txt
apps/desktop/src/app/pages/preview/components/preview-note-layer.component.ts
```

Responsibilities:

```txt
render visible note glyphs
use canonical lane/color/shape rules
keep overlapping same-time notes readable
support current modifiers already known by preview data if available
```

Inputs:

```txt
visibleNotes
laneDefinitions
viewportStartSeconds
viewportEndSeconds
currentTime
```

### PreviewPlayheadComponent

Suggested location:

```txt
apps/desktop/src/app/pages/preview/components/preview-playhead.component.ts
```

Responsibilities:

```txt
vertical purple playhead line
current time label above chart
aligned with currentTime
above waveform and grid
```

Inputs:

```txt
currentTime
viewportStartSeconds
viewportEndSeconds
```

### PreviewOffsetPanelComponent

Suggested location:

```txt
apps/desktop/src/app/pages/preview/components/preview-offset-panel.component.ts
```

Responsibilities:

```txt
right-side offset card
match mock styling
preserve existing offset behavior from DesktopPreviewService
current/saved offset
nudge buttons
direct offset input
reset to 0/reset preview
Apply Offset
status/errors
```

Inputs:

```txt
savedOffsetMs
previewOffsetMs
offsetDeltaMs
offsetInputMs
offsetInputValid
offsetStatus
canApplyOffset
```

Outputs:

```txt
nudgeOffset
setOffsetInput
resetPreviewOffset
applyOffset
```

### PreviewFooterStatsComponent

Suggested location:

```txt
apps/desktop/src/app/pages/preview/components/preview-footer-stats.component.ts
```

Responsibilities:

```txt
bottom strip inside chart card
source: generated/project audio
chart length
note count
ready/error state
```

Inputs:

```txt
audioSourceLabel
duration
noteCount
status
```

## Required pure helpers

Create a dedicated helper/model file for the redesigned chart stage.

Suggested location:

```txt
apps/desktop/src/app/services/preview-chart-stage-model.ts
```

It should not depend on Angular.

### Lane definitions

Provide one canonical lane list.

Suggested types:

```ts
export type PreviewLaneId =
  | "kick"
  | "snare"
  | "hi_hat"
  | "tom_high"
  | "ride"
  | "tom_mid"
  | "crash"
  | "tom_floor";

export type PreviewGlyphShape = "circle" | "diamond";

export type PreviewLaneDefinition = {
  id: PreviewLaneId;
  label: string;
  sublabel?: string;
  colorName: "orange" | "red" | "yellow" | "blue" | "green";
  glyphShape: PreviewGlyphShape;
};
```

### Piece-to-lane mapping

Map existing drum pieces to redesigned lanes.

Use actual repo piece names. Known current names include:

```txt
kick
snare
sidestick
hihat_open
hihat_closed
tom_high
ride
tom_mid
crash
tom_floor
```

Required behavior:

```txt
kick -> kick
snare/sidestick -> snare
hihat_open/hihat_closed -> hi_hat
tom_high -> tom_high
ride -> ride
tom_mid -> tom_mid
crash -> crash
tom_floor -> tom_floor
```

### Glyph style helper

Return lane color and shape.

Required behavior:

```txt
hi_hat/ride/crash -> diamond
kick/snare/tom_high/tom_mid/tom_floor -> circle
```

### Viewport helper

Recommended initial viewport:

```txt
currentTime - 2 seconds
currentTime + 6 seconds
clamped to 0..duration
```

If duration is shorter than the window, show 0..duration.

### Projection helper

Convert seconds to x percent:

```txt
viewportStart -> 0%
viewportEnd -> 100%
currentTime -> playhead x%
```

### Visible note helper

Filter notes to viewport with small padding.

Suggested padding:

```txt
0.25 seconds before/after viewport
```

### Chart note adapter

Current `desktop-preview-model.ts` derives old `TimelineNote` and `HighwayNote`. The redesign should either:

```txt
adapt ChartPreviewData.noteEvents into PreviewChartNote
or add a new helper that preserves existing chart data source but outputs 2D chart notes
```

Suggested type:

```ts
export type PreviewChartNote = {
  id: string;
  atSeconds: number;
  laneId: PreviewLaneId;
  highlighted: boolean;
  glyphShape: PreviewGlyphShape;
  colorName: "orange" | "red" | "yellow" | "blue" | "green";
};
```

## Rendering technology

Use existing Angular plus SVG for this phase.

Do not add a new rendering library.

SVG is preferred because:

```txt
current chart stage can be built with lines, text, paths, circles, diamonds
it is easy to align to the mock
it avoids a new dependency
it is easy to unit-test projection/helpers separately
```

Canvas may be used only if the agent finds SVG performance inadequate, but it must not add a new dependency.

## Acceptance criteria

- Mock `docs/desktop/mockups/08a-preview-highway-redesign.png` exists.
- Preview resembles mock 08a closely.
- Preview uses a 2D left-to-right time layout.
- The old separate Timeline Notes block is removed or replaced by the integrated chart stage.
- One global waveform background appears behind all lanes.
- The waveform is not repeated per lane.
- Time ruler, notes, waveform, and playhead share one time scale.
- Lane order matches this phase.
- Colors and shapes match this phase.
- Offset panel still works.
- Play/pause/seek still work.
- No new renderer Node/fs access is introduced.
- No new external rendering dependency is introduced.
- Tests cover pure chart-stage helpers.
