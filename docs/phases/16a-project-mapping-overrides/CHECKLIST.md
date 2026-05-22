# Checklist Phase 16A: Project Mapping Overrides

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/phases/16a-project-mapping-overrides/PRD.md`.
- [ ] Read `docs/phases/16a-project-mapping-overrides/ADR.md`.
- [ ] Read this checklist.
- [ ] Read Phase 15 docs.
- [ ] Read Phase 14A/14B docs.
- [ ] Review visual reference:
  - `docs/desktop/mockups/09-mapping-overrides.png`
- [ ] Read OpenSpec if present:
  - `openspec/changes/phase-16a-project-mapping-overrides/proposal.md`
  - `openspec/changes/phase-16a-project-mapping-overrides/design.md`
  - `openspec/changes/phase-16a-project-mapping-overrides/tasks.md`
  - `openspec/changes/phase-16a-project-mapping-overrides/verify.md`
  - `openspec/changes/phase-16a-project-mapping-overrides/specs/project-mapping-overrides/spec.md`

## Implementation

- [ ] Implement only Phase 16A scope.
- [ ] Add project-level mapping override model.
- [ ] Add `.chdg` persistence for overrides.
- [ ] Preserve loading old `.chdg` files without overrides.
- [ ] Show source notes/articulations where data is available.
- [ ] Show automatic/current mapping where data is available.
- [ ] Allow MIDI note -> `DrumPiece` override.
- [ ] Allow GPIF source/articulation -> `DrumPiece` override.
- [ ] Allow ignore override.
- [ ] Allow reset to automatic/default.
- [ ] Support sidestick -> snare or ignore.
- [ ] Apply overrides during normalization/generation.
- [ ] Mark preview/output stale or needs-regenerate when overrides change.
- [ ] Preserve validation/generation/preview/offset behavior.
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
