# design: complete the Simplified V1 implementation handoff

**Planning ID:** D3  
**Wave:** 3  
**Depends on:** D2 and stable B1–B3 contracts  
**Suggested branch/worktree:** `design/<ISSUE>-simplified-v1-handoff`

## Owned paths

`design/**` handoff/decision/prompt files.

## Scope

- Create screen/state matrix, component inventory, route/scenario map, interaction and responsive rules.
- Map every approved frame to route/scenario.
- Classify backend-dependent states.
- Document previous Design V1 supersession.

## Non-goals

- Production code.

## Acceptance criteria

- [ ] Frontend can implement without guessing states.
- [ ] Mockups traceable.
- [ ] All Pencil frames validated.
- [ ] No unimplemented behavior claimed as current.

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
