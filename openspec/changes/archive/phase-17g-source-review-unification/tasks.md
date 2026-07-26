# Tasks: Phase 17G — Source Review Unification

## 0. Source of truth setup

- [ ] Read `AGENTS.md`.
- [ ] Read phase docs in `docs/phases/17g-source-review-unification/`.
- [ ] Read this OpenSpec change.
- [ ] Transfer accepted decisions, constraints, tasks, and validation rules into Engram before implementation.
- [ ] Confirm Engram is aligned and use it as the implementation source of truth.

## 1. Docs and mockup context

- [ ] Inspect `docs/desktop/mockups/11-source-review.png`.
- [ ] Inspect `docs/desktop/mockups/11a-source-review-expanded.png`.
- [ ] Keep implementation visually consistent with existing desktop mockups.
- [ ] Do not treat mockup placeholder numbers/text as source of truth when they conflict with domain types or product rules.

## 2. Routing and navigation

- [ ] Add `/source-review` route.
- [ ] Add Source Review sidebar item.
- [ ] Remove Inspect Source from sidebar.
- [ ] Remove Track Selection from sidebar.
- [ ] Remove Mapping from sidebar.
- [ ] Redirect `/inspect-source` to `/source-review` or otherwise remove safely.
- [ ] Redirect `/track-selection` to `/source-review` or otherwise remove safely.
- [ ] Redirect `/mapping` to `/source-review` or otherwise remove safely.
- [ ] Update Project Details action to `Review Source` and route to `/source-review`.
- [ ] Update Generate Back action to `/source-review`.
- [ ] Update Validation tracks/chart fix routes to `/source-review`.
- [ ] Update source/project input fix routes to `/projects/details` where appropriate.
- [ ] Search for remaining hardcoded old route links and update them.

## 3. Project analysis cache model

- [ ] Add optional project analysis cache type to project file types.
- [ ] Validate analysis cache safely.
- [ ] Ensure projects without `analysis` remain valid.
- [ ] Ensure malformed `analysis` does not block project open.
- [ ] Persist valid `analysis` when saving `.chdg`.
- [ ] Load valid `analysis` into desktop generate/source review state.
- [ ] Drop/ignore invalid cache safely.

## 4. Fingerprints

- [ ] Implement source fingerprint model: path + sizeBytes + mtimeMs.
- [ ] Add safe Electron-side file metadata/fingerprint capability if needed.
- [ ] Do not expose generic renderer file reads.
- [ ] Implement stable mappingOverrides fingerprint.
- [ ] Implement selectedTracks key with sorted selected track indexes.
- [ ] Test fingerprint equality/mismatch behavior.

## 5. Source Review orchestration

- [ ] Add `SourceReviewOrchestratorService` or equivalent testable orchestration.
- [ ] Use valid cache without calling inspect/normalize.
- [ ] On missing/invalid cache, run inspect automatically.
- [ ] Select exactly one strongest candidate for a new source.
- [ ] Do not auto-select multiple complementary tracks.
- [ ] Preserve manual track selection until source changes.
- [ ] Normalize automatically after inspect/default selection.
- [ ] Re-normalize automatically after selectedTracks changes.
- [ ] Re-normalize automatically after mappingOverrides changes.
- [ ] Avoid infinite effects/loops.
- [ ] Discard stale async inspect/normalize results.
- [ ] Show visible first-entry analysis state.
- [ ] Keep fast mapping/track updates silent unless they take noticeable time.

## 6. Source Review UI

- [ ] Build Source Review page matching the default/collapsed mockup.
- [ ] Implement Selected Source card.
- [ ] Implement Source Summary card.
- [ ] Implement Combined Summary card.
- [ ] Implement Piece Summary Preview card.
- [ ] Implement Track Candidates table with checkbox, Track, Name, Notes, Confidence, Status.
- [ ] Do not show a Role column.
- [ ] Implement Mapping Review collapsed state.
- [ ] Implement Mapping Review expanded state.
- [ ] Implement Mapping Overrides table.
- [ ] Implement Active Overrides Summary.
- [ ] Implement compact Profile Actions.
- [ ] Implement Issues & Warnings collapsed state.
- [ ] Implement Issues & Warnings expanded state.
- [ ] Implement read-only Advanced/View JSON action.
- [ ] Implement bottom actions: Back to Project Details and Continue to Generate.
- [ ] Ensure Source Review does not require or display audio/output folder as mandatory context.

## 7. Mapping behavior

- [ ] Reuse existing mapping rows/model where possible.
- [ ] Keep Mapping Review collapsed when clean.
- [ ] Show attention/expand when unknowns or active overrides exist.
- [ ] Applying a profile changes project mappingOverrides.
- [ ] Save profile from current overrides still works.
- [ ] Profile merge/replace behavior remains intact.
- [ ] Mapping override changes trigger automatic normalization update.
- [ ] Mapping override changes autosave when possible.

## 8. Autosave

- [ ] Autosave after successful first Source Review when projectFilePath exists.
- [ ] Autosave after selectedTracks changes and normalization succeeds when projectFilePath exists.
- [ ] Autosave after mapping changes and normalization succeeds when projectFilePath exists.
- [ ] Keep analysis in memory when projectFilePath does not exist.
- [ ] Do not block user flow on autosave failure.
- [ ] Do not mark project dirty only because analysis cache was persisted.

## 9. Tests

- [ ] Project without analysis opens.
- [ ] Valid analysis cache opens and loads.
- [ ] Malformed analysis cache is ignored/dropped safely.
- [ ] Analysis cache persists inspection and normalizationPreview.
- [ ] Source fingerprint mismatch invalidates cache.
- [ ] Mapping fingerprint mismatch invalidates normalization cache.
- [ ] Valid cache skips inspect/normalize.
- [ ] First entry runs inspect and normalize.
- [ ] Strongest default selection selects exactly one track.
- [ ] Manual selectedTracks persist until source changes.
- [ ] Source change resets manual selection.
- [ ] selectedTracks change re-normalizes.
- [ ] mappingOverrides change re-normalizes.
- [ ] Stale async results are discarded.
- [ ] Sidebar contains Source Review and not the old three items.
- [ ] Generate back route goes to Source Review.
- [ ] Validation tracks/chart fix routes go to Source Review.
- [ ] Mapping clean state is collapsed.
- [ ] Mapping attention state expands or clearly prompts review.
- [ ] Issues clean state is compact.
- [ ] Issues attention state shows warnings/unknowns.

## 10. Validation commands

- [ ] `pnpm build`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm --filter @chdg/desktop build`
- [ ] `pnpm --filter @chdg/desktop typecheck`
- [ ] `pnpm chdg --help`

## 11. PR hygiene

- [ ] First commit is docs-only.
- [ ] Implementation commit(s) follow after docs commit.
- [ ] OpenSpec is not committed unless Jon explicitly requests it.
- [ ] PR body links the relevant issue.
- [ ] PR body lists tests run.
- [ ] PR body states manual validation status.
- [ ] Do not merge without Jon approval.
