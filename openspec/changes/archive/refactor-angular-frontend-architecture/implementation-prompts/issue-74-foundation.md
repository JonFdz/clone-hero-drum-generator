# Implementation Prompt — Issue #74

You are the implementation/apply agent for CHDG.

Implement **issue #74 only**: `Angular refactor 1/3: Foundation, app shell, project session, and quality gates`.

Do not begin #75 or #76. They require external merge of prerequisites.

## Mandatory first actions

1. Read `AGENTS.md`.
2. Read `docs/process/sdd-agent-workflow.md`.
3. Read the extracted OpenSpec change:
   - `proposal.md`
   - `design.md`
   - `tasks.md`
   - every `specs/**/spec.md`
4. Read GitHub issues #73 and #74.
5. Inspect the current repository state rather than assuming this OpenSpec exactly matches the checked-out branch.
6. Transfer all accepted decisions, constraints, non-goals, implementation tasks, and validation rules from the OpenSpec into Engram.
7. Treat Engram as the source of truth for persistent project memory from that point onward.

## Branch and scope

- Work only on `refactor/74-angular-foundation`.
- Base the branch on current `main`.
- Scope is Angular renderer only.
- Do not change Electron main/preload, `packages/**`, `apps/cli/**`, or domain/IPC contracts.
- Do not introduce NgRx or another state library.
- Do not perform a product redesign.

## Implement

Complete the #74 tasks exactly as constrained by the OpenSpec:

- Feature-oriented Angular folder boundaries.
- `AppComponent` remains the root shell and moves to external TypeScript/HTML/CSS/spec files with OnPush.
- `DesktopBridgeService` remains the exclusive Angular Electron/preload boundary.
- A focused active project/session store.
- A centralized project persistence service that creates, opens, saves, saves-as, and hydrates the session through typed outcomes.
- Separation of active-session state from recent projects, settings, and FFmpeg diagnostics.
- Home eager route and lazy `loadComponent` feature routes.
- Real linting, Angular template linting, Vitest configuration, and `check:architecture`.
- Architecture and follow-up documentation.

## Important implementation constraints

- Application services must not navigate.
- Pages/shell perform navigation after typed service outcomes.
- Components must not import `DesktopBridgeService`.
- No inline Angular templates or styles.
- All migrated components use `ChangeDetectionStrategy.OnPush`, except documented proven exceptions.
- Do not add generic application-wide `components`, `services`, `data-access`, or utility dumping grounds.
- Do not delete uncertain legacy routes/components. Record uncertain candidates in the follow-up document.
- Keep changes cohesive and behavior-preserving.

## Tests and validation

Add meaningful tests for the newly introduced boundaries. Do not add quantity-only tests.

Before opening the PR, run:

```bash
pnpm --filter @chdg/desktop lint
pnpm --filter @chdg/desktop check:architecture
pnpm --filter @chdg/desktop test
pnpm --filter @chdg/desktop typecheck
pnpm --filter @chdg/desktop build
```

If any command cannot run, investigate and fix it within scope. Do not silently omit it. Report any remaining limitation transparently.

## Delivery

1. Commit cohesive changes.
2. Push the branch.
3. Create one ready-for-review PR against `main`.
4. Include this in the PR body:

```md
Closes #74
Parent: #73
```

5. Include a concise summary, tests/validation commands and results, architecture decisions made, and any deferred candidates.
6. Do not merge.
7. Do not approve.
8. Do not request review.
9. Do not perform review actions.
