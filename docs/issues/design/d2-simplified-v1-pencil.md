# design: create the complete Simplified V1 Pencil flow

**Planning ID:** D2  
**Wave:** 2  
**Depends on:** D1 approval  
**Suggested branch/worktree:** `design/<ISSUE>-simplified-v1-pencil`

## Owned paths

`design/**` only.

## Scope

- Create high-fidelity 1440×900 and 1024×768 flow.
- Cover required empty/ready/attention/progress/failure/contextual states.
- Reuse approved foundations and Highway.
- Define structural 1024 adaptation.
- Use blocking 1440 checkpoint before final handoff.

## Non-goals

- Production implementation.
- Regenerating approved mockups.

## Acceptance criteria

- [ ] Required frames and exact dimensions.
- [ ] No sidebar.
- [ ] One dominant action per context.
- [ ] Highway primary.
- [ ] All frames visually/layout validated.

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
