# Checklist — Phase 17L

## Docs / OpenSpec

- [x] Accepted OpenSpec transferred to Engram before implementation.
- [x] Engram updated as source of truth.
- [x] Missing files checked before implementation.

## Atlas

- [x] Flat `general-midi-drums.json` replaced with rich atlas entries.
- [x] Atlas version exported as `0.1.0`.
- [x] GM 35–81 entries included.
- [x] Extended 27–34 and 82–87 entries included.
- [x] `44 Pedal Hi-Hat` is candidate, not map.
- [x] Candidates do not generate by default.
- [x] Ignored known percussion does not generate by default.
- [x] Unknown notes remain visible.

## Normalization

- [x] MIDI normalization uses atlas resolver.
- [x] Auto-map entries create `DrumHit`.
- [x] Candidate entries are tracked but skipped by default.
- [x] Ignore entries are tracked but skipped.
- [x] Unknown entries are tracked and produce non-blocking warning/status.
- [x] Project overrides can map candidate/ignored/unknown notes.
- [x] Project overrides can ignore auto-mapped notes.

## Project model/cache

- [x] Mapping coverage summary added to `NormalizationPreview`.
- [x] Coverage summary persisted in `.chdg` analysis.
- [x] Mapping atlas version included in cache/fingerprint logic.
- [x] Existing `.chdg` loading handles absence of coverage safely.

## UI minimal

- [x] Source Review shows compact coverage summary.
- [x] Ignored known percussion is not presented as a strong warning.
- [x] Candidate and unknown counts are visible.
- [x] Existing override controls still work.

## Tests

- [x] Atlas resolver tests.
- [x] MIDI normalization tests for map/candidate/ignore/unknown.
- [x] Override tests for map and ignore.
- [x] Coverage summary tests.
- [x] Cache/fingerprint atlas version test.
- [x] Minimal Source Review/model test if applicable.

## Validation

- [x] `pnpm test` or allowed test equivalent reported.
- [x] Package-specific tests reported.
- [x] Typecheck/lint commands reported if allowed by `AGENTS.md`.
- [x] Manual validation notes added to `EVIDENCE.md`.
