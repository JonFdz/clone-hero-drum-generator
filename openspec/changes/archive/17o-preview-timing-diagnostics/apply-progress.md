# Apply Progress — Phase 17O — Preview Timing Diagnostics

## Status

- Branch: `feat/phase-17o-preview-timing-diagnostics`
- Mode: Strict TDD
- Delivery: Single PR with explicit `size:exception`
- Progress: 66/67 tasks complete
- Remaining: PR creation only; intentionally outside this executor task

## Completed work units

1. Shared generated `notes.chart` timing parser, model, diagnostics, formatting, and cached source comparison.
2. Generate result timing summary and important-warning presentation.
3. Preview payload, cached analysis handoff, detailed diagnostics UI, tables, and note summary.
4. Deterministic SyncTrack ordering by tick with TS before B at equal ticks.
5. Focused, regression, type, compiler, and lint validation.
6. Fresh internal review corrections:
   - Preview fallback now applies 120 BPM only before the first valid tempo and preserves later valid tempo changes.
   - Unusable raw GPIF inspection timing summaries now make cached source comparison unavailable instead of simulating empty source timing.
   - Equal-count source/generated time-signature differences are compared by exact tick, numerator, and denominator semantics.
7. Active review-remediation corrections:
   - Preview validates cached analysis against the current source fingerprint, mapping fingerprint, selected tracks, and established source-review freshness rules before source comparison.
   - Malformed persisted nested timing collections degrade to source comparison unavailable instead of throwing.
   - Duplicate BPM tick diagnostics include invalid parsed BPM events, while generated timing calculations remain limited to valid tempos.
8. Fresh-review runtime-boundary coverage:
   - `DesktopPreviewService.load()` is now exercised directly through the Angular-decorated service boundary.
   - Stale and fingerprint-unavailable caches are proven to reach `desktopBridge.getChartPreviewData` as `analysis: undefined`.
   - Fresh caches are proven to be forwarded unchanged.
   - The Vitest transform now supports Angular legacy decorators for renderer service tests.

## TDD Cycle Evidence

| Work unit | Test files | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Parser/model/diagnostics | `packages/chart/src/chartTiming.test.ts` | Unit | New module; existing chart baseline supplied by orchestrator | Missing module failed | 11/11 passed | Multiple tempo segments, missing maps, invalid/duplicate data, jump thresholds, long-song and offset cases | Pure parsing/comparison/summary helpers extracted |
| SyncTrack ordering | `packages/chart/src/chartWriter.test.ts` | Unit | Existing writer tests passed in supplied baseline | Ordering assertion failed | 34/34 passed | Multiple ticks plus equal-tick TS/B ordering | Shared sorted event list extracted |
| Generate summary | `packages/project/src/generatePackage.test.ts` | Unit | Existing generate suite passed in supplied baseline | Missing `timing` result failed | 12/12 passed | Full suite covered MIDI, GPIF, mappings, cover handling | Shared chart parser reused; no duplicate timing logic |
| Preview payload/cache | `apps/desktop/electron/previewData.test.ts`, `apps/desktop/electron/main.validation-regression.test.ts` | Unit | Existing Preview/Electron tests passed in supplied baseline | Missing timing payload/cache handoff failed | 17/17 passed | Cache available/unavailable and mismatch cases | Cache sanitizer limited to accepted timing fields |
| Preview/Generate UI | `apps/desktop/src/app/pages/preview/preview-page.component.test.ts`, `apps/desktop/src/app/pages/generate/generate-page.component.test.ts` | Unit/source contract | Existing Generate UI test passed in supplied baseline | Missing timing copy/tables failed | 7/7 passed | Detailed Preview versus concise Generate contracts | Kept existing layout and added one bounded timing card/summary |
| Fresh internal review: partial fallback map | `apps/desktop/electron/previewData.test.ts` | Unit | 23/23 focused parser/Preview tests passed before fixes | Later 60 BPM event was ignored after the 120 BPM fallback | 27/27 focused parser/Preview tests passed | Notes before, at, and after the first valid tempo prove fallback-to-real-map transition | Reused the generated timing event table for Preview playback timing |
| Fresh internal review: cached source usability | `apps/desktop/electron/previewData.test.ts` | Unit | 23/23 focused parser/Preview tests passed before fixes | Raw GPIF `{path,value}` timing summaries produced a false empty snapshot | 27/27 focused parser/Preview tests passed | Valid MIDI cache, missing cache, and unusable GPIF cache covered | Validation now rejects the whole comparison snapshot if any cached timing values are unusable |
| Fresh internal review: exact TS semantics | `packages/chart/src/chartTiming.test.ts` | Unit | 23/23 focused parser/Preview tests passed before fixes | Equal-count numerator mismatch emitted no diagnostic | 27/27 focused parser/Preview tests passed | Exact equal-count match and semantic mismatch covered | Exact tick/numerator/denominator matching is computed once before emitting the accepted diagnostic |
| Review remediation: Preview cache freshness | `apps/desktop/src/app/services/source-review-model.test.ts` | Unit | 22/22 source-review model tests passed | 1 failed, 22 passed: `resolvePreviewAnalysisCache is not a function` | 23/23 passed after reusing established validation | 24/24 passed with fresh-cache preservation and mapping-stale rejection | No further refactor needed; one helper centralizes the Preview decision |
| Review remediation: malformed nested cache | `apps/desktop/electron/previewData.test.ts` | Unit | 14/14 Preview data tests passed | 1 failed, 14 passed: malformed `inspection.tempos` threw `flatMap is not a function` | 15/15 passed after nested array guards | 16/16 passed with malformed TS/sections and valid-cache preservation | No further refactor needed |
| Review remediation: invalid BPM duplicate tick | `packages/chart/src/chartTiming.test.ts` | Unit | 13/13 chart timing tests passed | 1 failed, 13 passed: invalid+valid same-tick input lacked `TIMING_DUPLICATE_TEMPO_TICK` | 14/14 passed after raw-event duplicate detection | 15/15 passed with invalid-only duplicate tick and per-event invalid diagnostics | Separated structural duplicate input from valid timing-map input |
| Fresh review: service cache handoff | `apps/desktop/src/app/services/desktop-preview.service.test.ts` | Service/runtime boundary | 55/55 combined remediation tests passed | Mutation of the service wiring to forward `state.analysisCache` directly produced 2 failed, 1 passed | Restored the existing freshness wiring; 3/3 passed | Stale, fingerprint-unavailable, and fresh cache paths covered | Added the minimum Vitest TypeScript pre-transform required to execute Angular-decorated renderer services |

