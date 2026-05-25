# Checklist Phase 17G: Source Review Unification

## Read context

- [ ] Read `AGENTS.md`.
- [ ] Transfer accepted OpenSpec decisions/tasks/validation rules into Engram before implementation.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Open `docs/desktop/mockups/11-source-review.png`.
- [ ] Open `docs/desktop/mockups/11a-source-review-expanded.png`.
- [ ] Review existing Inspect Source page.
- [ ] Review existing Track Selection page.
- [ ] Review existing Mapping page.
- [ ] Review `DesktopGenerateStateService`.
- [ ] Review project file persistence/bridge code.
- [ ] Review Generate and Validation route links/fix actions.

## Docs / mockups

- [ ] Add phase docs under `docs/phases/17g-source-review-unification/`.
- [ ] Add `docs/desktop/mockups/11-source-review.png`.
- [ ] Add `docs/desktop/mockups/11a-source-review-expanded.png`.
- [ ] Update desktop mockup index/readme if needed.

## Routing / navigation

- [ ] Add `/source-review` route.
- [ ] Replace sidebar `Inspect Source`, `Track Selection`, `Mapping` with `Source Review`.
- [ ] Remove old entries from sidebar.
- [ ] Redirect `/inspect-source` to `/source-review` or remove safely.
- [ ] Redirect `/track-selection` to `/source-review` or remove safely.
- [ ] Redirect `/mapping` to `/source-review` or remove safely.
- [ ] Update Project Details action from `Inspect Source` to `Review Source`.
- [ ] Update Generate Back action to `/source-review`.
- [ ] Update Validation tracks/chart fix routes to `/source-review`.
- [ ] Update source/input fix routes to `/projects/details` where appropriate.

## Source Review UI

- [ ] Create `SourceReviewPageComponent`.
- [ ] Create/use `SourceReviewHeaderComponent`.
- [ ] Create/use `SourceReviewSelectedSourceCardComponent`.
- [ ] Create/use `SourceSummaryCardComponent`.
- [ ] Create/use `CombinedSummaryCardComponent`.
- [ ] Create/use `PieceSummaryPreviewComponent`.
- [ ] Create/use `TrackCandidatesTableComponent`.
- [ ] Create/use `MappingReviewAccordionComponent`.
- [ ] Create/use `MappingOverridesTableComponent`.
- [ ] Create/use `ActiveOverridesSummaryComponent`.
- [ ] Create/use `MappingProfilesCompactComponent`.
- [ ] Create/use `IssuesWarningsPanelComponent`.
- [ ] Create/use `AdvancedJsonPanelComponent`.
- [ ] Create/use `SourceReviewBottomActionsComponent`.
- [ ] Match mockup default/collapsed state.
- [ ] Match mockup expanded mapping/issues state.
- [ ] Keep mapping compact/collapsed by default when clean.
- [ ] Auto-expand mapping when unknowns/overrides/manual review exist.
- [ ] Keep Issues & Warnings compact when clean.
- [ ] Do not show audio/output folder requirements in Source Review.
- [ ] Do not show a Role column in Track Candidates.
- [ ] Do not show a Merge Rules card.
- [ ] Do not show a Tempo & Sections card.
- [ ] Show Sections only as a Source Summary value.

## Orchestration

- [ ] Add testable source review orchestration layer.
- [ ] Automatically inspect when entering with valid source and no valid cache.
- [ ] Automatically select exactly one strongest track for new/no-selection source.
- [ ] Automatically normalize after inspection.
- [ ] Automatically normalize after selectedTracks changes.
- [ ] Automatically normalize after mappingOverrides changes.
- [ ] Preserve manual selectedTracks until source changes.
- [ ] Reset selectedTracks only when source changes.
- [ ] Avoid loops/races with runId/input keys.
- [ ] Discard stale async results.
- [ ] Show running state only when needed.
- [ ] Keep fast mapping/track update mostly silent.

## Project file / cache persistence

- [ ] Add `analysis?: ChdgProjectAnalysisCache` to project file types.
- [ ] Add defensive validation for analysis cache.
- [ ] Existing `.chdg` files without analysis still open.
- [ ] Malformed analysis cache does not block project open.
- [ ] Add source fingerprint using path + sizeBytes + mtimeMs.
- [ ] Add mapping fingerprint.
- [ ] Add selectedTracks to analysis cache.
- [ ] Save complete inspection result.
- [ ] Save complete normalization preview when available.
- [ ] Load cached analysis into desktop generate state.
- [ ] Invalidate full analysis when source fingerprint changes.
- [ ] Invalidate normalization preview when mapping fingerprint changes.
- [ ] Autosave analysis cache when projectFilePath exists.
- [ ] Autosave failures are non-blocking.

## Mapping / profiles

- [ ] Reuse existing mapping row model where practical.
- [ ] Reuse existing mapping profile bridge methods.
- [ ] Reuse existing apply profile merge/replace behavior.
- [ ] Changing override triggers automatic normalization.
- [ ] Applying profile triggers automatic normalization.
- [ ] Profiles remain local-only.

## Tests

- [ ] Project file backwards compatibility without analysis.
- [ ] Project file accepts valid analysis cache.
- [ ] Project file ignores/drops malformed analysis cache safely.
- [ ] Source fingerprint change invalidates analysis.
- [ ] Mapping fingerprint change invalidates normalization preview.
- [ ] Strongest track selection selects exactly one track.
- [ ] Manual selectedTracks persist until source changes.
- [ ] Source change resets selectedTracks and picks strongest track.
- [ ] Selected track change triggers normalization.
- [ ] Mapping override change triggers normalization.
- [ ] Stale async results are discarded.
- [ ] Generate back route points to `/source-review`.
- [ ] Validation track/chart fix routes point to `/source-review`.
- [ ] Sidebar contains Source Review and not Inspect/Track/Mapping.

## Validation commands

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

## Manual validation

- [ ] Open project with source and no cache: analysis runs automatically.
- [ ] Source Review selects exactly one strongest track by default.
- [ ] Track changes update summary automatically.
- [ ] Mapping clean state is collapsed by default.
- [ ] Mapping with unknowns/overrides expands or prompts review.
- [ ] Issues clean state is compact.
- [ ] Issues warning/unknown state expands correctly.
- [ ] Source Review does not require audio.
- [ ] Source Review does not require output folder.
- [ ] Continue to Generate navigates to Generate.
- [ ] Generate Back returns to Source Review.
- [ ] Close/reopen project uses cached analysis without re-running when valid.
- [ ] Changing source invalidates cache and re-runs review.
