# Design — Phase 17K.1 Preview Section Navigation

## Data flow

```txt
generated notes.chart
  -> Electron previewData parser
  -> ChartPreviewData.sectionEvents
  -> Desktop preview model helpers
  -> Preview section overlay/dropdown
  -> existing seek flow
```

## Parser

`parseChartPreviewData(...)` should parse `[Events]` in addition to `[SyncTrack]` and `[ExpertDrums]`.

It should extract lines like:

```chart
30720 = E "section Verse 1"
```

into:

```ts
{
  tick: 30720,
  name: "Verse 1",
  seconds: tickToSeconds(30720, resolution, tempos),
  source: "generated-chart"
}
```

Non-section events should be ignored.

## Offset behavior

Preview offset should be applied at display/navigation time, matching note behavior.

```ts
effectiveSeconds = section.seconds + previewOffsetMs / 1000
```

## Current section

The current section is the last section whose effective seconds is less than or equal to current playback time.

Before the first section, no current section is required. If the first section is at 0, it becomes current immediately.

## Navigation

Previous/next/dropdown selection should call the existing seek flow with the target effective seconds.

Seeking should not change play/pause state beyond normal audio seek behavior.

## Repeated names

Repeated names should be disambiguated in UI labels only.

Input:

```txt
Chorus
Chorus
Chorus
```

UI labels:

```txt
Chorus
Chorus 2
Chorus 3
```

Generated chart names remain unchanged.

## UI placement

Use a compact overlay on the preview chart/highway stage.

Do not place it in the offset panel.
