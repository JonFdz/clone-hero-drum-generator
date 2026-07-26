# Design: Refactor Angular Frontend Architecture

## Context

The renderer is currently an Angular standalone application. It already uses signals and a desktop bridge service, which are suitable foundations for a clean Angular architecture. The refactor must preserve these strengths without introducing NgRx, another state library, or cross-layer changes.

The design follows these constraints:

- Feature-first organization.
- Standalone components.
- Angular signals.
- External templates and styles.
- Explicit OnPush change detection.
- One bridge boundary to Electron/preload.
- Services own use cases; pages compose UI and navigate.
- Engram is persistent project memory during implementation.

## Target folder structure

The exact names may be adjusted only when a repository-specific naming conflict requires it, but the ownership boundaries must remain equivalent.

```text
apps/desktop/src/app/
├── app.component.ts
├── app.component.html
├── app.component.css
├── app.component.spec.ts
├── app.routes.ts
│
├── core/
│   ├── desktop-bridge.service.ts
│   ├── application-startup.service.ts
│   └── application-error.service.ts
│
├── shared/
│   ├── confirmation-dialog/
│   │   ├── confirmation-dialog.component.ts
│   │   ├── confirmation-dialog.component.html
│   │   ├── confirmation-dialog.component.css
│   │   └── confirmation-dialog.component.spec.ts
│   ├── empty-state/
│   └── status-badge/
│
└── features/
    ├── project-session/
    │   ├── project-session.store.ts
    │   ├── project-persistence.service.ts
    │   ├── project-session.mapper.ts
    │   ├── project-session.model.ts
    │   └── *.spec.ts
    │
    ├── projects/
    │   ├── projects-page/
    │   ├── project-library.service.ts
    │   ├── projects-library.model.ts
    │   └── ...
    │
    ├── project-details/
    ├── home/
    ├── settings/
    ├── source-review/
    ├── generation/
    └── preview/
```

## Ownership and dependency boundaries

### `core`

`core` holds only infrastructure with application-wide scope:

- Desktop bridge boundary.
- App startup coordination.
- App-wide error handling if needed.

Do not move feature behavior into `core` merely because several pages currently use it.

### `shared`

`shared` holds only UI primitives or utilities that have demonstrated reuse across features or are required as app-level interaction infrastructure.

Candidates:

- `confirmation-dialog`.
- `empty-state`.
- `status-badge`.

Do not create a generic design-system library. Do not move one-off visual sections to `shared`.

### `features`

Each feature owns its own pages, presentation components, services, models, and tests.

A feature may import from:

- itself;
- `core`;
- `shared`;
- public interfaces from `features/project-session`.

A feature must not import pages, internal components, services, or private models from another feature.

## Component design

Every component is colocated:

```text
feature-section.component.ts
feature-section.component.html
feature-section.component.css
feature-section.component.spec.ts
```

All migrated components use:

```ts
changeDetection: ChangeDetectionStrategy.OnPush
```

A documented exception is permitted only when the agent demonstrates that OnPush is technically unsuitable. The exception must be explained beside the component metadata and listed in `docs/architecture/angular-refactor-follow-ups.md`.

### Template computation policy

Templates may call event handlers.

Templates must not call methods that:

- filter or sort collections;
- map collections;
- create arrays or objects;
- read multiple state sources to derive a status;
- format presentation rows;
- apply business or presentation decision logic.

Use `computed`, pure feature functions, or service-provided view models instead.

## State design

### Project session

`ProjectSessionStore` is a signal-based state holder for the active project and its workflow.

It owns:

- current project file path and name;
- dirty state;
- output/generation status;
- source path and source kind;
- audio path;
- output directory;
- cover image;
- metadata;
- offset;
- selected tracks;
- source inspection / analysis cache;
- normalization preview;
- mapping overrides;
- generation result and output files;
- workflow errors and warnings tied to the active project.

It does not own:

