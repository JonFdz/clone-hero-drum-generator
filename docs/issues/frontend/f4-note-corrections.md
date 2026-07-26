# frontend: add individual note correction and Undo/Redo

**Planning ID:** F4  
**Wave:** 5  
**Depends on:** F3, B3/B7 edit contract  
**Suggested branch/worktree:** `frontend/<ISSUE>-note-corrections`

## Owned paths

Note inspector/dialog/correction adapter and tests.

## Scope

- Open details from Highway selection.
- Change piece, target, tom/cymbal, open/closed, accent, ghost.
- Delete/restore.
- Undo/Redo.
- Show provenance/correction state.
- Keyboard/focus management.

## Non-goals

- Add/move/duration/batch/tempo/Expert+ kick.

## Acceptance criteria

- [ ] No timing controls.
- [ ] Accent/ghost mutual exclusion clear.
- [ ] Delete undoable.
- [ ] Correction survives reopen.
- [ ] Mapping changes do not erase correction.

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
