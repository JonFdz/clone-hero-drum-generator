# frontend: add Project Details, autosave state, rename, and Save a Copy

**Planning ID:** F6  
**Wave:** 4  
**Depends on:** F1/F3 extension points, B4/B7  
**Suggested branch/worktree:** `frontend/<ISSUE>-project-details`

## Owned paths

Project Details, save-state UI, Save a Copy facade/components.

## Scope

- Contextual Project Details panel.
- Edit identity, optional metadata, cover, output.
- Preview derived name/collisions.
- Saving/Saved/Save failed.
- Save a Copy.
- Transactional rename results.

## Non-goals

- Replace Audio.
- Updated Source.
- Persistent history.

## Acceptance criteria

- [ ] Identity remains mandatory.
- [ ] Valid apply renames safely.
- [ ] Collision preserves old state.
- [ ] Copy is independent.
- [ ] No competing manual Save button.

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
