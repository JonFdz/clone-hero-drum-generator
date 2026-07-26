# Tasks: Phase 16B — Mapping Override Profiles

## 1. Read context

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/phases/16a-project-mapping-overrides/PRD.md`.
- [ ] Read `docs/phases/16a-project-mapping-overrides/ADR.md`.
- [ ] Read `docs/phases/16b-mapping-override-profiles/PRD.md`.
- [ ] Read `docs/phases/16b-mapping-override-profiles/ADR.md`.
- [ ] Read `docs/phases/16b-mapping-override-profiles/CHECKLIST.md`.
- [ ] Read OpenSpec artifacts if present.

## 2. Sync context to Engram

- [ ] Save change ID: `phase-16b-mapping-override-profiles`.
- [ ] Save branch name: `feat/phase-16b-mapping-override-profiles`.
- [ ] Save docs path: `docs/phases/16b-mapping-override-profiles`.
- [ ] Save scope: local mapping override profiles only.
- [ ] Save relationship: applying profile copies overrides into project.
- [ ] Save non-goals: no built-in Songsterr profiles, no cloud/community, no auto detection, no note editing, no packaging.
- [ ] Save apply modes: replace and merge; merge profile wins conflicts.
- [ ] Save stale behavior: profile apply marks project dirty/output stale.
- [ ] Save review rule: final PR review external by Jon/ChatGPT.
- [ ] Save merge rule: do not merge without Jon approval.

## 3. Inspect current implementation

- [ ] Inspect Phase 16A mapping override model.
- [ ] Inspect project mapping override persistence.
- [ ] Inspect Mapping page.
- [ ] Inspect settings/local persistence patterns.
- [ ] Inspect Electron bridge patterns.
- [ ] Inspect validation tests.

## 4. Add profile model/helpers

- [ ] Add profile types.
- [ ] Add profile store type.
- [ ] Add profile validation.
- [ ] Add create profile from overrides helper.
- [ ] Add apply profile helper.
- [ ] Add conflict summary helper.
- [ ] Add tests.

## 5. Add local persistence

- [ ] Add local profile storage.
- [ ] Preserve empty/missing store as empty profile list.
- [ ] Filter/report malformed profiles safely.
- [ ] Add read profiles bridge.
- [ ] Add save/update profile bridge.
- [ ] Add delete profile bridge.
- [ ] Avoid renderer fs.
- [ ] Add tests where practical.

## 6. Add desktop UI/state

- [ ] Add profile list.
- [ ] Add empty state.
- [ ] Add create from current project overrides.
- [ ] Add edit metadata.
- [ ] Add update from current project.
- [ ] Add delete profile.
- [ ] Add apply replace mode.
- [ ] Add apply merge mode.
- [ ] Add conflict summary.
- [ ] Show status/errors.

## 7. Integrate with project overrides

- [ ] Applying profile updates project mappingOverrides.
- [ ] Applying profile uses same stale path as manual override edits.
- [ ] Preserve project save/load behavior.
- [ ] Preserve generation using project overrides.
- [ ] Preserve validation/preview/highway/offset.

## 8. Tests

- [ ] Test profile validation.
- [ ] Test create profile from overrides.
- [ ] Test replace apply.
- [ ] Test merge apply conflict.
- [ ] Test conflict summary.
- [ ] Test malformed profile handling.
- [ ] Test profile persistence roundtrip where practical.
- [ ] Test applying profile marks stale/needs-regenerate where practical.
- [ ] Preserve existing tests.

## 9. Validate

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

## 10. Docs/checklist

- [ ] Update `docs/phases/16b-mapping-override-profiles/CHECKLIST.md`.
- [ ] Update PRD/ADR if implementation differs.
- [ ] Do not mark future phase work complete.

## 11. Git and PR

- [ ] Confirm branch is `feat/phase-16b-mapping-override-profiles`.
- [ ] Commit changes.
- [ ] Push branch.
- [ ] Create PR linked to issue.
- [ ] Do not merge.
