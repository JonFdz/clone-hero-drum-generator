# lifecycle: create a new project version from an updated source

**Planning ID:** M2-2  
**Wave:** M2  
**Depends on:** I1  
**Suggested branch/worktree:** `lifecycle/<ISSUE>-import-updated-source`

## Owned paths

Dedicated project-version domain/Desktop/UI modules.

## Scope

- Create separate project from new source.
- Reuse audio, cover, metadata, compatible mappings.
- Require new non-conflicting Project Name.
- Preserve original.
- Do not automatically carry individual corrections.

## Non-goals

- In-place regeneration/reconciliation.

## Acceptance criteria

- [ ] Original folder/hash unchanged.
- [ ] New project ID.
- [ ] Reuse/non-reuse clearly explained.

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
