# Checklist Phase 16B: Mapping Override Profiles

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/phases/16a-project-mapping-overrides/PRD.md`.
- [ ] Read `docs/phases/16a-project-mapping-overrides/ADR.md`.
- [ ] Read `docs/phases/16b-mapping-override-profiles/PRD.md`.
- [ ] Read `docs/phases/16b-mapping-override-profiles/ADR.md`.
- [ ] Read this checklist.
- [ ] Read OpenSpec if present:
  - `openspec/changes/phase-16b-mapping-override-profiles/proposal.md`
  - `openspec/changes/phase-16b-mapping-override-profiles/design.md`
  - `openspec/changes/phase-16b-mapping-override-profiles/tasks.md`
  - `openspec/changes/phase-16b-mapping-override-profiles/verify.md`
  - `openspec/changes/phase-16b-mapping-override-profiles/specs/mapping-override-profiles/spec.md`

## Implementation

- [ ] Implement only Phase 16B scope.
- [ ] Add mapping profile model.
- [ ] Add local profile persistence.
- [ ] Preserve valid profiles across app restart.
- [ ] Validate malformed profiles safely.
- [ ] Add profile list UI.
- [ ] Add create profile from current project overrides.
- [ ] Add edit profile metadata.
- [ ] Add update profile from current project overrides.
- [ ] Add delete profile.
- [ ] Add apply profile to project.
- [ ] Support replace mode.
- [ ] Support merge mode.
- [ ] Show conflict/overwrite summary.
- [ ] Applying profile updates project overrides.
- [ ] Applying profile marks preview/output stale.
- [ ] Preserve Phase 16A project overrides.
- [ ] Preserve generation/validation/preview/highway/offset.
- [ ] Preserve Electron security boundaries.
- [ ] Add/update tests.

## Validation

- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm --filter @chdg/desktop build` passes.
- [ ] `pnpm --filter @chdg/desktop typecheck` passes.
- [ ] `pnpm chdg --help` passes.
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
