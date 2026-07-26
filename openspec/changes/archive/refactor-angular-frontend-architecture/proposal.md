# Proposal: Refactor Angular Frontend Architecture

## Why

The Angular renderer has grown into a set of standalone components that often combine template markup, component styling, presentation derivations, workflow orchestration, direct desktop bridge calls, and persistence behavior in the same TypeScript file.

This makes the UI harder to navigate, reuse, test, and safely evolve. It is particularly visible in workflow-heavy pages such as Source Review and Generate, where a page can own both the visual composition and the business/application flow.

The refactor must improve maintainability without changing Electron, the domain packages, CLI behavior, or existing user-facing workflows.

## What changes

### Architecture

- Reorganize the Angular renderer primarily by feature.
- Co-locate each component's TypeScript, HTML, CSS, and test files.
- Keep `AppComponent` as the root application shell.
- Use `core/` only for truly application-wide infrastructure.
- Use `shared/` only for genuinely reusable UI primitives and utilities.
- Keep feature-owned components, models, services, and tests inside their owning feature.

### Component conventions

- All Angular components use external `.component.html` and `.component.css` files.
- All migrated components use `ChangeDetectionStrategy.OnPush` unless a documented exception is unavoidable.
- Templates remain declarative and do not execute non-trivial derivation methods.
- Derived visual state uses `computed`, typed feature models, services, or pure tested functions.

### State and application boundaries

- Split active-project/session state from recent-project library state, application settings, FFmpeg diagnostics, and global desktop health.
- Centralize project open/create/save/hydrate flows in application services.
- Keep `DesktopBridgeService` as the only Angular boundary to Electron/preload APIs.
- Prevent pages and presentation components from directly calling the bridge.
- Prevent application services from navigating; pages own route transitions after receiving typed outcomes.

### Routing and interaction

- Keep Home eager.
- Use route-level `loadComponent` lazy loading for feature routes.
- Replace `window.confirm` and `window.prompt` with accessible reusable Angular dialogs.
- Preserve live routes and behavior.
- Remove legacy routes or components only when they are proven 100% dead.
- Record ambiguous cleanup candidates instead of deleting them.

### Quality

- Configure meaningful Angular/TypeScript linting and template linting.
- Configure Angular-compatible Vitest tests.
- Add `check:architecture`.
- Document the target architecture and future cleanup candidates.

## Scope

### In scope

- `apps/desktop/src/app/**`
- `apps/desktop/src/styles.css`
- `apps/desktop/src/main.ts`
- `apps/desktop/angular.json`
- `apps/desktop/package.json`
- `docs/architecture/**`

Only make changes in these areas when necessary for Angular architecture, routing, linting, testing, build configuration, or documentation.

### Out of scope

- Electron main process.
- Electron preload.
- IPC contract changes.
- `packages/**`.
- `apps/cli/**`.
- Domain behavior.
- Generation pipeline behavior.
- Dependency upgrades that are unrelated to required Angular-only tooling.
- A product redesign.

## Benefits

- Smaller and more focused page components.
- Clear ownership of state and application use cases.
- Less duplicated project lifecycle logic.
- Better testability.
- Enforced architectural conventions.
- Safer future feature work.
- More consistent UI behavior and accessibility.

## Delivery plan

The work is delivered through three sequential PRs:

1. #74 — foundation, app shell, project session, routing, and quality gates.
2. #75 — projects, project details, home, settings, and shared UI.
3. #76 — source review, integrated mapping, generation, and preview.

The parent issue #73 is closed only after external review and merge of all three implementation issues.
