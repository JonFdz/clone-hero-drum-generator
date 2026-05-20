# Checklist Phase 13: Validation Checklist

## Before implementation

- [x] Read `docs/desktop/README.md`.
- [x] Read `docs/desktop/decisions.md`.
- [x] Read `docs/desktop/mockup-corrections.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Review visual references.

## Implementation

- [x] Implement only this phase scope.
- [x] Preserve existing tests.
- [x] Add/update tests for new behavior.
- [x] Update docs if implementation differs.

## Validation behavior implemented

- [x] Structured validation summary with `canGenerate`, severity counts, items, and `checkedAt`.
- [x] Stable validation item IDs for source/audio/output/tracks/offset/ffmpeg/generation/metadata/chart issues.
- [x] Errors block generation.
- [x] Warnings and info do not block generation.
- [x] Validation page is a real checklist, not a placeholder.
- [x] Generate page shows validation preflight before generation.
- [x] Missing source/audio/output/tracks block generation.
- [x] Unsupported source blocks generation.
- [x] Missing saved source/audio/output paths block generation when reported from loaded `.chdg` projects.
- [x] Invalid offset blocks generation.
- [x] FFmpeg unavailable blocks generation when audio conversion is required and the diagnostic reports unavailable.
- [x] `needs-regenerate` is a warning, not an error.
- [x] Metadata recommendations are warnings.
- [x] Merge/project issues such as duplicate hits, hi-hat conflicts, and impossible chords are surfaced as non-blocking chart warnings/info.
- [x] Validation is recomputed from current desktop state; no `.chdg` schema change was added.

## Validation

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] `pnpm --filter @chdg/desktop build` passes.
- [x] `pnpm --filter @chdg/desktop typecheck` passes.
- [x] `pnpm chdg --help` passes.
- [ ] Manual desktop validation recorded if relevant.

## Deferred

- [x] Do not implement future phases unless explicitly approved.
- [x] No preview/waveform/highway.
- [x] No mapping overrides.
- [x] No note editor.
- [x] No packaging.
- [x] No full UX polish pass.