## Validation

- Safety net: `pnpm vitest run apps/desktop/electron/previewData.test.ts packages/chart/src/chartTiming.test.ts` — 2 files, 23 tests passed before review-finding edits.
- RED confirmation: the same command — 3 behavioral tests failed and 24 passed.
- GREEN/refactor confirmation: the same command — 2 files, 27 tests passed.
- Review remediation safety nets:
  - `pnpm vitest run apps/desktop/src/app/services/source-review-model.test.ts` — 1 file, 22 tests passed.
  - `pnpm vitest run apps/desktop/electron/previewData.test.ts` — 1 file, 14 tests passed.
  - `pnpm vitest run packages/chart/src/chartTiming.test.ts` — 1 file, 13 tests passed.
- Review remediation RED:
  - Source freshness — 1 failed, 22 passed (`resolvePreviewAnalysisCache is not a function`).
  - Malformed nested cache — 1 failed, 14 passed (`cache.inspection.tempos.flatMap is not a function`).
  - Invalid BPM duplicate tick — 1 failed, 13 passed (missing `TIMING_DUPLICATE_TEMPO_TICK`).
- Review remediation GREEN/TRIANGULATE:
  - Source freshness — 23/23 GREEN, then 24/24 triangulated.
  - Malformed nested cache — 15/15 GREEN, then 16/16 triangulated.
  - Invalid BPM duplicate tick — 14/14 GREEN, then 15/15 triangulated.
- `pnpm vitest run apps/desktop/src/app/services/source-review-model.test.ts apps/desktop/electron/previewData.test.ts packages/chart/src/chartTiming.test.ts` — 3 files, 55 tests passed.
- Fresh-review service regression:
  - Initial direct import attempt — suite failed before collection with `SyntaxError: Invalid or unexpected token` and 0 tests; not accepted as coverage.
  - After adding the Angular legacy-decorator Vitest transform, the service test executed successfully.
  - RED mutation: `pnpm vitest run apps/desktop/src/app/services/desktop-preview.service.test.ts` — 2 failed, 1 passed when `load()` forwarded `state.analysisCache` directly.
  - GREEN/TRIANGULATE after restoring the existing validated handoff — 1 file, 3 tests passed.
- `pnpm vitest run apps/desktop/src/app/services/desktop-preview.service.test.ts apps/desktop/src/app/services/source-review-model.test.ts apps/desktop/electron/previewData.test.ts packages/chart/src/chartTiming.test.ts` — 4 files, 58 tests passed.
- Fresh-review Phase 17O/remediation command across 11 files — 137 tests passed.
- `pnpm test` — 61 files, 529 tests passed with the Angular service test included.
- `pnpm --filter @chdg/desktop exec ngc -p tsconfig.app.json` — passed.
- `pnpm --filter @chdg/desktop exec tsc -p tsconfig.electron.json --noEmit` — passed.
- `git diff --check` — passed.
- Review-remediation Phase 17O command across 10 files — 134 tests passed.
- Review-remediation targeted checks: chart typecheck, Electron TypeScript, direct Angular compiler, and `git diff --check` passed.
- `pnpm vitest run packages/chart/src/chartTiming.test.ts packages/chart/src/chartWriter.test.ts apps/desktop/electron/previewData.test.ts packages/project/src/generatePackage.test.ts apps/desktop/src/app/services/desktop-preview-model.test.ts apps/desktop/src/app/pages/preview/preview-page.component.test.ts apps/desktop/src/app/pages/generate/generate-page.component.test.ts apps/desktop/src/app/services/desktop-generate-state.service.test.ts apps/desktop/electron/main.validation-regression.test.ts` — 9 files, 106 tests passed.
- `pnpm test` — 60 files, 520 tests passed.
- `pnpm --filter @chdg/chart typecheck` — passed.
- `pnpm --filter @chdg/project typecheck` — passed.
- `pnpm --filter @chdg/desktop exec tsc -p tsconfig.electron.json --noEmit` — passed.
- `pnpm --filter @chdg/desktop exec ngc -p tsconfig.app.json` — passed.
- `pnpm lint` — passed; package scripts report lint is not configured.
- `pnpm --filter @chdg/desktop typecheck` — renderer `ng build` aborted in esbuild under Node.js 25.9.0; direct Angular compiler and Electron TypeScript checks passed.

## Deviations and risks

- No design deviation.
- The earlier zero-test Angular import failure is resolved: the root Vitest config now pre-transpiles renderer TypeScript with legacy decorator support, and the service/runtime-boundary suite executes three behavioral tests.
- The fresh internal review findings were corrected; this is implementation self-check evidence, not an external review claim.
- Manual desktop interaction/screenshots were not performed in this executor environment; copied UI text and compiler evidence are recorded instead.
- External verification/review and PR creation remain incomplete by instruction.
