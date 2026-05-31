# Phase 17I — GPIF Timeline Tempo Map

## Summary

Fix a timing drift bug in GPIF/Guitar Pro generation where CHDG currently exports only the first tempo into `notes.chart`, even when the `.gp` source contains tempo automations later in the song.

The concrete reproduced case is `Paramore-Decode-02-21-2026.gp`: the GPIF source contains tempo automations at bar 0 and bar 48, but the generated `notes.chart` only contains the tempo at tick 0. The song can start in sync and then progressively drift because the chart keeps using 164 BPM after the source changes to 160 BPM.

## User symptom

The generated chart starts close to correct, but as the song progresses the rhythm goes out of sync. This is not an offset problem: offset would shift the whole chart equally. A missing tempo-map event creates accumulated drift over time.

## Root cause

CHDG currently detects tempo-related GPIF structures, but the GPIF normalizer collapses them into a single tempo at tick 0.

Current problem area:

- `packages/guitarpro/src/normalizeGpDrums.ts`
  - `normalizeGpifTempos(...)` returns one tempo only.
  - `normalizeGpifTimeSignatures(...)` returns one time signature only.
  - `normalizeGpifSections(...)` falls back to tick 0 when no tick is already present.
  - note timing uses selected bars and a measure duration fallback, but there is no shared GPIF timeline model for master bars.

Related writer area:

- `packages/chart/src/chartWriter.ts`
  - already writes every tempo/time signature/section it receives.
  - this is probably not the main bug.

## Target fix

Create a proper GPIF timeline extraction layer that converts GPIF master bar / automation positions into chart ticks.

At minimum for this phase:

- GPIF tempo automations must produce multiple `TempoEvent` values with correct ticks.
- GPIF sections/markers should get correct ticks when the GPIF provides bar/position context.
- GPIF time signatures should preserve changes when present.
- Generated `notes.chart` must include all relevant `[SyncTrack]` tempo entries.

## Reproduced evidence

Uploaded files used during analysis:

- `Paramore-Decode-02-21-2026.gp`
- `Untitled 2026-05-29T16-10-21.chdg`
- `notes(2).chart`
- `song(1).ini`
- `song.ogg`

Source GPIF evidence:

```xml
<Automation>
  <Type>Tempo</Type>
  <Bar>0</Bar>
  <Position>0</Position>
  <Value>164 2</Value>
</Automation>
<Automation>
  <Type>Tempo</Type>
  <Bar>48</Bar>
  <Position>0</Position>
  <Value>160 2</Value>
</Automation>
```

Generated chart evidence:

```chart
[SyncTrack]
{
  0 = TS 4 2
  0 = B 164000
}
```

Expected generated chart should include a second tempo event at the correct tick. For 960 PPQ, 4/4, and tempo change at bar 48:

```chart
[SyncTrack]
{
  0 = TS 4 2
  0 = B 164000
  184320 = B 160000
}
```

Formula:

```text
bar 48 * 4 beats/bar * 960 ticks/beat = 184320 ticks
```

## Non-goals

- No audio beat detection.
- No automatic tempo detection from `song.ogg`.
- No manual tempo editor.
- No Preview redesign.
- No offset changes.
- No broad UI redesign.

## Important implementation rule

The first task for the implementation agent is to transfer the accepted OpenSpec into Engram. Engram is the source of truth for the project. Do not implement until Engram is aligned.
