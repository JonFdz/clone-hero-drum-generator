# Checklist — Phase 17M

## Process

- [x] Read `AGENTS.md`.
- [ ] Confirm issue is approved.
- [x] Transfer accepted OpenSpec to Engram before implementation.
- [x] Stop if any required docs/OpenSpec files are missing.
- [x] Do not invent UI/product behavior outside docs.
- [x] Do not perform final review.

## Scope

- [x] Source Review Mapping Review UI improved.
- [x] No atlas decision changes.
- [x] No Generate changes.
- [x] No Preview changes.
- [x] No GPIF articulation resolver.
- [x] No candidate automap profile.

## Summary

- [x] Coverage summary distinguishes mapped/candidate/ignored known/unknown.
- [x] Pending review counts visible when applicable.
- [x] Override count visible.

## Filters

- [x] Needs review filter.
- [x] Candidates filter.
- [x] Unknown filter.
- [x] Ignored known filter.
- [x] Auto-mapped filter.
- [x] Overrides filter.
- [x] All filter.
- [x] Default filter = Needs review when pending items exist.
- [x] Default filter = All when no pending items exist.
- [x] Filter counts shown if practical.

## Rows

- [x] Compact card/list layout.
- [x] Source value visible.
- [x] Note name visible when available.
- [x] Count visible.
- [x] First tick visible when available.
- [x] Decision/status badge visible.
- [x] Suggested mapping visible for candidates.
- [x] Current mapping visible.
- [x] Confidence/reason visible for candidates/unknowns.
- [x] Ignored known percussion not shown as warning/error.
- [x] Unknown rows stand out.

## Actions

- [x] Candidate with suggestedPiece has Apply suggestion.
- [x] Candidate can be ignored.
- [x] Candidate can be mapped to another piece.
- [x] Unknown can be mapped.
- [x] Unknown can be ignored.
- [x] Ignored known can be mapped.
- [x] Auto-mapped can be overridden.
- [x] Auto-mapped can be ignored.
- [x] Override rows show Reset override.
- [x] Reset override works.

## Tests

- [x] Classification helpers tested.
- [x] Filter helpers tested.
- [x] Default filter tested.
- [x] Apply suggestion tested.
- [x] Ignore action tested.
- [x] Reset override tested.
- [ ] Empty filter state tested if model helper exists.
- [x] Existing Source Review tests still pass.

## Validation

- [x] Focused desktop/source-review tests run.
- [x] Relevant package tests run.
- [x] Typecheck/lint commands run if allowed by `AGENTS.md`.
- [ ] Manual validation documented in `EVIDENCE.md`.
