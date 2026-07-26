# Tasks: Phase 16A — Project Mapping Overrides

## 1. Read context

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/phases/16a-project-mapping-overrides/PRD.md`.
- [ ] Read `docs/phases/16a-project-mapping-overrides/ADR.md`.
- [ ] Read `docs/phases/16a-project-mapping-overrides/CHECKLIST.md`.
- [ ] Read Phase 15 docs.
- [ ] Read Phase 14A/14B docs.
- [ ] Review visual reference:
  - `docs/desktop/mockups/09-mapping-overrides.png`
- [ ] Read OpenSpec artifacts if present.

## 2. Sync context to Engram

- [ ] Save change ID: `phase-16a-project-mapping-overrides`.
- [ ] Save branch name: `feat/phase-16a-project-mapping-overrides`.
- [ ] Save docs path: `docs/phases/16a-project-mapping-overrides`.
- [ ] Save roadmap split: 16A project overrides, 16B profiles.
- [ ] Save scope: project-level mapping overrides only.
- [ ] Save non-goals: no global profiles, no note editing, no automatic ML mapping, no packaging.
- [ ] Save mapping concepts: MIDI note -> DrumPiece, GPIF/source key -> DrumPiece, ignore, sidestick -> snare/ignore.
- [ ] Save rule: persist overrides in `.chdg`.
- [ ] Save rule: apply overrides during normalization/generation.
- [ ] Save rule: override changes mark preview/output stale or needs-regenerate.
- [ ] Save review rule: final PR review external by Jon/ChatGPT.
- [ ] Save merge rule: do not merge without Jon approval.

## 3. Inspect current implementation

- [ ] Inspect project file types/read/write.
- [ ] Inspect normalization model.
- [ ] Inspect MIDI mapping logic.
- [ ] Inspect GPIF mapping logic.
- [ ] Inspect source trace/unknown note reporting.
- [ ] Inspect desktop project/generate state.
- [ ] Inspect validation logic.
- [ ] Inspect existing tests.

## 4. Add data model/persistence

- [ ] Add mapping override types.
- [ ] Add overrides to project state payload.
- [ ] Add `.chdg` read/write support.
- [ ] Preserve loading old projects without overrides.
- [ ] Add validation for persisted override shape.
- [ ] Add tests for persistence/roundtrip.

## 5. Add override application

- [ ] Add helper to build source override keys.
- [ ] Apply MIDI note overrides during normalization.
- [ ] Apply GPIF source/articulation overrides during normalization.
- [ ] Apply ignore target by skipping hits.
- [ ] Apply sidestick -> snare / ignore.
- [ ] Preserve automatic mapping when no override exists.
- [ ] Preserve source trace where possible.
- [ ] Add tests.

## 6. Add desktop UI/state

- [ ] Add Mapping Overrides UI.
- [ ] Show source key/note/articulation.
- [ ] Show automatic mapping where available.
- [ ] Show current override.
- [ ] Allow selecting `DrumPiece`.
- [ ] Allow ignore.
- [ ] Allow reset.
- [ ] Show limitations when source data is incomplete.
- [ ] Keep UI project-scoped.
- [ ] Avoid global profile UI.

## 7. Staleness behavior

- [ ] On override change, mark project dirty.
- [ ] On override change, mark generated output needs-regenerate if applicable.
- [ ] Clear or mark normalization preview stale.
- [ ] Make stale state visible to user.

## 8. Preserve workflows

- [ ] Existing generation still works without overrides.
- [ ] Generation uses overrides when present.
- [ ] Validation still works.
- [ ] Preview/highway still works.
- [ ] Offset loop still works.
- [ ] CLI/backend behavior remains compatible.

## 9. Tests

- [ ] Test MIDI note -> piece override.
- [ ] Test GPIF/source key -> piece override.
- [ ] Test ignore override.
- [ ] Test sidestick -> snare.
- [ ] Test sidestick ignore.
- [ ] Test reset/removal behavior.
- [ ] Test old project without overrides loads.
- [ ] Test project save/reopen preserves overrides.
- [ ] Test override change marks stale/needs-regenerate.
- [ ] Preserve existing tests.

## 10. Validate

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

## 11. Docs/checklist

- [ ] Update `docs/phases/16a-project-mapping-overrides/CHECKLIST.md`.
- [ ] Update PRD/ADR if implementation differs.
- [ ] Do not mark future phase work complete.

## 12. Git and PR

- [ ] Confirm branch is `feat/phase-16a-project-mapping-overrides`.
- [ ] Commit changes.
- [ ] Push branch.
- [ ] Create PR linked to issue.
- [ ] Do not merge.
