# Tasks — Phase 17L

## 1. Preparation

- [ ] Read required docs and OpenSpec.
- [ ] Transfer accepted OpenSpec into Engram.
- [ ] Confirm Engram is the source of truth before implementation.
- [ ] Stop and report if any required file is missing.

## 2. Atlas model

- [ ] Replace flat mapping JSON with rich atlas entries.
- [ ] Add atlas version `0.1.0`.
- [ ] Add mapping action/confidence/family/source types.
- [ ] Add resolver that returns `map`, `candidate`, `ignore`, or `unknown` resolution.
- [ ] Add validation tests for atlas entry shape.

## 3. Atlas data

- [ ] Add GM 35–81 entries exactly following `MAPPING_ATLAS_DECISIONS.md`.
- [ ] Add extended 27–34 and 82–87 entries exactly following `MAPPING_ATLAS_DECISIONS.md`.
- [ ] Ensure `44 Pedal Hi-Hat` is candidate, not map.
- [ ] Ensure `39 Hand Clap` is candidate -> snare.
- [ ] Ensure known auxiliary percussion entries are ignore.
- [ ] Ensure candidates do not auto-generate notes by default.

## 4. MIDI normalization

- [ ] Update MIDI normalization to use resolver.
- [ ] Generate hits only for `map` entries and piece overrides.
- [ ] Skip candidate entries by default while recording coverage.
- [ ] Skip ignored entries while recording coverage.
- [ ] Track unknown entries.
- [ ] Preserve or update track candidate selection carefully.
- [ ] Add tests for map/candidate/ignore/unknown behavior.

## 5. Overrides

- [ ] Ensure existing project overrides can map candidate notes.
- [ ] Ensure existing project overrides can map ignored notes.
- [ ] Ensure existing project overrides can map unknown notes.
- [ ] Ensure existing project overrides can ignore auto-mapped notes.
- [ ] Add tests.

## 6. Project model and cache

- [ ] Add mapping coverage summary to `NormalizationPreview`.
- [ ] Persist coverage summary in `.chdg` analysis.
- [ ] Include atlas version in fingerprint/cache invalidation.
- [ ] Make missing coverage safe for existing projects.
- [ ] Add tests for cache/fingerprint version behavior.

## 7. Issues / Generate behavior

- [ ] Candidate unresolved notes are non-blocking.
- [ ] Unknown notes are non-blocking warnings/status.
- [ ] Ignored known percussion does not create noisy warnings.
- [ ] Generate still succeeds with candidates/ignored/unknowns.
- [ ] Add tests.

## 8. Minimal Source Review visibility

- [ ] Show compact coverage summary in Source Review.
- [ ] Keep existing override controls functional.
- [ ] Do not implement full UI redesign.
- [ ] Add/update UI/model tests if existing patterns support it.

## 9. Validation

- [ ] Run allowed focused tests.
- [ ] Run allowed typecheck/lint commands per `AGENTS.md`.
- [ ] Update `EVIDENCE.md`.
- [ ] Update PR body with validation results.
