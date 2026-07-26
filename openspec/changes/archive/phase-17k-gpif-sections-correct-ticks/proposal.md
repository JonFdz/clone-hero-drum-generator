# Change: Phase 17K — GPIF sections at correct ticks

## Why

Generated charts currently place all GPIF sections at tick `0`, even when the source contains section/marker positions later in the song. This produces poor chart navigation and makes generated charts look structurally incorrect.

## What changes

- GPIF sections/markers are converted to chart ticks using the GPIF timeline.
- Section ticks align with bar/measure positions.
- Decode-like charts no longer emit every section at tick `0`.
- Regression tests cover section tick conversion.

## Impact

- Affects GPIF/Guitar Pro normalization and generated chart events.
- Does not affect MIDI behavior.
- Does not affect Preview behavior.
- Does not change tempo map or note timing logic except where shared timeline code is reused safely.

## Process rule

This OpenSpec is for Jon validation and for the implementation agent to understand the task. The first implementation step must be to transfer this accepted OpenSpec to Engram. Engram is the project source of truth.
