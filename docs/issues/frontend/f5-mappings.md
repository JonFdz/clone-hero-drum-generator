# frontend: add compact two-level project mappings

**Planning ID:** F5  
**Wave:** 5  
**Depends on:** F3, B3/B7 mapping contract  
**Suggested branch/worktree:** `frontend/<ISSUE>-mappings`

## Owned paths

Mappings tab/components/facade/tests.

## Scope

- Render source, effective piece, target/color, count, confidence/attention.
- Unknown flow: choose piece then accept/change proposed target.
- Override and reset.
- Explain correction precedence.
- Refresh Preview.

## Non-goals

- Global mapping-profile management.
- Batch note editing.

## Acceptance criteria

- [ ] Ride→Green Cymbal without changing Ride identity.
- [ ] Defaults low-friction.
- [ ] Unknowns advisory.
- [ ] Destructive reset confirmed.
- [ ] Keyboard/1024 pass.

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
