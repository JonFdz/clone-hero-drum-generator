# desktop: add atomic project persistence, recovery, rename, and Save a Copy

**Planning ID:** B4  
**Wave:** 2  
**Depends on:** B1  
**Suggested branch/worktree:** `backend/<ISSUE>-project-persistence`

## Owned paths

Project filesystem/persistence/catalog modules and tests, excluding handler registration.

## Scope

- Implement project folder and relative assets.
- Atomic `project.chdg` write plus `recovery/previous.chdg`.
- Save queue/debounce/flush primitives.
- Transactional identity rename/collision handling.
- Full-folder Save a Copy with new ID and cleared export.
- Project catalog/recent contracts.

## Non-goals

- Renderer save UI.
- Electron main/preload registration.
- Replace Audio/Updated Source.

## Acceptance criteria

- [ ] Interrupted save preserves previous valid project.
- [ ] Moved full folder remains valid.
- [ ] Copy has new ID and cleared export.
- [ ] Collision leaves old state unchanged.
- [ ] Relative assets resolve correctly.

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
