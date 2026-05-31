# PRD — Phase 17I GPIF Timeline Tempo Map

## Problem

Generated Clone Hero charts from GPIF/Guitar Pro can drift out of sync when the source contains tempo changes. CHDG currently exports only one tempo event in many GPIF cases, even when the source contains multiple tempo automations.

## User impact

A user can generate a chart that looks structurally correct but becomes increasingly off-beat as playback continues. This is especially damaging because the generated chart appears valid, but the output is musically unusable.

## Goals

1. Preserve GPIF tempo map events in generated `.chart` files.
2. Convert GPIF bar/position timeline data to chart ticks correctly.
3. Ensure sections and time signatures use the same timeline model where possible.
4. Add regression coverage for a GPIF source with a tempo change at a later bar.
5. Keep the fix focused on timing correctness, not UI or audio analysis.

## Functional requirements

### FR1 — Tempo automations

For GPIF input, CHDG must parse tempo automations such as:

```xml
<Automation>
  <Type>Tempo</Type>
  <Bar>48</Bar>
  <Position>0</Position>
  <Value>160 2</Value>
</Automation>
```

and emit a `TempoEvent` at the corresponding chart tick.

### FR2 — Tick conversion

GPIF bar/position must be converted into ticks using the GPIF timeline, not text summaries.

For standard 4/4 at 960 PPQ:

```text
bar 48, position 0 -> 184320 ticks
```

### FR3 — Multiple tempo events

Generated chart output must write every normalized tempo event:

```chart
0 = B 164000
184320 = B 160000
```

### FR4 — Time signatures

If GPIF contains multiple time signature changes, CHDG should preserve them as multiple `TimeSignatureEvent` values when the bar/tick can be determined.

### FR5 — Sections

When GPIF markers/sections have bar/position context, CHDG should emit them at the correct ticks instead of collapsing every section to tick 0.

### FR6 — Regression test

Add tests proving the reproduced case:

- source tempo automation at bar 0: 164 BPM
- source tempo automation at bar 48: 160 BPM
- chart contains `0 = B 164000`
- chart contains `184320 = B 160000`

## UX requirements

No new user-facing UI is required in this phase.

If any warning text is added for unsupported GPIF timing structures, it should be specific and actionable. Avoid generic warnings that make valid GP files look broken.

## Out of scope

- Audio waveform/beat analysis.
- Tempo detection from audio.
- Manual editing of tempo map.
- Preview sync tools.
- UI redesign.
- Changing offset semantics.

## Acceptance criteria

- GPIF tempo changes are preserved in generated `.chart` files.
- The Decode reproduction no longer drifts because of missing tempo change at bar 48.
- Sections no longer all collapse to tick 0 when bar/marker context is available.
- Existing MIDI generation behavior is unchanged.
- Existing GPIF single-tempo behavior remains valid.
- Tests pass.
