# Checklist — Phase 17I GPIF Timeline Tempo Map

## Pre-implementation

- [ ] Transfer accepted OpenSpec to Engram.
- [ ] Confirm Engram is updated and treated as source of truth.
- [ ] Read current GPIF normalization code.
- [ ] Read current GPIF inspection code.
- [ ] Read chart writer behavior.
- [ ] Reproduce the Decode case locally if possible.

## Implementation

- [ ] Add or refactor a GPIF timeline extractor.
- [ ] Parse tempo automations with bar and position.
- [ ] Convert bar/position to chart ticks.
- [ ] Return all tempo events, not only the first BPM.
- [ ] Preserve default tempo fallback for GPIF files without recognized tempo.
- [ ] Preserve default 4/4 fallback where no time signature can be parsed.
- [ ] Extract time signature changes where available.
- [ ] Extract section/marker ticks where available.
- [ ] Update `normalizeGpDrumsXml(...)` to use the timeline.
- [ ] Avoid lossy string summaries for generation timing.

## Regression tests

- [ ] GPIF tempo automation at bar 0 -> tick 0.
- [ ] GPIF tempo automation at bar 48 -> tick 184320 for 960 PPQ / 4/4.
- [ ] Generated chart includes `0 = B 164000`.
- [ ] Generated chart includes `184320 = B 160000`.
- [ ] Existing single-tempo GPIF tests still pass.
- [ ] Existing MIDI tests still pass.
- [ ] Sections no longer all collapse to tick 0 when marker timing is available.

## Validation commands

- [ ] `pnpm -r build`
- [ ] `pnpm build`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm --filter @chdg/guitarpro test` if available
- [ ] `pnpm --filter @chdg/project test` if available
- [ ] `pnpm chdg --help`

## Manual validation

- [ ] Generate from `Paramore-Decode-02-21-2026.gp`.
- [ ] Confirm `notes.chart` contains the tempo change at bar 48.
- [ ] Confirm the chart no longer progressively drifts after the tempo change.
- [ ] Confirm offset is not used as a workaround.
- [ ] Confirm generated `song.ini` remains correct.
