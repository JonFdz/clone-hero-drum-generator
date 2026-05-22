# Checklist Phase 16B: Mapping Override Profiles

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/desktop/README.md`.
- [x] Read `docs/desktop/decisions.md`.
- [x] Read `docs/desktop/mockup-corrections.md`.
- [x] Read `docs/desktop/feature-inventory.md`.
- [x] Read `docs/phases/16a-project-mapping-overrides/PRD.md`.
- [x] Read `docs/phases/16a-project-mapping-overrides/ADR.md`.
- [x] Read `docs/phases/16b-mapping-override-profiles/PRD.md`.
- [x] Read `docs/phases/16b-mapping-override-profiles/ADR.md`.
- [x] Read this checklist.
- [x] Read OpenSpec if present:
  - `openspec/changes/phase-16b-mapping-override-profiles/proposal.md`
  - `openspec/changes/phase-16b-mapping-override-profiles/design.md`
  - `openspec/changes/phase-16b-mapping-override-profiles/tasks.md`
  - `openspec/changes/phase-16b-mapping-override-profiles/verify.md`
  - `openspec/changes/phase-16b-mapping-override-profiles/specs/mapping-override-profiles/spec.md`

## Implementation

- [ ] Implement only Phase 16B scope.
- [x] Add mapping profile model.
- [x] Add local profile persistence.
- [ ] Preserve valid profiles across app restart.
- [x] Validate malformed profiles safely.
- [x] Add profile list UI.
- [x] Add create profile from current project overrides.
- [x] Add edit profile metadata.
- [x] Add update profile from current project overrides.
- [x] Add delete profile.
- [x] Add apply profile to project.
- [x] Support replace mode.
- [x] Support merge mode.
- [x] Show conflict/overwrite summary.
- [x] Applying profile updates project overrides.
- [x] Applying profile marks preview/output stale.
- [ ] Preserve Phase 16A project overrides.
- [ ] Preserve generation/validation/preview/highway/offset.
- [ ] Preserve Electron security boundaries.
- [x] Add/update tests.

## Validation

- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes. (fails in `apps/desktop` due `ng build` abort trap in this environment)
- [x] `pnpm test` passes.
- [ ] `pnpm --filter @chdg/desktop build` passes.
- [ ] `pnpm --filter @chdg/desktop typecheck` passes.
- [ ] `pnpm chdg --help` passes. (fails in sandbox with EPERM on tsx IPC pipe)
- [ ] Manual desktop validation recorded if relevant.

## Manual desktop smoke

- [ ] Open/create project.
- [ ] Create project mapping overrides.
- [ ] Create profile from current project overrides.
- [ ] Profile appears in list.
- [ ] Restart/reopen app.
- [ ] Profile still appears.
- [ ] Apply profile with replace mode.
- [ ] Apply profile with merge mode.
- [ ] Conflicts are visible/deterministic.
- [ ] Project overrides update after apply.
- [ ] Output/preview stale state is visible.
- [ ] Delete profile.
- [ ] Existing project save/load still works.
- [ ] Generate still works.
- [ ] Validation still works.
- [ ] Preview/highway still works.
- [ ] Offset loop still works.

## Deferred

- [ ] No built-in Songsterr profiles.
- [ ] No cloud sync.
- [ ] No community profile database.
- [ ] No automatic profile detection.
- [ ] No ML mapping.
- [ ] No note editing.
- [ ] No packaging.
- [ ] No full UX polish pass.
- [ ] Do not implement future phases unless explicitly approved.
