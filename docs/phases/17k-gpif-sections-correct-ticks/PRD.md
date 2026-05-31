# PRD — Phase 17K GPIF sections at correct ticks

## Problem

Generated `.chart` files currently emit GPIF sections/markers at tick `0` even when the GPIF source contains section positions later in the song.

Observed generated output:

```chart
[Events]
{
  0 = E "section Intro"
  0 = E "section Verse 1"
  0 = E "section Break"
  0 = E "section Solo"
  0 = E "section Bridge"
}
```

Expected behavior is to place each section at the tick corresponding to its GPIF bar/measure position.

## User impact

Sections are important for chart navigation, readability, QA, and Clone Hero/Moonscraper structure. Incorrect section placement does not usually break audio synchronization, but it makes generated charts look unfinished and harder to validate.

## Goals

1. Export GPIF sections at correct chart ticks.
2. Reuse the GPIF timeline model used for tempo events and notes.
3. Add regression tests for Decode-like markers.
4. Avoid changing tempo map or note timing behavior.

## Non-goals

- Do not add manual section editing.
- Do not add tempo map editing.
- Do not change Preview behavior.
- Do not change MIDI/GP drum mapping.

## Acceptance criteria

1. A GPIF marker/section at bar `0` emits at tick `0`.
2. A GPIF marker/section at bar `8` emits at tick `30720` for 960 PPQ and 4/4.
3. A GPIF marker/section at bar `48` emits at tick `184320` for 960 PPQ and 4/4.
4. Decode-like sections such as `Break`, `Solo`, and `Bridge` do not all emit at tick `0`.
5. Existing tempo-map regression tests continue to pass.
6. Existing note placement regression tests continue to pass.
7. MIDI behavior remains unchanged.
