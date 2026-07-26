# backend: export self-contained projects incrementally and safely

**Planning ID:** B6  
**Wave:** 3  
**Depends on:** B1, B3  
**Suggested branch/worktree:** `backend/<ISSUE>-project-export`

## Owned paths

Project export orchestration, fingerprints, transactions, and tests.

## Scope

- Materialize chart/metadata from project.
- Reuse/copy internal audio and cover only when required.
- Compute input/output fingerprints and managed hashes.
- Detect ambiguous/external changes.
- Stage and atomically commit.
- Preserve unmanaged files.
- Emit real progress.

## Non-goals

- Export UI.
- Output marker.
- Replace Audio.

## Acceptance criteria

- [ ] Note-only change updates chart state.
- [ ] Metadata-only change updates INI state.
- [ ] Unmanaged files survive.
- [ ] Injected failure preserves prior outputs.
- [ ] Ambiguous first export returns confirmation requirement.

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
