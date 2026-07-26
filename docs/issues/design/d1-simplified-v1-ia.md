# design: define the Simplified V1 information architecture

**Planning ID:** D1  
**Wave:** 1  
**Depends on:** Wave 0 approval  
**Suggested branch/worktree:** `design/<ISSUE>-simplified-v1-ia`

## Owned paths

`design/**` and design-only records.

## Scope

- Preserve previous CURRENT/EXPLORATION/Design V1 material as historical.
- Create a separate Simplified V1 IA section in Pencil.
- Define no-sidebar global chrome, two-step creation, contextual project header, Preview/Mappings, Project Details, export states, Projects/Settings.
- Use approved mockups as conceptual references.
- Stop for blocking IA approval.

## Non-goals

- Production code.
- Final high-fidelity frames.
- Invented backend behavior.

## Acceptance criteria

- [ ] Every canonical route/state is represented.
- [ ] No selected Source Review/Generate workflow strip.
- [ ] Highway working space is prioritized.
- [ ] Proposals/unresolved behavior are classified.
- [ ] Pencil saves/reopens and validates.

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
