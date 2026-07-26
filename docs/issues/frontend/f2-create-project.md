# frontend: build the two-step Create Project wizard

**Planning ID:** F2  
**Wave:** 3  
**Depends on:** D2 screen approval, B2 contract, F1  
**Suggested branch/worktree:** `frontend/<ISSUE>-create-project`

## Owned paths

Creation feature/store/components and isolated harness fixtures.

## Scope

- Build Details, Mapping, and Creating routes.
- Require source/audio/Artist/Song/Project.
- Show derived folder name.
- Render recommended/manual track states.
- Render compact two-level mappings/unknowns.
- Render canonical progress through facade/fixtures.
- Handle typed errors.

## Non-goals

- Physical import.
- Editor.
- Updated Source.

## Acceptance criteria

- [ ] Invalid direct route redirects safely.
- [ ] Unknown mapping advisory/editable.
- [ ] No inspection JSON/technical pipeline.
- [ ] No fake percentage.
- [ ] 1024 usable.

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
