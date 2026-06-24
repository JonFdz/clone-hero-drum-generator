# Angular Refactor Follow-up Register

Living register of deferred candidates, exceptions, and rollout items for the
Angular frontend refactor (parent issue #73). Items are resolved by the
implementation issue that performs the migration, or kept here when deletion
cannot be proven safe.

## Foundation (#74) — accepted trade-offs and deferred items

### Relocate `DesktopBridgeService` into `core/`

The bridge is the canonical core boundary by responsibility but remains at
`services/desktop-bridge.service.ts`. Relocation was evaluated in #76: all
feature services (`GenerationService`, `MappingProfileService`,
`SourceReviewOrchestratorService`, `DesktopPreviewService`,
`ProjectDetailsService`, `HomeService`, `ProjectLibraryService`,
`SettingsService`, `ProjectPersistenceService`) import from `services/`.
Relocating the bridge would require updating all these import paths
simultaneously. The remaining unmigrated pages (`new-project`,
`inspect-source`, `track-selection`) also import it directly. Relocate only
when those last pages are migrated or removed and all service imports can be
updated atomically.

### Remove the `DesktopProjectStateService` facade

`services/desktop-project-state.service.ts` is a transitional facade. After #76,
consumers are

- Remaining unmigrated pages: `new-project`, `inspect-source`,
  `track-selection` (all redirect-only routes).
- `services/desktop-generate-state.service` (mark* calls).
- `services/desktop-validation.service`, `services/desktop-preview.service`,
  `services/source-review-orchestrator.service`.

Home, Projects, Project Details, Settings, Source Review, and Preview no
longer consume this facade after #75/#76. Generate still consumes the facade for
output-status presentation and generation failure state while
`DesktopGenerateStateService` remains the workflow owner. Remove the facade only
when Generate and the remaining legacy pages/services move to a consolidated
feature-owned workflow/session store.

### Remove `DesktopGenerateStateService` (transitional)

`services/desktop-generate-state.service.ts` owns workflow state
(source/audio/metadata/inspection/normalization/mapping/generation result).
After #76, it is consumed by `GenerationService`,
`SourceReviewOrchestratorService`, `DesktopPreviewService`,
`DesktopValidationService`, and the Source Review / Generate feature page
components (via `inject()`). Consolidation into a feature-owned workflow store
is deferred until the remaining legacy pages and services are migrated. The
`GenerationService`, `MappingProfileService`, and
`SourceReviewOrchestratorService` already provide typed-outcome/service
abstractions over the workflow state; future consolidation should move the
state into a feature store and remove `DesktopGenerateStateService`.

### Remove `ProjectWorkflowHydrator` (transitional)

`features/project-session/project-workflow-hydrator.ts` is a transitional
bridge between persisted payloads and the legacy `DesktopGenerateStateService`.
After #76, it is consumed by `app.component`, `home`, `projects`, and
`project-details` — the pages that open/create projects. It cannot be removed
until the generation feature owns its own hydration from the project-session
payload, which requires consolidating `DesktopGenerateStateService` first.

### Retained `services/source-review-model.ts` helpers

The larger `services/source-review-model.ts` helper module remains in
`services/` for now because it is still consumed by the transitional
`SourceReviewOrchestratorService` and `DesktopPreviewService`, not only by the
Source Review feature. Moving it fully into `features/source-review/` would
invert dependency direction and widen churn while those services remain
transitional. The clearly Source Review-owned `mapping.model.ts`,
`source-review-view.model.ts`, and `source-review-format.util.ts` now live in
`features/source-review/`.

### Full-app lint enablement

ESLint covers `core/`, `shared/`, `features/`, the shell, and routes. Legacy
`pages/` (remaining: `new-project`, `inspect-source`, `track-selection`) and
transitional `services/` remain excluded until their migration. Remove those
ignores when the last legacy areas are migrated or consciously documented.

### Retained legacy redirect-only page components

`pages/new-project/new-project-page.component.ts`,
`pages/inspect-source/inspect-source-page.component.ts`, and
`pages/track-selection/track-selection-page.component.ts` remain even though
their routes redirect to `/projects/details` or `/source-review`. They still
import `DesktopBridgeService` and transitional workflow services. Delete only
after proving no route, import, navigation, test, documentation, or
compatibility consumer remains.

### Architecture import analysis coverage

The #74 architecture gate uses the TypeScript AST for static imports,
side-effect-only imports, re-exports, and dynamic `import()` calls with literal
module specifiers. Computed dynamic import arguments are intentionally not
resolved.

### Behavioral routing test

`app.routes.test.ts` asserts the routing contract structurally because importing
`routes` triggers Angular JIT compilation. Add a behavioral `TestBed`-based
routing test when Angular component testing is set up.

### `ApplicationErrorService` (core)

App-wide error handling is a core responsibility in the design but was not
needed. Introduce when a feature requires centralized error surfacing.

## #76 — resolved items

### `window.confirm` / `window.prompt` — RESOLVED

All `window.confirm` and `window.prompt` usage has been removed from Angular
code. Replaced with:

- `shared/confirmation-dialog` — accessible confirmation dialog (used by
  Generate for overwrite confirmation and Source Review profile deletion).
- `features/source-review/components/profile-metadata-dialog` — feature-local
  accessible two-field dialog for mapping profile create/edit (name + optional
  description).
- `shared/text-input-dialog` remains the shared one-field primitive but is not
  used by Source Review after the review fix because profile metadata requires
  two fields.

The architecture gate enforces this across all audited scope.

### Legacy Mapping route/component — DELETED (proven dead)

`pages/mapping/mapping-page.component.ts`, `mapping-page.model.ts`, and
`mapping-page.component.test.ts` were deleted in #76 with documented proof:

1. **Routes**: `/mapping` redirects to `/source-review` — no component is
   loaded.
2. **Imports**: No file imports `MappingPageComponent`.
3. **Navigation**: No code navigates to a Mapping page component.
4. **Tests**: The test file only tested `buildMappingRows`, which was moved to
   `features/source-review/mapping.model.ts` with expanded tests.
5. **Documentation**: Updated in this register.

The `buildMappingRows` function and `MappingRow` type now live in
`features/source-review/mapping.model.ts` as a feature-owned shared model.

### Build budget warnings — RE-EVALUATED

After the Source Review split, no Source Review component needs the relaxed
budget anymore; the largest Source Review stylesheet is now the extracted
`source-review-mapping-review.component.css` at ~5.8 kB.

However, the stricter pre-#76 `anyComponentStyle` warning budget (8 kB) still
cannot be restored yet because `features/generation/generate-page.component.css`
remains ~9.8 kB after the approved #76 Generate split. The current production
budget therefore remains at:

- warning: `16kb`
- error: `32kb`

Keep the raised threshold only until Generate is reduced further; re-tighten it
when the largest remaining component stylesheet drops below the stricter target.

### Source Review component split + Mapping Profiles CRUD — RESOLVED

Source Review is no longer a single UI monolith. It is split into focused
feature-owned presentational components for:

1. selected source summary;
2. source / combined summaries;
3. track candidates;
4. mapping review;
5. mapping profiles;
6. issues / warnings;
7. advanced JSON;
8. action area.

The page now acts as a thin coordinator and converts workflow/service state into
presentation-ready view models. Mapping Profile behavior has been restored
inside Source Review without reviving the legacy Mapping page:

- list all profiles;
- select a profile;
- show selected name/description/override count;
- choose `merge` or `replace`;
- apply the selected profile (never the first profile by accident);
- create from current overrides;
- update selected profile from current overrides;
- edit selected profile metadata;
- delete with confirmation;
- surface typed profile-operation failures;
- call the orchestration renormalization path after profile apply / override changes.

### Source Review `mapping-page.model` import — RESOLVED

Source Review no longer imports from the legacy `pages/mapping/` directory.
The `buildMappingRows` function and `MappingRow` type are feature-owned in
`features/source-review/mapping.model.ts`.

## Legacy route and component cleanup candidates

Retained redirect-only routes (no component loaded):

- `new-project` -> `projects/details`
- `inspect-source` -> `source-review`
- `track-selection` -> `source-review`
- `mapping` -> `source-review` (component deleted in #76)
- `validation` -> `generate`

Retained legacy page components still present under `pages/`:

- `new-project/new-project-page.component.ts` — redirect to `/projects/details`
- `inspect-source/inspect-source-page.component.ts` — redirect to `/source-review`
- `track-selection/track-selection-page.component.ts` — redirect to `/source-review`

These are evaluated for removal when the remaining pages are migrated. They
still import `DesktopBridgeService` and transitional services directly.

## OnPush exceptions

None. All migrated components use `ChangeDetectionStrategy.OnPush`.
