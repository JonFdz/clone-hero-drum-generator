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

### Bridge location (#74/#76 decision)

`DesktopBridgeService` currently remains at `services/desktop-bridge.service.ts`
to avoid churning every legacy page import. It is the canonical core boundary
by responsibility; its physical relocation into `core/` is recorded as a
follow-up. All #76 feature services (`GenerationService`,
`MappingProfileService`, `SourceReviewOrchestratorService`,
`DesktopPreviewService`) import the bridge; no migrated component does.

# 75/#76, when those import paths are touched anyway

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
- Save As opens exactly one file picker (inside the service). Callers must not
  open their own picker before calling `saveProjectAs`; the persisted path is
  the picker's selected path, and the active session is hydrated from the
  saved result. Cancelling the picker returns a cancelled outcome and performs
  no save.
- Does not refresh recent projects itself; callers (the shell and the legacy
  facade) trigger `ApplicationStartupService.refreshRecentProjects()` so the
  service stays free of cross-feature dependencies.

### Project-session public API and workflow hydration

`features/project-session/public-api.ts` is the explicit public surface of
the project-session feature. Other features and the application shell import
**only** from it. Direct imports into `features/project-session/*` internals
from another feature are rejected by `check:architecture`.

`ProjectWorkflowHydrator` (exposed via the public API) is the **one canonical
path** that maps a persisted `ProjectStatePayload` into the legacy generation
workflow state (`DesktopGenerateStateService.loadProjectState`) via the pure
`toGenerateWorkflowState` mapper. The application shell and pages call
`workflowHydrator.hydrate(payload)` after opening or creating a project; they
no longer rebuild the payload-to-workflow mapping inline.

It is a transitional service: it keeps the persistence boundary focused
(persistence hydrates `ProjectSessionStore`; the hydrator hydrates the
generation workflow). #76 retained it because `DesktopGenerateStateService`
still owns the workflow state; remove it only after workflow hydration moves to
a consolidated feature-owned store.

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

`initialize()` is resilient:

- concurrent calls share one in-flight initialization promise;
- a failed bootstrap clears the in-flight promise so it can be retried;
- a successful bootstrap is idempotent (later calls resolve immediately);
- unexpected bootstrap errors propagate and are not swallowed.

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

### Lint (through #75)

ESLint flat config with `angular-eslint` (TypeScript + Angular template
linting). In #74, lint is enabled for the new boundaries (`core/`, `shared/`,
`features/`), the application shell, and routes. Legacy `pages/` and `services/`
are brought under lint progressively in #76 as their internals migrate. Home,
Projects, Project Details, and Settings now live under `features/` and are in
the enforced lint scope. See
the follow-up register.

### `check:architecture`

A structured Node script (`scripts/check-architecture.mjs`) delegates all
checking to pure, unit-tested helpers in `scripts/check-architecture.lib.mjs`.
It audits the application shell and the new `core/` / `shared/` / `features/`
areas. It fails for:

- inline `template` / `styles` / `style` component metadata;
- a component without `ChangeDetectionStrategy.OnPush` (unless exempted);
- a component importing `DesktopBridgeService`;
- `window.confirm` or `window.prompt`;
- a feature importing another feature's internals. TypeScript AST traversal
  detects static imports (including side-effect-only imports), re-exports, and
  literal `import()` calls for both relative and `/features/`-style specifiers.
  Relative specifiers are resolved from the importing file. Computed dynamic
  import arguments are not evaluated. Cross-feature imports are allowed only
  through the target feature's explicit `public-api`; internal files remain
  private.

Legacy `pages/` and `services/` are not audited until migrated; this keeps the
gate meaningful and free of false positives during the staged refactor.

The helper library has behavioral test coverage in
`scripts/check-architecture.test.mjs`.

### Tests

Angular-compatible Vitest with a decorator-transpile plugin. The foundation adds
meaningful behavioral tests for the session store, mapper, persistence outcomes,
project library, settings, startup, routing contract, and the shell boundaries.
Existing source-text regression tests were made cwd-independent so they run both
from the repo root and per-package.

Component specs follow the Angular CLI `*.spec.ts` convention. Vitest discovers
both `*.spec.ts` and the repository's existing `*.test.ts` files during the
transition.

## Migrated feature ownership (#75)

- `features/home` owns the Home page, dashboard presentation components, and
  output-folder application action. Its pure dashboard view model lives at
  `features/home/home-dashboard.model.ts` and accepts a minimal feature-owned
  input rather than the legacy project facade shape.
- `features/projects` owns recent-project state, filtering/sorting view models,
  the Projects page, project cards, removal interaction, and its public API.
  The pure library model is colocated as
  `features/projects/projects-library.model.ts`.
- `features/project-details` owns project creation/editing presentation and
  local file-picker/cover-preview application actions.
- `features/settings` owns persisted settings and FFmpeg diagnostics.
  `SettingsPageComponent` uses an immutable local linked draft that tracks
  later service emissions and backend-normalized save results; it never mutates
  the shared settings signal object directly.
- All migrated components use external HTML/CSS and OnPush. No exception was
  introduced.
- Project lifecycle operations use the project-session public API; pages
  navigate only after typed success outcomes and refresh recents after
  successful create/open/save/save-as operations.

## Migrated feature ownership (#76)

- `features/source-review` owns the Source Review page, feature-local mapping
  models (`mapping.model.ts`, `source-review-view.model.ts`,
  `source-review-format.util.ts`), mapping-profile CRUD service
  (`mapping-profile.service.ts`), integrated mapping review, and focused
  presentational components for selected source summary, source/combined
  summaries, track candidates, mapping review, mapping profiles, issues,
  advanced JSON, and the action area. The page is a thin coordinator with
  computed signals for all derived presentation state.
  `window.prompt`/metadata editing for mapping profiles is replaced by the
  feature-local two-field `profile-metadata-dialog`; delete confirmation uses
  `shared/confirmation-dialog`. The `SourceReviewOrchestratorService` (in
  `services/`) owns bridge-backed analysis/normalization. The legacy
  `pages/mapping/` was deleted with proof.
- `features/generation` owns the Generate page, `GenerationService`
  (bridge-backed orchestration with typed outcomes for generation, overwrite,
  autosave, and output-folder operations), and focused presentation components
  for readiness, validation report, configuration, QA checklist, generation
  steps, log, output preview, and the action bar. The page is a thin
  coordinator with computed signals. `window.confirm` for overwrite is replaced
  by `shared/confirmation-dialog`. The page decides navigation only.
- `features/preview` owns the Preview page and 4 child components
  (chart-stage, transport-card, offset-panel, footer-stats). All use external
  templates/styles and OnPush. Collection-creating template methods were
  converted to `computed` signals using the `@Input() set` → internal
  `signal()` → `computed()` pattern. `DesktopPreviewService` (in `services/`)
  owns bridge-backed preview operations.
- `shared/confirmation-dialog` is the accessible Angular confirmation dialog
  used by Generate for overwrite confirmation.
- `shared/text-input-dialog` remains available as the shared one-field text
  input primitive. Source Review no longer uses it after the review fix because
  profile creation/editing requires both name and description, which is handled
  by the feature-local `profile-metadata-dialog`.
- All `window.confirm` and `window.prompt` usage is eliminated from Angular
  code. The architecture gate enforces this.
- No migrated component imports `DesktopBridgeService`; feature services own
  all bridge interaction.

## OnPush exception register

No exceptions in #74, #75, or #76. Any future exception must be proven and
listed in `angular-refactor-follow-ups.md`.
