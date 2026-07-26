# OpenSpec Tasks — 17O Preview Timing Diagnostics

## 0. Engram alignment

- [x] Transfer the accepted OpenSpec into Engram.
- [x] Confirm Engram is aligned.
- [x] Use Engram as project source of truth before implementation.

## 1. Inspect current implementation

- [x] Inspect Preview generated chart parsing.
- [x] Inspect Generate result/report flow.
- [x] Inspect chart writer SyncTrack output.
- [x] Inspect project analysis cache availability in renderer/electron state.
- [x] Identify exact files to modify.

## 2. Add generated chart timing parser/model

- [x] Define timing diagnostic types.
- [x] Define generated chart timing result type.
- [x] Parse resolution.
- [x] Parse offset.
- [x] Parse BPM events.
- [x] Parse time signature events.
- [x] Decode TS denominator exponent.
- [x] Parse section events.
- [x] Parse note timing summary.
- [x] Compute seconds using generated tempo map.
- [x] Preserve existing Preview chart note behavior.

## 3. Add generated chart diagnostics

- [x] Detect no tempo events.
- [x] Detect no initial tempo.
- [x] Detect no time signatures.
- [x] Detect no initial time signature.
- [x] Detect duplicate BPM ticks.
- [x] Detect duplicate TS ticks.
- [x] Detect unsorted SyncTrack.
- [x] Detect invalid BPM.
- [x] Detect BPM jumps > 30 BPM as info.
- [x] Detect BPM jumps > 50 BPM as warning.
- [x] Detect single BPM long song as info.
- [x] Detect non-zero offset as info.

## 4. Add source-vs-generated comparison

- [x] Read cached source analysis if available.
- [x] Do not auto-recalculate source analysis from Preview.
- [x] Compare source/generated tempo counts.
- [x] Detect source tempo missing in generated chart.
- [x] Detect generated extra tempo.
- [x] Compare source/generated TS counts.
- [x] Detect source section missing in generated chart.
- [x] Emit source comparison unavailable if no cache.
- [x] Use ±0.001 BPM tolerance.
- [x] Use exact tick comparison for this phase.

## 5. Preview integration

- [x] Extend Preview data payload with timing diagnostics.
- [x] Add Timing Diagnostics UI summary.
- [x] Add diagnostics list.
- [x] Add tempo table.
- [x] Add time signature table.
- [x] Add sections table.
- [x] Add notes summary.
- [x] Ensure offset is not styled as warning.
- [x] Ensure source comparison unavailable is clear.

## 6. Generate integration

- [x] Parse generated timing diagnostics after writing `notes.chart`.
- [x] Add concise timing summary to Generate result/report.
- [x] Show important warnings in Generate UI.

## 7. Optional writer ordering improvement

- [x] Sort SyncTrack output by tick.
- [x] Write TS before BPM at same tick.
- [x] Add/update writer tests.

## 8. Tests

- [x] Add parser tests.
- [x] Add diagnostics tests.
- [x] Add source-vs-generated comparison tests.
- [x] Add Preview data tests.
- [x] Add writer ordering tests.
- [x] Add renderer/UI tests if feasible in existing test setup.

## 9. Evidence and PR

- [x] Run validation commands.
- [x] Update `docs/phases/17o-preview-timing-diagnostics/EVIDENCE.md`.
- [x] Include screenshots or copied UI text.
- [x] Open PR linked to approved issue.
- [x] Do not merge.