- recent projects;
- global settings;
- FFmpeg diagnostics;
- app health/version;
- route state.

### Project persistence

`ProjectPersistenceService` centralizes:

- create project;
- open by path;
- open from picker;
- save;
- save as;
- session hydration;
- persistence-to-session mapping;
- typed outcomes.

Opening a project follows one sequence:

```text
input path or picker
→ bridge operation
→ validate/interpret returned payload
→ hydrate ProjectSessionStore
→ refresh recent-project data where applicable
→ return typed result
```

Pages may navigate only after success:

```ts
const result = await this.projectPersistence.openProject(path);
if (result.ok) {
  await this.router.navigateByUrl("/projects/details");
}
```

The persistence service must not inject or use Angular Router.

### Project library

The Projects feature owns recent projects, filters, sorting, library view models, and removal/deletion interactions.

### Settings

The Settings feature owns persisted application settings and FFmpeg diagnostics.

### Generation

`GenerationService` owns generation orchestration:

- validation refresh;
- generate-input creation;
- overwrite confirmation workflow coordination;
- bridge invocation;
- result/error normalization;
- autosave;
- output-folder actions;
- typed outcomes.

The Generate page owns component composition and navigation only.

### Source review and mapping

Source Review owns source-review flow coordination. Mapping stays integrated in Source Review.

Mapping profile CRUD is exposed through a dedicated feature service. Pages and presentation components do not call the bridge directly.

## UI and interaction design

### Dialogs

Replace browser-native interaction APIs:

- `window.confirm`
- `window.prompt`

with Angular dialogs. The dialog implementation must be keyboard accessible and make destructive actions explicit.

### Visual consistency

Maintain the existing visual direction. Allowed low-risk improvements:

- consistent button hierarchy;
- status presentation;
- empty states;
- spacing;
- responsive layout;
- focus behavior;
- dialog presentation.

Do not introduce unrelated redesign work.

## Routing design

- Home remains eager.
- Feature pages use `loadComponent`.
- Avoid nested lazy-loading layers unless proven useful.
- Current user-visible route behavior is preserved.
- Legacy redirect routes/components are deleted only after proof that they have no route, import, navigation, test, documentation, or compatibility dependency.
- Uncertain candidates are recorded in `docs/architecture/angular-refactor-follow-ups.md`.

## Styles design

`src/styles.css` remains the Angular global stylesheet entry point.

It contains only:

- CSS variables/tokens;
- reset/base rules;
- global typography;
- accessibility fundamentals;
- true global utilities.

Feature and component layout must live in component CSS files.

## Quality design

### Lint

Configure real TypeScript, Angular, and template linting compatible with the current Angular version.

### Architecture check

Implement:

```bash
pnpm --filter @chdg/desktop check:architecture
```

It must fail for:

- inline Angular templates;
- inline Angular styles;
- `window.confirm`;
- `window.prompt`;
- components without OnPush unless explicitly exempted;
- `DesktopBridgeService` imported by a component;
- forbidden cross-feature imports.

Prefer a structured parser/AST implementation when practical. Avoid a brittle checker that routinely produces false positives.

### Tests

Use Angular-compatible Vitest. Prefer focused tests with behavioral value:

- stores and mappers;
- services and typed operation outcomes;
- routing;
- feature transformations;
- component interaction contracts;
- dialogs;
- workflow edge cases.

No artificial coverage target is required.

## Implementation order and risk control

### PR 1 — #74

Create the boundaries and quality gates first.

### PR 2 — #75

Migrate lower-risk page features after foundation is stable.

### PR 3 — #76

Migrate workflow-heavy pages after their shared state, persistence, and shared UI boundaries are established.

Do not collapse these steps into one PR.

## Rollback strategy

Each PR should be independently reversible:

- avoid cross-layer changes;
- retain equivalent behavior;
- use cohesive commits;
- do not delete uncertain legacy artifacts;
- document uncertain cleanup candidates.
