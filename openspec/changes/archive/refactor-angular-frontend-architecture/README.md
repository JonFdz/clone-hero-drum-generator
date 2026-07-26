# OpenSpec Change: Refactor Angular Frontend Architecture

## Status

Approved for implementation through three sequential GitHub issues:

| Order | Issue | Scope | Required branch |
|---|---:|---|---|
| 1 | #74 | Foundation, application shell, project session, quality gates | `refactor/74-angular-foundation` |
| 2 | #75 | Projects, project details, home, settings, shared UI | `refactor/75-angular-project-features` |
| 3 | #76 | Source review, integrated mapping, generation, preview | `refactor/76-angular-workflow-features` |

Parent issue: #73 — `Approved: Refactor Angular frontend architecture`

## Read order for the implementation agent

1. Read `AGENTS.md`.
2. Read `docs/process/sdd-agent-workflow.md`.
3. Read this OpenSpec change in full:
   - `proposal.md`
   - `design.md`
   - `tasks.md`
   - every file under `specs/`
4. Read the assigned implementation issue and parent issue.
5. Transfer accepted decisions, constraints, tasks, and validation rules into Engram.
6. Treat Engram as the persistent source of truth during implementation.
7. Implement only the assigned issue. Do not begin a dependent issue before its prerequisites are externally merged.

## OpenSpec role

This folder is a reviewable transfer artifact. It defines the accepted change intent and acceptance criteria. It does not replace repository inspection or Engram.

## Implementation delivery

For each issue:

- Work only on the assigned branch.
- Commit and push implementation changes.
- Create or update one ready-for-review PR against `main`.
- Include `Closes #<issue>` and `Parent: #73` in the PR body.
- Do not merge, approve, request review, or perform review actions.
- Report the executed validation commands and their results in the PR body.
