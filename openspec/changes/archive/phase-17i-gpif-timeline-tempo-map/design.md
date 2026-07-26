# Design — Phase 17I GPIF Timeline Tempo Map

## Current behavior

`normalizeGpDrumsXml(...)` returns:

```ts
tempos: normalizeGpifTempos(inspection.metadata.tempo, inspection.tempos)
timeSignatures: normalizeGpifTimeSignatures(inspection.timeSignatures)
sections: normalizeGpifSections(inspection.sections)
```

The current implementation collapses tempos/time signatures to one value and sections often fall back to tick 0.

## Target design

Add a timeline extraction layer for GPIF.

Suggested file:

```text
packages/guitarpro/src/gpifTimeline.ts
```

Suggested model:

```ts
export type GpifTimeline = {
  resolution: number;
  masterBars: GpifMasterBarTimelineEntry[];
  tempos: TempoEvent[];
  timeSignatures: TimeSignatureEvent[];
  sections: SongSection[];
  issues: string[];
};

export type GpifMasterBarTimelineEntry = {
  index: number;
  startTick: number;
  durationTicks: number;
  numerator: number;
  denominator: number;
};
```

## Tempo extraction

Parse GPIF automation objects where type is tempo/bpm.

Input shape seen in the reproduction:

```xml
<Automation>
  <Type>Tempo</Type>
  <Bar>48</Bar>
  <Position>0</Position>
  <Value>160 2</Value>
</Automation>
```

Expected normalized output:

```ts
{ tick: 184320, bpm: 160 }
```

BPM parsing rule:

- `Value` may be text like `"160 2"`.
- Use the first positive numeric value as BPM unless a stronger GPIF-specific meaning is discovered.

## Bar/position to tick conversion

Basic rule:

```ts
tick = masterBars[bar].startTick + positionTicks
```

`Position` in the reproduced file is `0`, so the change is exactly at the start of the bar.

Position parsing should be conservative:

- if numeric and known to be ticks, use ticks;
- if numeric and fractional/beat-like, document interpretation with tests;
- if unknown, default to 0 and add an issue only when needed.

## Master bar timeline

The timeline should determine each master bar duration. For standard 4/4 at 960 PPQ:

```ts
durationTicks = 4 * 960
```

If GPIF provides time signatures per master bar, use them. If not, preserve existing safe fallback of 4/4.

## Sections

Use the same timeline model to convert marker/section bar positions to ticks.

Do not emit every section at tick 0 when bar/position context is available.

## Time signatures

Use the timeline to produce a `TimeSignatureEvent[]` sorted by tick.

De-duplicate repeated identical time signatures at the same tick. Optionally omit repeated identical signatures if no change occurred, but ensure tick 0 has a time signature.

## Chart writer

The chart writer already emits every tempo/time signature it receives. Keep it simple unless ordering/deduplication tests reveal a need.

## Fallback behavior

If no tempo can be found, keep existing fallback to 120 BPM at tick 0.

If no time signature can be found, keep existing fallback to 4/4 at tick 0.

If no timeline can be built, do not crash unless generation cannot produce reliable ticks. Prefer warnings/issues where appropriate.
