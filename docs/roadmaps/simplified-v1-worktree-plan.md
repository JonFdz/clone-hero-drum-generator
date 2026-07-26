# Simplified V1 Worktree and Parallel Execution Plan

## Rule

One issue, branch, worktree, and PR per unit. Use actual issue numbers:

```text
<area>/<issue-number>-<slug>
```

## Wave 0

```text
spec/<issue>-chdg-simplified-v1
```

Owned by ChatGPT/Jon for authored artifacts. No implementation starts before approval.

## Wave 1 — 2 worktrees

```text
../chdg-wt-design-ia      design/<issue>-simplified-v1-ia
../chdg-wt-project-core   backend/<issue>-project-v1-contract
```

Design owns `design/**`. B1 owns central package contracts.

## Wave 2 — 4 worktrees

After B1 merge:

```text
../chdg-wt-import         backend/<issue>-project-import
../chdg-wt-effective      backend/<issue>-effective-chart
../chdg-wt-persistence    backend/<issue>-project-persistence
../chdg-wt-pencil         design/<issue>-simplified-v1-pencil
```

- Import: new import modules/fixtures.
- Effective: materialization/corrections/commands.
- Persistence: filesystem/save/copy/rename/catalog.
- Pencil: design only.

Avoid independent edits to B1 central schema/barrels; use a small coordinated prerequisite when needed.

## Wave 3 — up to 5 worktrees

```text
../chdg-wt-preview        backend/<issue>-project-preview
../chdg-wt-export         backend/<issue>-project-export
../chdg-wt-shell          frontend/<issue>-shell-home
../chdg-wt-create-ui      frontend/<issue>-create-project
../chdg-wt-design-ho      design/<issue>-simplified-v1-handoff
```

Preview/export consume, not redefine, B3. Frontend uses fixtures/facades and does not edit Electron integration hotspots.

## Wave 4 — 3 worktrees

```text
../chdg-wt-ipc            desktop/<issue>-simplified-v1-ipc
../chdg-wt-editor         frontend/<issue>-editor-base
../chdg-wt-details        frontend/<issue>-project-details
```

B7 has exclusive Electron/bridge integration ownership. UI branches remain fixture/facade driven until B7 lands.

## Wave 5 — 3 worktrees

```text
../chdg-wt-note-edit      frontend/<issue>-note-corrections
../chdg-wt-mappings       frontend/<issue>-mappings
../chdg-wt-export-ui      frontend/<issue>-export-ui
```

Precondition: Editor root has stable slots/facades. Each feature owns its folder. Central wiring waits for I1 or a coordinated tiny commit.

## Wave 6 — 1 worktree

```text
../chdg-wt-integration    integration/<issue>-simplified-v1
```

One owner connects IPC, resolves shared stores/routes/styles, updates harness, runs all gates, and prepares final evidence.

## Hotspots — exclusive ownership

Central contracts (B1):

```text
packages/core/src/types.ts
packages/project/src/projectFileTypes.ts
packages/project/src/projectFile.ts
packages/project/src/types.ts
packages/project/src/index.ts
```

Desktop integration (B7):

```text
apps/desktop/electron/main.ts
apps/desktop/electron/preload.cts
apps/desktop/src/app/services/desktop-bridge.service.ts
apps/desktop/src/global.d.ts
```

Frontend root:

```text
apps/desktop/src/app/app.routes.ts
apps/desktop/src/app/app.component.*
apps/desktop/src/app/state/project-session/**
apps/desktop/src/app/features/editor/editor-page.*
```

F1 owns routes/shell first; F3 owns Editor root. Later features integrate through stable boundaries.

Browser harness final ownership (I1):

```text
apps/desktop/src/browser-harness/**
```

## Commands

```bash
git fetch origin
git worktree add ../chdg-wt-project-core   -b backend/<issue>-project-v1-contract origin/main
```

After dependencies merge, update each not-yet-reviewed worktree safely. Do not force-push shared/in-review branches without approval.

## Contract-change protocol

When a branch needs a shared contract change:

1. stop;
2. document exact change;
3. create/update the contract prerequisite;
4. merge it;
5. update dependents;
6. continue.

Never invent divergent private versions.
