# Evidence — Phase 17O — Preview Timing Diagnostics

Implementation agent must update this file with real evidence before opening or finalizing the PR.

## Branch / PR

- Branch: `feat/phase-17o-preview-timing-diagnostics`
- PR: Not created; prohibited for this executor.
- Issue: [#70 — Phase 17O — Preview Timing Diagnostics](https://github.com/JonFdz/clone-hero-drum-generator/issues/70)
- Pull request: [#71 — feat: add preview timing diagnostics](https://github.com/JonFdz/clone-hero-drum-generator/pull/71)

## Summary of implementation

Implemented a shared pure generated-chart timing parser and diagnostics layer. Preview now receives detailed generated timing data plus cached source comparison without recalculating source analysis. Generate returns and displays a concise timing summary. SyncTrack output is sorted by tick with TS before B at the same tick.

Fresh internal review findings were corrected without claiming external review:

- Preview note timing uses the explicit 120 BPM fallback only until the first valid generated tempo and then honors later tempo changes.
- Raw GPIF inspection summary shapes are treated as unusable cached timing, so source comparison reports unavailable instead of comparing false empty arrays.
- Source/generated time signatures are compared by exact tick, numerator, and denominator even when counts match.
- Preview only forwards cached source analysis after the established source fingerprint, mapping fingerprint, selected-track, inspection, and normalization freshness validation succeeds.
- Malformed persisted `tempos`, `timeSignatures`, or `sections` collections degrade to `SOURCE_COMPARISON_UNAVAILABLE` instead of crashing Preview.
- Duplicate BPM tick diagnostics are computed from all parsed BPM events, including invalid entries.
- `DesktopPreviewService.load()` now has runtime-boundary regression coverage proving stale and fingerprint-unavailable caches are withheld from `getChartPreviewData`, while fresh caches are forwarded.

## Commands run

Record exact commands and results.

```bash
pnpm vitest run apps/desktop/electron/previewData.test.ts packages/chart/src/chartTiming.test.ts
pnpm vitest run apps/desktop/src/app/services/desktop-preview.service.test.ts
pnpm vitest run apps/desktop/src/app/services/source-review-model.test.ts
pnpm vitest run apps/desktop/electron/previewData.test.ts
pnpm vitest run packages/chart/src/chartTiming.test.ts
pnpm vitest run apps/desktop/src/app/services/source-review-model.test.ts apps/desktop/electron/previewData.test.ts packages/chart/src/chartTiming.test.ts
pnpm vitest run apps/desktop/src/app/services/desktop-preview.service.test.ts apps/desktop/src/app/services/source-review-model.test.ts apps/desktop/electron/previewData.test.ts packages/chart/src/chartTiming.test.ts
pnpm vitest run packages/chart/src/chartTiming.test.ts packages/chart/src/chartWriter.test.ts apps/desktop/electron/previewData.test.ts packages/project/src/generatePackage.test.ts apps/desktop/src/app/services/desktop-preview-model.test.ts apps/desktop/src/app/services/desktop-preview.service.test.ts apps/desktop/src/app/services/source-review-model.test.ts apps/desktop/src/app/pages/preview/preview-page.component.test.ts apps/desktop/src/app/pages/generate/generate-page.component.test.ts apps/desktop/src/app/services/desktop-generate-state.service.test.ts apps/desktop/electron/main.validation-regression.test.ts
pnpm vitest run packages/chart/src/chartTiming.test.ts packages/chart/src/chartWriter.test.ts apps/desktop/electron/previewData.test.ts packages/project/src/generatePackage.test.ts apps/desktop/src/app/services/desktop-preview-model.test.ts apps/desktop/src/app/services/source-review-model.test.ts apps/desktop/src/app/pages/preview/preview-page.component.test.ts apps/desktop/src/app/pages/generate/generate-page.component.test.ts apps/desktop/src/app/services/desktop-generate-state.service.test.ts apps/desktop/electron/main.validation-regression.test.ts
pnpm vitest run packages/chart/src/chartTiming.test.ts packages/chart/src/chartWriter.test.ts apps/desktop/electron/previewData.test.ts packages/project/src/generatePackage.test.ts apps/desktop/src/app/services/desktop-preview-model.test.ts apps/desktop/src/app/pages/preview/preview-page.component.test.ts apps/desktop/src/app/pages/generate/generate-page.component.test.ts apps/desktop/src/app/services/desktop-generate-state.service.test.ts apps/desktop/electron/main.validation-regression.test.ts
pnpm test
pnpm --filter @chdg/chart typecheck
pnpm --filter @chdg/project typecheck
pnpm --filter @chdg/desktop exec tsc -p tsconfig.electron.json --noEmit
pnpm --filter @chdg/desktop exec ngc -p tsconfig.app.json
pnpm --filter @chdg/desktop typecheck
pnpm lint
```

### Results

- Focused safety net before fixes: 2 files, 23 tests passed.
- RED run after adding behavioral tests: 3 tests failed and 24 passed:
  - later valid tempo was discarded after fallback;
  - raw GPIF cache became a false empty timing snapshot;
  - equal-count TS semantic mismatch was missed.
- GREEN/refactor run: 2 files, 27 tests passed.
- Review remediation safety nets:
  - Source-review model: 1 file, 22 tests passed.
  - Preview data: 1 file, 14 tests passed.
  - Chart timing: 1 file, 13 tests passed.
- Review remediation RED:
  - Preview cache freshness: 1 failed, 22 passed; `resolvePreviewAnalysisCache is not a function`.
  - Malformed nested inspection: 1 failed, 14 passed; `cache.inspection.tempos.flatMap is not a function`.
  - Invalid+valid BPM duplicate tick: 1 failed, 13 passed; expected `TIMING_DUPLICATE_TEMPO_TICK` was absent.
- Review remediation GREEN:
  - Preview cache freshness: 1 file, 23 tests passed.
  - Malformed nested inspection: 1 file, 15 tests passed.
  - Invalid+valid BPM duplicate tick: 1 file, 14 tests passed.
- Review remediation TRIANGULATE:
  - Fresh cache preserved and mapping-stale cache rejected: 1 file, 24 tests passed.
  - Malformed TS/sections rejected while valid cache remains usable: 1 file, 16 tests passed.
  - Invalid-only same-tick BPM events emit one duplicate diagnostic and two invalid diagnostics: 1 file, 15 tests passed.
- Combined remediation tests: 3 files, 55 tests passed.
- Fresh-review service regression:
  - The first direct Angular service import attempt failed before test collection with `SyntaxError: Invalid or unexpected token` and 0 tests; this was not accepted as coverage.
  - Added a Vitest TypeScript pre-transform with legacy decorator support so the real Angular-decorated service executes under Vitest.
  - RED mutation: direct `state.analysisCache` forwarding caused 2 failures and 1 pass; stale and fingerprint-unavailable calls incorrectly contained the cache.
  - GREEN/TRIANGULATE: restored validated service wiring; 1 file, 3 tests passed for stale, fingerprint-unavailable, and fresh cache paths.
- Combined fresh-review remediation tests: 4 files, 58 tests passed.
- Fresh-review Phase 17O/regression command: 11 files, 137 tests passed.
- Full repository suite after adding the service boundary test: 61 files, 529 tests passed.
- Direct Angular compiler after the service test harness change: passed.
- Electron TypeScript check after the service test harness change: passed.
- `git diff --check` after the service test harness change: passed.
- Focused Phase 17O/regression command after remediation: 10 files, 134 tests passed.
- Chart typecheck: passed after remediation.
- Electron TypeScript check: passed after remediation.
- Direct Angular compiler check: passed after remediation.
- `git diff --check`: passed.
- Focused Phase 17O/regression command: 9 files, 106 tests passed.
- Full repository suite: 60 files, 520 tests passed.
- Chart typecheck: passed.
- Project typecheck: passed.
- Electron TypeScript check: passed.
- Direct Angular compiler check: passed.
- Desktop combined typecheck: `ng build` aborted in esbuild under Node.js 25.9.0; this environment issue occurred before Electron typecheck in that combined script.
- Lint: passed; workspace package lint scripts currently report lint is not configured.

## Unit test evidence

List relevant test files and scenarios covered.

- No BPM events: `TIMING_NO_TEMPO_EVENTS`, inaccurate timing, and explicit 120 BPM fallback covered.
- Missing initial BPM: `TIMING_NO_INITIAL_TEMPO` and fallback covered.
- Multiple BPM events: seconds across tempo segments covered.
- TS denominator decoding: `TS 4 2 => 4/4` and `TS 6 3 => 6/8` covered.
- Duplicate BPM tick: `TIMING_DUPLICATE_TEMPO_TICK` covered.
- Duplicate BPM tick with invalid data: invalid+valid and invalid+invalid same-tick events emit the duplicate diagnostic without admitting invalid BPM into the timing map.
- Duplicate TS tick: `TIMING_DUPLICATE_TS_TICK` covered.
- Unsorted SyncTrack: `TIMING_UNSORTED_SYNCTRACK` covered.
- Suspicious BPM jumps: consecutive delta >30 info and >50 warning covered.
- Source-vs-generated mismatch: tempo count/missing/extra, TS count, and missing section covered.
- Equal-count time-signature comparison: exact tick/numerator/denominator match and mismatch covered using `SOURCE_GENERATED_TS_COUNT_MISMATCH`.
- Source comparison unavailable: explicit info diagnostic covered without source recalculation.
- Cached source usability: valid MIDI timing is preserved; raw GPIF `{path,value}` inspection timing is rejected as comparison unavailable.
- Cached source freshness: matching source/mapping/tracks preserve comparison; changed source fingerprint or mapping rejects the cache before Preview handoff.
- Service/runtime cache handoff: stale and fingerprint-unavailable caches reach `desktopBridge.getChartPreviewData` as `analysis: undefined`; a fresh cache is forwarded by identity.
- Malformed persisted cache: non-array tempo, time-signature, and section collections are rejected without throwing.
- Missing initial tempo: Preview notes before the first valid tempo use 120 BPM, while notes after it honor the real tempo map; displayed timing tables and playback note timing agree.
- Writer ordering: ascending tick and same-tick TS before B covered.

## Manual validation evidence

### Constant tempo chart

- Source file: Synthetic chart fixture in `packages/chart/src/chartTiming.test.ts`.
- Generated output: One 120 BPM event with a note at 210 seconds.
- Expected result: Long-song single BPM is info only.
- Actual result: `TIMING_ONLY_ONE_TEMPO_LONG_SONG` info; no warning.

### Multi-tempo chart

- Source file: Synthetic chart fixture in `packages/chart/src/chartTiming.test.ts`.
- Generated output: 120 BPM followed by 60 BPM with generated section/note timing.
- Expected result: Tempo-aware seconds across segments.
- Actual result: Tick 1440 at 2.000 seconds for 480 resolution fixture.

### Missing/invalid tempo chart fixture

- Fixture: Synthetic no-tempo and invalid-tempo chart strings.
- Expected diagnostic: Missing/invalid tempo diagnostics and explicit fallback.
- Actual diagnostic: `TIMING_NO_TEMPO_EVENTS`, `TIMING_INVALID_BPM`, and `TIMING_FALLBACK_USED`.

## Preview UI evidence

Add screenshot paths, descriptions, or copied UI text.

- Timing summary: `Timing Diagnostics` / `Timing: N warnings, M info`
- Tempo table: `Tempo Events` with Tick, Time, BPM.
- Time signature table: `Time Signatures` with Tick, Time, Signature.
- Section table: `Generated Sections` with Tick, Time, Name.
- Diagnostics list: code, message, and severity; `SOURCE_COMPARISON_UNAVAILABLE` clarifies that Preview did not recalculate cached analysis.
- Notes summary: `Generated Notes` with count, first tick/time, and last tick/time.
- Offset copy: `Offset adjustment`; offset diagnostics remain informational.

## Generate report evidence

Add copied generate summary/report output.

```txt
Timing Summary
Timing: OK

When warnings exist, the generated result lists the important warning messages directly below the concise summary.
```

## Known limitations

Document any accepted limitations.

- No manual tempo editing in this phase.
- No audio beat detection in this phase.
- Source comparison only when cached analysis is available.
- Current raw GPIF inspection summaries do not contain reliable normalized tick/BPM/TS timing and are therefore reported as source comparison unavailable.
- Exact-tick source comparison is skipped when source and generated resolutions differ.
- Manual desktop screenshot validation was not run in this executor environment.
- Desktop combined typecheck remains affected by the existing esbuild/Node.js 25 abort; direct Angular and Electron compiler checks passed.
- Angular renderer service tests require the root Vitest TypeScript pre-transform for legacy decorators; the real `DesktopPreviewService` now executes in the regression suite rather than relying only on pure helper coverage.

## Reviewer notes

- Verify Preview visual density and responsive layout in a local desktop run.
- External review remains intentionally incomplete. PR #71 is open and must not be merged without Jon's explicit approval.
- The OpenSpec PR task remains unchecked by instruction.

## Follow-up implementation — normalized source timing and audio-independent chart diagnostics

Implemented the two assigned follow-up blockers:

- Added `ChdgProjectAnalysisCache.normalizedTiming` with resolution, tempos, time signatures, and sections from MIDI/GPIF normalization results.
- `sourceTimingFromAnalysisCache` now prefers well-formed normalized timing, falls back to reliable numeric inspection timing, and safely ignores malformed normalized timing.
- Fresh MIDI inspection fallback remains supported.
- Fresh GPIF normalized timing now enables `SOURCE_GENERATED_TEMPO_COUNT_MISMATCH` and `SOURCE_TEMPO_MISSING_IN_GENERATED`.
- Raw GPIF inspection-only timing remains `SOURCE_COMPARISON_UNAVAILABLE`.
- Existing stale-cache filtering remains unchanged, and Preview still does not recalculate source analysis.
- `DesktopPreviewService.load()` now preserves successful chart data when generated audio loading fails.
- Preview displays Timing Diagnostics without audio, with non-blocking audio/waveform-unavailable copy.
- Missing `notes.chart` still makes chart timing unavailable.
- Offset milliseconds are rounded and empty diagnostics have explicit copy.

### Follow-up TDD evidence

| Work unit | Safety net | RED | GREEN / triangulation |
|---|---|---|---|
| Normalized source timing cache | Required focused baseline: 6 files, 72 tests passed | 5 files: 6 failed, 58 passed. Failures proved missing normalized timing propagation/cache preference, GPIF mismatch diagnostics, and audio-independent rendering. | Required focused suite: 6 files, 78 tests passed. Additional normalization suite: 1 file, 13 tests passed, covering both MIDI and GPIF normalized timing. |
| Chart timing without audio | Same 72-test focused baseline | Service cleared `chartData`; Preview lacked no-audio timing rendering/copy. | Service preserves chart data, exposes non-blocking waveform state, and Preview renders timing diagnostics without audio. |

### Follow-up commands and results

```bash
pnpm exec vitest run packages/chart/src/chartTiming.test.ts apps/desktop/electron/previewData.test.ts apps/desktop/src/app/services/desktop-preview.service.test.ts apps/desktop/src/app/pages/preview/preview-page.component.test.ts apps/desktop/src/app/services/source-review-model.test.ts packages/project/src/generatePackage.test.ts
# Baseline: 6 files, 72 tests passed.
# Final: 6 files, 78 tests passed.

pnpm exec vitest run apps/desktop/electron/previewData.test.ts apps/desktop/src/app/services/desktop-preview.service.test.ts apps/desktop/src/app/pages/preview/preview-page.component.test.ts apps/desktop/src/app/services/source-review-model.test.ts packages/project/src/normalizeSelection.test.ts
# RED: 5 files, 6 failed and 58 passed.

pnpm exec vitest run packages/project/src/normalizeSelection.test.ts
# 1 file, 13 tests passed.

pnpm test
# 61 files, 535 tests passed.

pnpm --filter @chdg/project build
# Passed.

pnpm --filter @chdg/project typecheck
# Passed.

pnpm --filter @chdg/chart typecheck
# Passed.

pnpm --filter @chdg/desktop exec tsc -p tsconfig.electron.json --noEmit
# Passed after rebuilding @chdg/project declarations.

pnpm --filter @chdg/desktop exec ngc -p tsconfig.app.json
# Passed after rebuilding @chdg/project declarations.

pnpm lint
# Passed; workspace packages report lint is not configured.

pnpm --filter @chdg/desktop typecheck
# Blocked: Node.js 25.9.0 / esbuild Angular build aborted with exit 134 (Abort trap: 6).

git diff --check
# Passed.
```

### Follow-up limitations

- Transport, waveform, and offset interaction remain unavailable when audio is unavailable; chart timing diagnostics remain readable.
- No Preview-triggered inspection or normalization was added.
- No Generate source-comparison expansion was added.
- Manual desktop interaction/screenshots were not performed in this executor environment.
- The combined desktop `ng build` typecheck remains blocked by the existing Node.js 25.9.0/esbuild abort; direct Angular and Electron compiler checks pass.
- External review remains incomplete by instruction.
