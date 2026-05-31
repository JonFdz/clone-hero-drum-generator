# Phase 17K — GPIF sections at correct ticks

## Status

Draft for validation.

## Summary

Fix GPIF section/marker export so generated Clone Hero `notes.chart` files place `[Events]` section markers at their real chart ticks instead of emitting every section at tick `0`.

This is a generation correctness bug discovered while validating the Decode / Paramore workflow after the GPIF tempo-map fix.

## Core decision

CHDG must use the same GPIF timeline model for sections that it already uses for tempo events and note placement.

If the GPIF source contains section/marker information with bar/measure positions, generated chart events must be written at the corresponding Clone Hero chart ticks.

## Example

For a 960 resolution, 4/4 GPIF timeline:

```txt
bar 0   -> tick 0
bar 8   -> tick 30720
bar 24  -> tick 92160
bar 32  -> tick 122880
bar 48  -> tick 184320
bar 52  -> tick 199680
bar 92  -> tick 353280
bar 108 -> tick 414720
```

## Scope

- Fix GPIF section/marker tick extraction.
- Preserve existing tempo-map and note-placement behavior.
- Add regression tests proving sections are not all emitted at tick `0`.
- Add Decode-like fixture coverage.

## Out of scope

- Tempo map override/editor.
- MIDI Drum Note Atlas / expanded drum mapping.
- Preview UI redesign.
- Source Review redesign.
- Audio sync/beat detection.
- Manual section editor.
