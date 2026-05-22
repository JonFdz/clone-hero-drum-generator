# Checklist Phase 16A: Project Mapping Overrides

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/desktop/README.md`.
- [x] Read `docs/desktop/decisions.md`.
- [x] Read `docs/desktop/mockup-corrections.md`.
- [x] Read `docs/desktop/feature-inventory.md`.
- [x] Read `docs/phases/16a-project-mapping-overrides/PRD.md`.
- [x] Read `docs/phases/16a-project-mapping-overrides/ADR.md`.
- [x] Read this checklist.
- [x] Read Phase 15 docs.
- [x] Read Phase 14A/14B docs.
- [x] Review visual reference:
  - `docs/desktop/mockups/09-mapping-overrides.png`
- [x] Read OpenSpec if present:
  - `openspec/changes/phase-16a-project-mapping-overrides/proposal.md`
  - `openspec/changes/phase-16a-project-mapping-overrides/design.md`
  - `openspec/changes/phase-16a-project-mapping-overrides/tasks.md`
  - `openspec/changes/phase-16a-project-mapping-overrides/verify.md`
  - `openspec/changes/phase-16a-project-mapping-overrides/specs/project-mapping-overrides/spec.md`

## Implementation

- [ ] Implement only Phase 16A scope.
- [x] Add project-level mapping override model.
- [x] Add `.chdg` persistence for overrides.
- [x] Preserve loading old `.chdg` files without overrides.
- [ ] Show source notes/articulations where data is available.
- [ ] Show automatic/current mapping where data is available.
- [x] Allow MIDI note -> `DrumPiece` override.
- [x] Allow GPIF source/articulation -> `DrumPiece` override.
- [x] Allow ignore override.
- [x] Allow reset to automatic/default.
- [ ] Support sidestick -> snare or ignore.
- [x] Apply overrides during normalization/generation.
- [x] Mark preview/output stale or needs-regenerate when overrides change.
- [ ] Preserve validation/generation/preview/offset behavior.
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
- [ ] Inspect/normalize source with visible notes/articulations.
- [ ] Mapping Overrides UI is visible/reachable.
- [ ] Add MIDI note override.
- [ ] Add GPIF/source articulation override where test data allows.
- [ ] Ignore a source note/articulation.
- [ ] Reset an override.
- [ ] Sidestick can be set to snare or ignore.
- [ ] Save project.
- [ ] Reopen project.
- [ ] Overrides are restored.
- [ ] Re-normalize/generate uses overrides.
- [ ] Output/preview staleness is clear after override changes.
- [ ] Validation still works.
- [ ] Generate still works.
- [ ] Preview/offset still works.

## Deferred

- [ ] No global profiles.
- [ ] No Songsterr profile system.
- [ ] No automatic ML mapping.
- [ ] No individual note editing.
- [ ] No mapping community database.
- [ ] No packaging.
- [ ] No full UX polish pass.
- [ ] Do not implement future phases unless explicitly approved.
