# desktop: integrate Simplified V1 packages through typed IPC and progress

**Planning ID:** B7  
**Wave:** 4  
**Depends on:** B2–B6  
**Suggested branch/worktree:** `desktop/<ISSUE>-simplified-v1-ipc`

## Owned paths

Electron main/preload/bridge/global declarations and modular handlers exclusively.

## Scope

- Extract modular handler registration.
- Expose import, catalog/open, edit commands, Preview, autosave, Save a Copy, export, scoped progress.
- Validate paths, payloads, IDs.
- Adapt harness bridge contracts.
- Add adapter tests.

## Non-goals

- Feature styling.
- Domain duplication in Electron.

## Acceptance criteria

- [ ] No arbitrary renderer writes.
- [ ] Listeners scoped/cleaned.
- [ ] Typed errors preserved.
- [ ] No parsing/generation logic in adapter.
- [ ] Health/settings remain functional.

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
