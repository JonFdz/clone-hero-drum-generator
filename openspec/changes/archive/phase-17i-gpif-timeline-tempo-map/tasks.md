# Tasks — Phase 17I GPIF Timeline Tempo Map

## 0. Engram

- [ ] Transfer accepted OpenSpec into Engram.
- [ ] Confirm Engram has Phase 17I requirements and acceptance criteria.
- [ ] Do not implement until Engram is aligned.

## 1. Reproduction

- [ ] Add or create a minimal GPIF fixture with tempo automation at bar 0 and bar 48.
- [ ] Confirm current behavior produces only one tempo event.
- [ ] Confirm expected second tempo tick is 184320 for 960 PPQ / 4/4.

## 2. Timeline extractor

- [ ] Add/refactor GPIF timeline extraction.
- [ ] Parse resolution/PPQ.
- [ ] Parse master bars.
- [ ] Compute master bar start ticks and durations.
- [ ] Convert bar/position to ticks.
- [ ] Parse tempo automations into `TempoEvent[]`.
- [ ] Parse time signatures into `TimeSignatureEvent[]`.
- [ ] Parse sections/markers into `SongSection[]` where possible.

## 3. Normalize integration

- [ ] Update `normalizeGpDrumsXml(...)` to use the timeline extractor.
- [ ] Return all timeline tempos.
- [ ] Return timeline time signatures.
- [ ] Return timeline sections.
- [ ] Ensure drum hit ticks remain correct.
- [ ] Preserve behavior for GPIF files without recognized tempo/time-signature structures.

## 4. Tests

- [ ] Add unit test for timeline tempo extraction.
- [ ] Add unit test for generated chart containing multiple tempo events.
- [ ] Add test for sections not collapsing to tick 0 when timing context exists.
- [ ] Add fallback tests for no tempo / no time signature.
- [ ] Ensure existing MIDI tests pass.

## 5. Validation

- [ ] `pnpm -r build`
- [ ] `pnpm build`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm chdg --help`

## 6. Manual verification

- [ ] Generate Decode from `Paramore-Decode-02-21-2026.gp`.
- [ ] Confirm `notes.chart` has `0 = B 164000` and `184320 = B 160000`.
- [ ] Confirm chart no longer progressively drifts after the tempo change.
