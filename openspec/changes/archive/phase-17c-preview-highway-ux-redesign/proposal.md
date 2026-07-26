# Proposal: Phase 17C — Preview Highway UX Redesign

## Change ID

`phase-17c-preview-highway-ux-redesign`

## Summary

Redesign Preview into a 2D left-to-right chart review screen matching:

```txt
docs/desktop/mockups/08a-preview-highway-redesign.png
```

This replaces the current separated waveform/timeline/highway layout with one integrated chart stage.

## Goals

- Split Preview into maintainable focused components.
- Add a 2D chart stage.
- Render one waveform background behind lanes.
- Render note glyphs with required color/shape rules.
- Preserve playback and offset behavior.
- Remove/deprioritize old Timeline Notes and rough Highway blocks.

## Required components

Implement or refactor toward:

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

## Required pure helper

Add:

```txt
apps/desktop/src/app/services/preview-chart-stage-model.ts
```

with:

```txt
lane definitions
piece-to-lane mapping
piece-to-glyph mapping
viewport calculation
time projection
visible note filtering
chart note adapter
```

## Non-goals

- No note editing.
- No automatic offset detection.
- No new rendering dependency.
- No global UI redesign.
- No packaging.
