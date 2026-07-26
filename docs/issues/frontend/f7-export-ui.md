# frontend: add Export/Update progress, conflict, success, and failure

**Planning ID:** F7  
**Wave:** 5  
**Depends on:** F3, B6/B7  
**Suggested branch/worktree:** `frontend/<ISSUE>-export-ui`

## Owned paths

Export components/facade/tests.

## Scope

- Export/Update action in Editor.
- Managed-file summary and ambiguous destination confirmation.
- Real progress.
- Updated/unchanged files.
- Actionable failure and Done.
- Preserve Editor state.

## Non-goals

- Generate route/page.
- Output marker.

## Acceptance criteria

- [ ] No Generate navigation.
- [ ] Done returns to Editor.
- [ ] Conflict explains replaced/preserved files.
- [ ] No fake percentage.
- [ ] Failure does not imply partial success.

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
