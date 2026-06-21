# Angular Frontend Architecture

This document describes the accepted Angular architecture for the
`@chdg/desktop` renderer (`apps/desktop/src/app`) and the foundation
established by issue #74. It is the reference used by `check:architecture` and
by the follow-up register in `angular-refactor-follow-ups.md`.

## Scope and non-goals

- Angular renderer only. Electron main/preload, `packages/**`, `apps/cli/**`,
  IPC contracts, and domain behavior are out of scope.
- No NgRx or other state-management library. State is held with Angular signals.
- No product redesign. Visual direction is preserved.

## Folder boundaries

```text
apps/desktop/src/app/
├── app.component.ts            # application shell (OnPush, external files)
├── app.component.html
├── app.component.css
├── app.component.test.ts
├── app.routes.ts               # Home eager; feature routes use loadComponent
│
├── core/                       # application-wide infrastructure
│   └── application-startup.service.ts
│
├── shared/                     # genuinely reusable UI primitives/utilities
│                               # (empty in #74; populated with proven reuse)
│
└── features/
    ├── project-session/        # active project/session boundary (public contract)
    │   ├── project-session.store.ts
    │   ├── project-persistence.service.ts
    │   ├── project-session.mapper.ts
    │   ├── project-session.model.ts
    │   └── *.test.ts
    ├── projects/               # projects feature (recents library seed)
    │   └── project-library.service.ts
    └── settings/               # settings feature (settings + FFmpeg seed)
        └── settings.service.ts
```

### Ownership rules

- `core` holds only application-wide infrastructure. It must not accumulate
  feature behavior.
- `shared` holds only UI primitives/utilities with demonstrated cross-feature
  reuse. Do not create a generic design-system dumping ground.
- Each feature owns its pages, components, services, models, and tests.
- A feature may import from: itself, `core`, `shared`, and the **public
  contract** of `features/project-session`. A feature must not import another
  feature's internals.
- No generic application-wide `components/`, `services/`, `data-access/`, or
  `utils/` dumping grounds.

## Naming

- `*.component.ts`, `*.service.ts`, `*.store.ts` (signal-based state stores
  only), `*.model.ts`, `*.util.ts`.

## Component conventions

- Every component uses external `templateUrl` and `styleUrl`/`styleUrls`. Inline
  `template` and `styles` are forbidden.
- Every migrated component uses `ChangeDetectionStrategy.OnPush`. An exception
  is permitted only when proven technically unavoidable; it must be documented
  beside the component metadata and listed in the follow-up register.
- Templates are declarative. They may call event handlers but must not call
  methods that filter, sort, map, construct collections, or derive multi-source
  presentation state. Use `computed`, pure tested functions, or service-provided
  view models.

## Desktop bridge boundary

- `DesktopBridgeService` is the sole Angular boundary to Electron/preload APIs.
- Pages and presentation components must not import `DesktopBridgeService` or
  access `window` integration directly.
