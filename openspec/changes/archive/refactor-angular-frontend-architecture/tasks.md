# Tasks: Refactor Angular Frontend Architecture

## General execution rules

- [ ] Read `AGENTS.md` and `docs/process/sdd-agent-workflow.md`.
- [ ] Read this OpenSpec change and the assigned GitHub issue.
- [ ] Transfer accepted decisions, non-goals, implementation tasks, and validation rules into Engram before code changes.
- [ ] Treat Engram as the persistent source of truth while implementing.
- [ ] Work only on the branch assigned to the current issue.
- [ ] Do not begin a dependent issue before its prerequisite implementation PRs are externally merged.
- [ ] Do not modify Electron main/preload, `packages/**`, CLI, or domain contracts.
- [ ] Do not merge, approve, request review, or perform review actions.
- [ ] Include exact validation commands and outcomes in the final PR body.

## Issue #74 — Foundation, application shell, project session, and quality gates

### Branch and preparation

- [ ] Create or checkout `refactor/74-angular-foundation` from current `main`.
- [ ] Verify that issue #74 and parent issue #73 are still open and approved.
- [ ] Record the Engram plan for #74.

### Architecture and app shell

- [ ] Establish feature-oriented folders without generic global dumping grounds.
- [ ] Keep `AppComponent` as root application shell.
- [ ] Split `AppComponent` into external TS, HTML, CSS, and spec files.
- [ ] Apply `ChangeDetectionStrategy.OnPush`.
- [ ] Move only truly global infrastructure to `core`.
- [ ] Keep `DesktopBridgeService` as the only Electron/preload boundary.
- [ ] Ensure no migrated component imports the bridge directly.

### State and persistence

- [ ] Create a signal-based active project/session store.
- [ ] Restrict the session store to active-project/workflow concerns.
- [ ] Move settings, recents, and FFmpeg diagnostics out of the session boundary.
- [ ] Create a project persistence service for create/open/save/save-as and hydration.
- [ ] Remove duplicated open-and-hydrate sequences from page-level code as required by the foundation.
- [ ] Ensure persistence services return typed outcomes and do not navigate.

### Routing and styles

- [ ] Preserve Home as an eager route.
- [ ] Convert feature routes to `loadComponent`.
- [ ] Keep `styles.css` as global entry point.
- [ ] Restrict global styles to tokens, base rules, accessibility fundamentals, and true global utilities.

### Quality and documentation

- [ ] Configure real Angular/TypeScript/template linting.
- [ ] Configure Angular-compatible Vitest execution.
- [ ] Implement `check:architecture`.
- [ ] Add `docs/architecture/angular-frontend-architecture.md`.
- [ ] Add `docs/architecture/angular-refactor-follow-ups.md`.
- [ ] Add meaningful tests for session hydration, persistence outcomes, startup, and routes.

### Validation and delivery

- [ ] Run lint.
- [ ] Run architecture check.
- [ ] Run tests.
- [ ] Run typecheck.
- [ ] Run production build.
- [ ] Commit and push cohesive changes.
- [ ] Open ready-for-review PR against `main`.
- [ ] Include `Closes #74` and `Parent: #73`.
- [ ] Do not merge or review.

## Issue #75 — Projects, project details, home, settings, and shared UI

### Branch and preparation

- [ ] Wait until #74 is externally merged.
- [ ] Create or checkout `refactor/75-angular-project-features` from current `main`.
- [ ] Read the current post-#74 repository state and synchronize the #75 plan to Engram.

### Feature migration

- [ ] Migrate Projects into a feature-owned structure.
- [ ] Migrate Project Details into a feature-owned structure.
- [ ] Migrate Home into a feature-owned structure.
- [ ] Migrate Settings into a feature-owned structure.
- [ ] Split every migrated component into external TS, HTML, CSS, and spec files.
- [ ] Apply OnPush to every migrated component.
- [ ] Replace template-time non-trivial calculation methods with computed state or pure tested transformations.
- [ ] Use the central project persistence/session path for opening, creating, and hydrating projects.
- [ ] Keep settings and FFmpeg diagnostics feature-owned.
- [ ] Add shared UI primitives only with genuine reuse or infrastructure need.
- [ ] Preserve behavior for project library, filters, sort, project creation, opening, deletion, settings, and FFmpeg diagnostics.

### Validation and delivery

- [ ] Run all required quality commands.
- [ ] Commit and push cohesive changes.
- [ ] Open ready-for-review PR against `main`.
- [ ] Include `Closes #75` and `Parent: #73`.
- [ ] Do not merge or review.

## Issue #76 — Source review, integrated mapping, generation, and preview

### Branch and preparation

- [ ] Wait until #74 and #75 are externally merged.
- [ ] Create or checkout `refactor/76-angular-workflow-features` from current `main`.
- [ ] Read the current post-#75 repository state and synchronize the #76 plan to Engram.

### Source review and mapping

- [ ] Keep Mapping integrated within Source Review.
- [ ] Move mapping presentation models into a clear feature-owned location.
- [ ] Remove legacy mapping imports across feature boundaries.
- [ ] Create focused Source Review presentation components when they represent stable visual responsibilities.
- [ ] Move bridge interaction and workflow coordination out of Source Review page components.
- [ ] Create a mapping-profile service for bridge-backed profile CRUD.
- [ ] Replace browser-native prompts/confirms with shared Angular dialogs.
- [ ] Delete an independent Mapping route/component only if dead-code proof is complete.
- [ ] Record uncertain cleanup candidates in the follow-up register.

### Generation

- [ ] Split Generate into focused components:
  - [ ] generation readiness
  - [ ] validation report
  - [ ] generation configuration
  - [ ] QA checklist
  - [ ] generation steps
  - [ ] generation log
  - [ ] output preview
  - [ ] generation action bar
- [ ] Move generation orchestration into a dedicated service.
- [ ] Preserve validation, overwrite, autosave, output-folder, preview navigation, logs, and metrics behavior.
- [ ] Use computed/pure transformations for all derived presentation data.

### Preview

- [ ] Migrate Preview and child components to external TS, HTML, CSS, and tests.
- [ ] Apply OnPush.
- [ ] Preserve chart display, transport, offset, and metric behavior.

### Validation and delivery

- [ ] Run all required quality commands.
- [ ] Commit and push cohesive changes.
- [ ] Open ready-for-review PR against `main`.
- [ ] Include `Closes #76` and `Parent: #73`.
- [ ] Do not merge or review.
