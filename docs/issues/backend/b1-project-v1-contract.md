# backend: define the self-contained CHDG project V1 contract

**Planning ID:** B1  
**Wave:** 1  
**Depends on:** Wave 0 approval  
**Suggested branch/worktree:** `backend/<ISSUE>-project-v1-contract`

## Owned paths

Central project/domain schema, validation, and focused tests in `packages/core/**` and `packages/project/**`.

## Scope

- Define the new pre-release `schemaVersion: 1` contract.
- Persist identity, relative assets, import provenance, full timing, imported hits, two-level mappings, corrections, editor settings, and export manifest.
- Define stable project and hit IDs.
- Implement validation and canonical round-trip serialization.
- Explicitly reject provisional project files; no migration.
- Add deterministic synthetic tests.

## Non-goals

- Filesystem import/copy orchestration.
- Electron IPC.
- Angular UI.
- Physical Clone Hero export.

## Acceptance criteria

- [ ] Contract matches the approved schema.
- [ ] Invalid paths, duplicate IDs, dangling corrections, invalid targets, and missing tempo-at-zero fail.
- [ ] Round trip preserves all fields.
- [ ] No external original path is required.
- [ ] All gates pass.

## Validation

- Add focused tests for the owned layer.
- Run package tests during development.
- Before PR run `pnpm build`, `pnpm typecheck`, `pnpm lint`, and `pnpm test`.
- Report shared-contract needs before implementing divergent types.
- Verify no unrelated product behavior was added.

## Delivery

- one issue/branch/worktree/PR;
- focused commits;
- PR body with summary, architecture/files, tests, limitations, and `Closes #<issue>`;
- no self-merge or self-approval.
