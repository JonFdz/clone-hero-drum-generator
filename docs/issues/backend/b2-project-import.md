# backend: import deterministic sources into a self-contained project

**Planning ID:** B2  
**Wave:** 2  
**Depends on:** B1  
**Suggested branch/worktree:** `backend/<ISSUE>-project-import`

## Owned paths

New import/analyze modules, synthetic fixtures, and focused tests; avoid Electron hotspots.

## Scope

- Analyze source, recommend tracks, build mapping definitions, timing summary, and warnings.
- Create project transactionally from approved selection.
- Archive source, convert internal OGG, prepare optional cover, materialize hits/timing.
- Emit canonical real progress steps.
- Clean temporary state on failure.

## Non-goals

- Angular wizard.
- Electron picker/IPC wiring.
- Note correction commands.
- Clone Hero export.

## Acceptance criteria

- [ ] Deleting external originals does not affect the project.
- [ ] No partial final folder remains after injected failures.
- [ ] Track recommendation is deterministic.
- [ ] Unknown mappings remain explicit.
- [ ] Progress order matches contract.

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
