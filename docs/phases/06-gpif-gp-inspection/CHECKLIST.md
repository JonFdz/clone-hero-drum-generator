# Checklist Phase 06: GPIF / .gp Inspection

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/implementation/implementation-plan.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Read the OpenSpec artifacts for `phase-06-gpif-gp-inspection`.
- [x] Inspect CLI command routing.
- [x] Inspect package/tsconfig conventions.
- [x] Inspect `packages/midi` inspection patterns.

## Implementation

- [x] Add `packages/guitarpro`.
- [x] Add package config and tsconfig.
- [x] Add public exports.
- [x] Implement GPIF extraction from `.gp` containers.
- [x] Prefer `Content/score.gpif` when present.
- [x] Fail clearly for unsupported files.
- [x] Parse GPIF XML safely.
- [x] Extract metadata when available.
- [x] Extract/list tracks when available.
- [x] Detect likely drum track candidates.
- [x] Inspect tempo/time-signature structures when available.
- [x] Inspect markers/sections when available.
- [x] Inspect drum/percussion/articulation structures when available.
- [x] Report unknown/unhandled structures without crashing.
- [x] Add `inspect-gp <file>` CLI command.
- [x] Keep `apps/cli` orchestration-only.

Dependency choices:

- `fflate` reads modern `.gp` ZIP-like containers with a small, Node-compatible footprint.
- `fast-xml-parser` parses GPIF XML deterministically with attributes and text nodes available for inspection.

## Tests

- [x] GPIF extraction from synthetic `.gp` ZIP fixture.
- [x] Unsupported file without GPIF fails clearly.
- [x] Metadata inspection from minimal GPIF XML.
- [x] Track listing from minimal GPIF XML.
- [x] Drum track candidate detection.
- [x] Marker/section candidate reporting.
- [x] Missing metadata does not crash.
- [x] Output/structured result is deterministic.
- [x] No copyrighted `.gp`, MIDI, or audio fixtures committed.

## Validation

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] Optional local `.gp` validation recorded if files exist.
  - Validated `samples/demo.gp` locally: report printed GPIF entry, metadata, tracks, drum candidate, tempo automation (`Tempo: 147 2`), time signatures and drum structures.
  - `samples/eat-my-dust.gp` was absent locally.
- [x] No chart generation from `.gp` was added.
- [x] No GPIF drum normalization was added.

## Deferred

- [ ] GPIF drum normalization.
- [ ] Generate from GPIF.
- [ ] GPIF section import into generated charts.
- [ ] Desktop UI.
- [ ] Songsterr scraping/downloading.
- [ ] Old binary GP3/GP4/GP5 support.
