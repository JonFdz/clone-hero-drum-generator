# ADR Phase 17C: Preview Highway UX Redesign

## Status

Proposed.

## Decision

Implement the Preview redesign as a 2D left-to-right editor-style chart view matching:

```txt
docs/desktop/mockups/08a-preview-highway-redesign.png
```

Use existing Angular rendering with SVG. Do not add a new rendering library.

## Context

Current Preview exists in:

```txt
apps/desktop/src/app/pages/preview/preview-page.component.ts
```

It currently renders separate sections:

```txt
Audio Preview
Waveform overview
Timeline Notes
Clone Hero Highway (Preview)
Chart Offset
```

Phase 17C replaces the separate Timeline/Highway visual experience with a single integrated chart stage.

## Decision details

Create a componentized Preview structure:

```txt
PreviewTransportCardComponent
PreviewChartStageComponent
PreviewTimeRulerComponent
PreviewWaveformBackgroundComponent
PreviewLaneLabelsComponent
PreviewLaneGridComponent
PreviewNoteLayerComponent
PreviewPlayheadComponent
PreviewOffsetPanelComponent
PreviewFooterStatsComponent
```

Add a pure model/helper file:

```txt
apps/desktop/src/app/services/preview-chart-stage-model.ts
```

This helper owns lane definitions, glyph styles, viewport/projection, and visible-note derivation.

## Shape and color decision

Use exactly:

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

Cymbals are diamonds. Everything else is circles.

## Waveform decision

Use the real waveform from Phase 17B as one global background layer behind all lanes.

Do not render one waveform per lane.

## Rendering decision

Use SVG first.

Reason:

```txt
the mock is composed of lines, text, paths, circles, and diamonds
SVG integrates cleanly with Angular
projection helpers can be tested separately
no dependency is needed
```

## Old timeline decision

The old Timeline Notes panel should be removed or replaced by the integrated chart stage. It should not remain as a competing primary visualization.

## Non-goals

- No note editing.
- No automatic offset detection.
- No new rendering dependency.
- No global UI polish.
- No sidebar work.
- No packaging.
