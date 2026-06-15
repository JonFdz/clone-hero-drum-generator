# Checklist — Phase 17O — Preview Timing Diagnostics

## Pre-implementation

- [x] Transfer accepted OpenSpec into Engram.
- [x] Confirm Engram is aligned and treated as project source of truth.
- [x] Inspect current `main` branch before editing.
- [x] Verify current Preview generated-output flow.
- [x] Verify current Generate result/report flow.
- [x] Verify current chart writer behavior.
- [x] Verify current test commands.

## Domain / parser

- [x] Add or refactor a pure generated chart timing parser.
- [x] Parse `Resolution` from `[Song]`.
- [x] Parse `Offset` from `[Song]`.
- [x] Parse BPM events from `[SyncTrack]`.
- [x] Parse TS events from `[SyncTrack]`.
- [x] Decode chart TS denominator correctly.
- [x] Parse section events from `[Events]`.
- [x] Parse ExpertDrums note summary.
- [x] Compute seconds for generated timing events.
- [x] Keep fallback behavior explicit when tempo map is unavailable.

## Diagnostics

- [x] Implement `TIMING_NO_TEMPO_EVENTS`.
- [x] Implement `TIMING_NO_INITIAL_TEMPO`.
- [x] Implement `TIMING_NO_TIME_SIGNATURES`.
- [x] Implement `TIMING_NO_INITIAL_TIME_SIGNATURE`.
- [x] Implement `TIMING_DUPLICATE_TEMPO_TICK`.
- [x] Implement `TIMING_DUPLICATE_TS_TICK`.
- [x] Implement `TIMING_UNSORTED_SYNCTRACK`.
- [x] Implement `TIMING_INVALID_BPM`.
- [x] Implement `TIMING_SUSPICIOUS_BPM_JUMP_INFO`.
- [x] Implement `TIMING_SUSPICIOUS_BPM_JUMP_WARNING`.
- [x] Implement `TIMING_ONLY_ONE_TEMPO_LONG_SONG` as info only.
- [x] Implement `TIMING_OFFSET_PRESENT` as info only.

## Source-vs-generated comparison

- [x] Use cached source analysis only.
- [x] Do not auto-normalize or auto-inspect source from Preview.
- [x] Implement tempo count mismatch diagnostic.
- [x] Implement source tempo missing in generated diagnostic.
- [x] Implement generated extra tempo info diagnostic.
- [x] Implement TS count mismatch diagnostic.
- [x] Implement source section missing in generated diagnostic.
- [x] Implement source comparison unavailable diagnostic.
- [x] Use ±0.001 BPM tolerance.
- [x] Use exact tick comparison in this phase.

## Writer ordering

- [x] Review current `chartWriter` SyncTrack ordering.
- [x] If small, update writer to sort SyncTrack by tick.
- [x] On same tick, write TS before BPM.
- [x] Add/update tests for ordered output.

## Preview UI

- [x] Add Timing Diagnostics summary to Preview.
- [x] Show overall status.
- [x] Show resolution.
- [x] Show offset as adjustment, not warning.
- [x] Show note count and first/last note timing.
- [x] Show tempo event table.
- [x] Show time signature table.
- [x] Show section table.
- [x] Show diagnostics list with severity.
- [x] Show source comparison unavailable message when appropriate.

## Generate UI/report

- [x] Include timing summary after Generate.
- [x] Show important timing warnings from generated chart.
- [x] Do not require the user to open raw logs to see important timing diagnostics.

## Tests

- [x] Chart with no BPM events.
- [x] Chart with BPM events but no BPM at tick 0.
- [x] Chart with multiple BPM events.
- [x] Chart with `TS 6 3` displayed as `6/8`.
- [x] Duplicate BPM tick.
- [x] Duplicate TS tick.
- [x] Unsorted SyncTrack.
- [x] Suspicious BPM jump > 30 BPM.
- [x] Suspicious BPM jump > 50 BPM.
- [x] Single BPM long song info only.
- [x] Offset present info only.
- [x] Source/generated tempo mismatch.
- [x] Source comparison unavailable.
- [x] Writer ordering TS before B at same tick.

## Validation

- [x] Run package/unit tests.
- [x] Run desktop/electron tests if present.
- [x] Run lint/typecheck if configured.
- [ ] Manually generate a simple constant-tempo chart.
- [ ] Manually generate or fixture a multi-tempo chart.
- [ ] Confirm Preview displays timing data from generated `notes.chart`.
- [x] Confirm no manual tempo editing was added.

## PR requirements

- [ ] PR links the approved issue.
- [ ] PR body summarizes behavior and non-goals.
- [ ] PR body includes screenshots or textual evidence for Preview diagnostics.
- [x] `docs/phases/17o-preview-timing-diagnostics/EVIDENCE.md` is updated.
- [x] No merge performed by implementation agent.
