# Angular Refactor Follow-up Register

Living register of deferred candidates, exceptions, and rollout items for the
Angular frontend refactor (parent issue #73). Items are resolved by the
implementation issue that performs the migration, or kept here when deletion
cannot be proven safe.

## Foundation (#74) — accepted trade-offs and deferred items

### Relocate `DesktopBridgeService` into `core/`

The bridge is the canonical core boundary by responsibility but remains at
`services/desktop-bridge.service.ts` in #74 to avoid churning every legacy page
import during the foundation PR. Relocate it into `core/` together with the
page migrations in #75/#76, when those import paths are touched anyway.

### Remove the `DesktopProjectStateService` facade

`services/desktop-project-state.service.ts` is a transitional facade preserving
the pre-refactor API for unmigrated pages/services. It delegates to
`ProjectSessionStore`, `ProjectLibraryService`, `SettingsService`, and
`ProjectPersistenceService`. Remove it as each page migrates to the canonical
services (#75/#76). Consumers to migrate:

- `pages/generate`, `pages/home`, `pages/new-project`,
  `pages/projects/projects-page`, `pages/projects/project-details`,
  `pages/settings` (recents/settings/project-state reads).
- `services/desktop-generate-state.service` (mark* calls -> `ProjectSessionStore`).
- `services/desktop-validation.service`, `services/desktop-preview.service`,
  `services/source-review-orchestrator.service`, `services/home-dashboard-model`,
  `services/desktop-validation-model` (typed `DesktopProjectState` reads).

### Consolidate generation workflow state into the session boundary

`DesktopGenerateStateService` currently owns workflow state (source/audio/
metadata/inspection/normalization/mapping/generation result). The design
target places active-project/workflow state behind the project-session boundary.
Consolidation is deferred to #76 (GenerationService) to avoid refactoring
workflow-heavy page internals in the foundation PR.

### Replace `window.confirm` / `window.prompt` with Angular dialogs

Forbidden by the architecture gate. Current usages (in unmigrated pages, outside
the #74 audited scope):

- `pages/source-review/source-review-page.component.ts` — `window.prompt` for
  profile name.
- `pages/mapping/mapping-page.component.ts` — `window.prompt` for profile
  name/description.
- `pages/generate/generate-page.component.ts` — `window.confirm` for overwrite.

Replace with accessible Angular dialogs when those pages migrate (#76). Add
`shared/confirmation-dialog` at that point (genuine reuse across generate and
mapping).

### Full-app lint enablement

ESLint is configured for `core/`, `shared/`, `features/`, the shell, and routes
in #74. Legacy `pages/` and `services/` are excluded until migrated. Remove the
`src/app/pages/**` and `src/app/services/**` ignores as each area is migrated
(#75/#76).

### Behavioral routing test

`app.routes.test.ts` asserts the routing contract structurally because importing
`routes` triggers Angular JIT compilation that requires the Angular test
platform (JIT compiler + TestBed), not configured for the Vitest node
environment. Add a behavioral `TestBed`-based routing test when Angular
component testing is set up (follow-up).

### `ApplicationErrorService` (core)

App-wide error handling is a core responsibility in the design but was not
needed for the foundation. Introduce `core/application-error.service.ts` when a
feature requires centralized error surfacing (e.g., persistence failures shown
in the shell).

## Legacy route and component cleanup candidates

Do not delete until proven dead (no route, import, navigation, test,
documentation, or compatibility dependency). Currently retained redirects:

- `new-project` -> `projects/details`
- `inspect-source` -> `source-review`
- `track-selection` -> `source-review`
- `mapping` -> `source-review`
- `validation` -> `generate`

Uncertain legacy page components still present under `pages/` (e.g., standalone
`inspect-source`, `track-selection`, `mapping` pages) are evaluated for removal
in #76 during Source Review/Mapping migration. Record deletion proof in the PR
that removes them.

## OnPush exceptions

None. Any future exception must be proven technically unavoidable, documented
beside the component metadata, and added here.

## Build budget warnings (pre-existing)

`generate-page` and `source-review-page` component CSS exceed the 8 kB
`anyComponentStyle` budget warning (pre-existing inline styles in legacy pages).
These are warnings, not errors, and are resolved when those pages are split into
focused components with external stylesheets (#76).
