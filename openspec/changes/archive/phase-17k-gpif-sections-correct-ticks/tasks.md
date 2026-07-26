# Tasks — Phase 17K

## 0. Engram

- [ ] Read accepted OpenSpec.
- [ ] Transfer requirements, decisions, constraints, and acceptance criteria to Engram.
- [ ] Confirm Engram is aligned before implementation.

## 1. Investigation

- [ ] Locate current GPIF section normalization.
- [ ] Identify why section ticks default to `0`.
- [ ] Inspect GPIF timeline helper from Phase 17I.
- [ ] Identify GPIF marker fields for bar/measure position.

## 2. Implementation

- [ ] Convert GPIF marker/section bar positions to ticks.
- [ ] Use the same timeline basis as tempo/note placement.
- [ ] Preserve section names.
- [ ] Sort section events by tick then name.
- [ ] Avoid unsafe tick guesses.

## 3. Tests

- [ ] Add `gpifTimeline` test for sections at bar 8 and bar 48.
- [ ] Add `normalizeGpDrumsXml` test returning non-zero section ticks.
- [ ] Add generated chart test asserting `[Events]` includes expected ticks.
- [ ] Ensure Phase 17I tempo-map tests still pass.

## 4. Validation

- [ ] Run package tests.
- [ ] Run relevant package builds.
- [ ] Update PR body with validation evidence.
