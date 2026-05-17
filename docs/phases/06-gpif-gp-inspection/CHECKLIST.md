# Checklist Phase 06: GPIF / .gp Inspection

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/implementation/implementation-plan.md`.
- [ ] Read this phase PRD.
- [ ] Read this phase ADR.
- [ ] Read the OpenSpec artifacts for `phase-06-gpif-gp-inspection`.
- [ ] Inspect CLI command routing.
- [ ] Inspect package/tsconfig conventions.
- [ ] Inspect `packages/midi` inspection patterns.

## Implementation

- [ ] Add `packages/guitarpro`.
- [ ] Add package config and tsconfig.
- [ ] Add public exports.
- [ ] Implement GPIF extraction from `.gp` containers.
- [ ] Prefer `Content/score.gpif` when present.
- [ ] Fail clearly for unsupported files.
- [ ] Parse GPIF XML safely.
- [ ] Extract metadata when available.
- [ ] Extract/list tracks when available.
- [ ] Detect likely drum track candidates.
- [ ] Inspect tempo/time-signature structures when available.
- [ ] Inspect markers/sections when available.
- [ ] Inspect drum/percussion/articulation structures when available.
- [ ] Report unknown/unhandled structures without crashing.
- [ ] Add `inspect-gp <file>` CLI command.
- [ ] Keep `apps/cli` orchestration-only.

## Tests

- [ ] GPIF extraction from synthetic `.gp` ZIP fixture.
- [ ] Unsupported file without GPIF fails clearly.
- [ ] Metadata inspection from minimal GPIF XML.
- [ ] Track listing from minimal GPIF XML.
- [ ] Drum track candidate detection.
- [ ] Marker/section candidate reporting.
- [ ] Missing metadata does not crash.
- [ ] Output/structured result is deterministic.
- [ ] No copyrighted `.gp`, MIDI, or audio fixtures committed.

## Validation

- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] Optional local `.gp` validation recorded if files exist.
- [ ] No chart generation from `.gp` was added.
- [ ] No GPIF drum normalization was added.

## Deferred

- [ ] GPIF drum normalization.
- [ ] Generate from GPIF.
- [ ] GPIF section import into generated charts.
- [ ] Desktop UI.
- [ ] Songsterr scraping/downloading.
- [ ] Old binary GP3/GP4/GP5 support.
