# frontend: replace the sidebar shell with contextual navigation

**Planning ID:** F1  
**Wave:** 3  
**Depends on:** D1, B1 route/catalog contracts  
**Suggested branch/worktree:** `frontend/<ISSUE>-shell-home`

## Owned paths

App shell/routes and Home/Projects/Settings UI; no Electron main/preload.

## Scope

- Remove permanent sidebar and old global Save controls.
- Implement minimal global/contextual headers.
- Implement canonical routes and temporary redirects.
- Redesign Home, Projects, Settings.
- Add deterministic harness fixtures.

## Non-goals

- Create wizard internals.
- Editor content.
- Real desktop IPC integration.

## Acceptance criteria

- [ ] No sidebar at 1440/1024.
- [ ] One dominant Create Project action.
- [ ] Routes match contract.
- [ ] Keyboard/focus usable.
- [ ] Old routes do not reveal old workflow UI.

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