- `window.confirm` and `window.prompt` are forbidden; reusable Angular dialogs
  replace them (rolled out in #76).

### Bridge location (#74 decision)

`DesktopBridgeService` currently remains at `services/desktop-bridge.service.ts`
to avoid churning every legacy page import during the foundation PR. It is the
canonical core boundary by responsibility; its physical relocation into `core/`
is recorded as a follow-up and is done together with the page migrations in
# 75/#76, when those import paths are touched anyway.

## Project session and persistence

### `ProjectSessionStore`

A signal-based store holding **only** the active project session:

- project file path and name;
- dirty state;
- output/generation status;
- missing-path warnings.

It does **not** own recent projects, application settings, FFmpeg diagnostics,
app health, or router state. Those live in `ProjectLibraryService`,
`SettingsService`, and the bridge/startup services respectively.

Generation workflow state (source/audio/metadata/inspection/normalization/
mapping/generation result) currently remains in the pre-existing
`DesktopGenerateStateService`. Consolidating it into the session boundary is
deferred to #76 (GenerationService) and recorded in the follow-up register.

### `ProjectPersistenceService`

Centralizes project persistence with one open/create/save/save-as path:

```text
input path or picker -> bridge operation -> validate/interpret payload
  -> hydrate ProjectSessionStore -> return typed outcome
```

- Returns typed outcomes (`{ ok: true, ... }` / `{ ok: false, error }` /
  `{ ok: false, cancelled: true }`).
- Does **not** inject the Angular Router. Pages and the shell navigate only
  after a success outcome.
- Does not refresh recent projects itself; callers (the shell and the legacy
  facade) trigger `ApplicationStartupService.refreshRecentProjects()` so the
  service stays free of cross-feature dependencies.

### Legacy facade

`services/desktop-project-state.service.ts` is a **transitional facade** that
preserves the pre-refactor public API for unmigrated pages and services. It owns
no state: it delegates project identity/status to `ProjectSessionStore`,
recents to `ProjectLibraryService`, settings/FFmpeg to `SettingsService`, and
persistence to `ProjectPersistenceService`. It is removed as pages migrate to
the canonical services in #75/#76.

### `ApplicationStartupService` (core)

Owns the bootstrap sequence: desktop health (`bridge.loadStatus`), persisted
settings, and recent projects. It re-exposes the bridge `health` and `appInfo`
signals so the application shell does not import `DesktopBridgeService`.

> Layering note: the startup coordinator injects the feature-owned
> `SettingsService` and `ProjectLibraryService` to perform bootstrap loading.
> This is an accepted foundation trade-off: startup orchestration genuinely
> needs to prime feature-owned bootstrap data, and `core` is the natural owner
> of that orchestration. It does not introduce a cycle. The architecture check
> does not restrict `core` -> `features` imports.

## Routing

- Home is eagerly loaded (`component: HomePageComponent`).
- All feature routes use `loadComponent`.
- Legacy redirect routes are preserved (`new-project`, `inspect-source`,
  `track-selection`, `mapping`, `validation`). They are deleted only when proven
  dead; uncertain candidates are recorded in the follow-up register.

## Styles

`src/styles.css` is the Angular global entry point and contains only tokens,
reset/base rules, global typography, accessibility fundamentals, and true
global utilities. Feature and component layout lives in component CSS files.

## Quality gates

The desktop package provides meaningful commands:

```bash
pnpm --filter @chdg/desktop lint
pnpm --filter @chdg/desktop check:architecture
pnpm --filter @chdg/desktop test
pnpm --filter @chdg/desktop typecheck
pnpm --filter @chdg/desktop build
```

### Lint (#74 scope)

ESLint flat config with `angular-eslint` (TypeScript + Angular template
linting). In #74, lint is enabled for the new boundaries (`core/`, `shared/`,
`features/`), the application shell, and routes. Legacy `pages/` and `services/`
are brought under lint progressively in #75/#76 as their internals migrate. See
the follow-up register.

### `check:architecture`

A structured Node script (`scripts/check-architecture.mjs`) audits the
application shell and the new `core/` / `shared/` / `features/` areas. It fails
for:

- inline `template` / `styles` / `style` component metadata;
- a component without `ChangeDetectionStrategy.OnPush` (unless exempted);
- a component importing `DesktopBridgeService`;
- `window.confirm` or `window.prompt`;
- a feature importing another feature's internals (except the
  `project-session` public contract).

Legacy `pages/` and `services/` are not audited until migrated; this keeps the
gate meaningful and free of false positives during the staged refactor.

### Tests

Angular-compatible Vitest with a decorator-transpile plugin. The foundation adds
meaningful behavioral tests for the session store, mapper, persistence outcomes,
project library, settings, startup, routing contract, and the shell boundaries.
Existing source-text regression tests were made cwd-independent so they run both
from the repo root and per-package.

## OnPush exception register

No exceptions in #74. Any future exception must be proven and listed in
`angular-refactor-follow-ups.md`.
