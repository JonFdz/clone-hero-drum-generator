# lifecycle: replace a project audio asset safely

**Planning ID:** M2-1  
**Wave:** M2  
**Depends on:** I1  
**Suggested branch/worktree:** `lifecycle/<ISSUE>-replace-audio`

## Owned paths

Dedicated domain/Desktop/UI modules.

## Scope

- Select/convert new audio transactionally.
- Preserve chart/mappings/corrections.
- Require offset/duration review.
- Update export staleness.
- Rollback failure.

## Non-goals

- Automatic retiming.

## Acceptance criteria

- [ ] Old audio preserved on failure.
- [ ] New internal audio drives Preview after success.
- [ ] Export updates audio.

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
