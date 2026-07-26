# integration: connect, validate, and finalize Simplified V1

**Planning ID:** I1  
**Wave:** 6  
**Depends on:** B1–B7, D1–D3, F1–F7  
**Suggested branch/worktree:** `integration/<ISSUE>-simplified-v1`

## Owned paths

Cross-feature wiring, harness, final docs/tests, obsolete-route cleanup.

## Scope

- Connect real IPC.
- Complete harness scenarios.
- Resolve shared stores/routes/styles.
- Validate 1440/1024 against Pencil.
- Accessibility and large-chart checks.
- Remove obsolete visible workflow safely.
- All gates and release evidence.

## Non-goals

- Milestone 2.
- New product behavior.

## Acceptance criteria

- [ ] End-to-end primary flow.
- [ ] External originals removable before reopen/export.
- [ ] Decode-style tempo regression.
- [ ] Failure injection preserves valid state.
- [ ] No sidebar/Source Review/Generate visible.
- [ ] All gates pass.

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
