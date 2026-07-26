# backend: materialize effective drum notes and individual corrections

**Planning ID:** B3  
**Wave:** 2  
**Depends on:** B1  
**Suggested branch/worktree:** `backend/<ISSUE>-effective-chart`

## Owned paths

New effective-chart, correction, command, and target-mapping modules/tests.

## Scope

- Implement two-level mapping resolution.
- Materialize effective notes from imported hits.
- Implement change/delete/restore overlays.
- Validate accent/ghost and targets.
- Implement reversible session command primitives.
- Always emit length 0 and normal Expert kicks.
- Test precedence.

## Non-goals

- Persistence queue.
- Electron/Angular.
- Add/move/duration/batch/tempo.

## Acceptance criteria

- [ ] Ride can target Green Cymbal while remaining Ride.
- [ ] Individual correction survives mapping changes.
- [ ] Delete/restore deterministic.
- [ ] Accent/ghost mutually exclusive.
- [ ] Ticks remain imported and length is 0.

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
