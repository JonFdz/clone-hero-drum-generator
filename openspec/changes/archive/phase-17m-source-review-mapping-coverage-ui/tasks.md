# Tasks — Phase 17M Source Review Mapping Coverage UI

## 0. Process

- [ ] Read `AGENTS.md`.
- [ ] Confirm issue has `status:approved`.
- [ ] Read Phase 17M docs/OpenSpec.
- [ ] Transfer accepted OpenSpec to Engram.
- [ ] Stop if any required file is missing.
- [ ] Do not implement until Engram is aligned.

## 1. Inspect current Source Review mapping UI

- [ ] Locate current Mapping Review section.
- [ ] Locate current mapping row model.
- [ ] Locate existing override handlers.
- [ ] Locate route/use status for `/mapping` page.
- [ ] Decide whether to reuse, refactor, or leave `/mapping` unchanged.

## 2. Add/extend mapping UI model helpers

- [ ] Add filter enum/type.
- [ ] Add row classification helper.
- [ ] Add filter helper.
- [ ] Add default filter helper.
- [ ] Add row display helper if useful.
- [ ] Reuse Phase 17L `mappingReviewCounts` and `mappingAttentionState`.

## 3. Update Source Review UI

- [ ] Add compact coverage summary.
- [ ] Add educational copy.
- [ ] Add filter chips.
- [ ] Add compact row/card list.
- [ ] Add empty state for no rows.
- [ ] Add empty state for no rows matching filter.
- [ ] Ensure ignored known does not look like warning/error.
- [ ] Ensure unknown rows stand out.

## 4. Add actions

- [ ] Apply suggestion for candidates with suggested piece.
- [ ] Map to piece dropdown/select.
- [ ] Ignore action.
- [ ] Reset override action.
- [ ] Preserve existing mapping changed/recompute behavior.

## 5. Preserve profile behavior

- [ ] Keep profile controls low prominence.
- [ ] Ensure save/apply profile still works.
- [ ] Ensure override rows reflect profile-applied overrides.

## 6. Tests

- [ ] Test row classification.
- [ ] Test filters.
- [ ] Test default filter.
- [ ] Test needs-review definition.
- [ ] Test candidate apply suggestion.
- [ ] Test unknown ignore/map behavior if helper-level possible.
- [ ] Test reset override if helper-level possible.
- [ ] Test ignored known not included in needs-review.
- [ ] Test override rows appear in Overrides filter.

## 7. Validation

- [ ] Run focused tests.
- [ ] Run typecheck/lint commands allowed by `AGENTS.md`.
- [ ] Update `EVIDENCE.md`.
- [ ] Update PR body with validation and manual notes.

## 8. PR

- [ ] Link issue.
- [ ] Use conventional title.
- [ ] Include final review external note.
- [ ] Do not merge.
