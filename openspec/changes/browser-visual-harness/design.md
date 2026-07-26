# Technical Design: Browser Visual Harness

## Context

The CHDG desktop renderer is an Angular standalone application started from `apps/desktop/src/main.ts`.

Electron-specific behavior is exposed by the preload script through `window.chdg`. Angular features access that API through `DesktopBridgeService`, which is intended to remain the sole Electron/preload boundary.

The browser harness must reuse the real Angular application and services while replacing only the external desktop boundary and providing deterministic startup state.

## Goals

- Start the real Angular renderer in a normal browser.
- Install a typed mock of the existing preload contract before Angular starts.
- Select reproducible application states from the URL.
- Seed the project session and feature state coherently.
- Keep production Electron behavior unchanged.
- Support visual inspection by ChatGPT/Codex and developers.
- Make failure states explicit and diagnosable.

## Non-Goals

- Host CHDG as a production web application.
- Reimplement desktop capabilities with browser APIs.
- Use real user files.
- Replace feature services with test doubles.
- Add Playwright in this issue.
- Redesign UI.
- Change domain behavior.

## Existing Runtime Boundary

Current production flow:

```text
Electron main process
  → preload.ts
  → window.chdg
  → DesktopBridgeService
  → Angular feature services and stores
  → Angular components
```

Browser-harness flow:

```text
browser-harness entry point
  → resolve scenario from URL
  → install deterministic window.chdg
  → register browser-only scenario initializer
  → bootstrap the normal Angular application
  → seed project and feature state before initial use
  → render existing routes and components
```

## Decision 1: Separate Angular Entry Point

Add a browser-harness entry point under:

```text
apps/desktop/src/browser-harness/main.browser.ts
```

The production entry point remains:

```text
apps/desktop/src/main.ts
```

Add an Angular build configuration named `browser-harness` that overrides the browser entry file. Add a `serve` target using `@angular/build:dev-server` and a package script:

```json
{
  "dev:browser": "ng serve --configuration browser-harness --host 127.0.0.1 --port 4200",
  "build:browser": "ng build --configuration browser-harness"
}
```

The exact script syntax may be adjusted to match Angular's generated configuration, but the externally supported commands and loopback binding are required.

### Rationale

A separate entry point gives a hard import boundary. Production `main.ts` does not import browser-harness modules, which prevents accidental mock installation.

### Rejected Alternative: Runtime Environment Check in `main.ts`

Do not place a query-string or hostname check in production `main.ts`.

That would make production startup aware of the harness and weaken isolation.

## Decision 2: Shared Bootstrap Function Only if Needed

The implementation may extract a small shared Angular bootstrap function if that avoids duplicating provider configuration.

Allowed shape:

```text
src/bootstrap-application.ts
src/main.ts
src/browser-harness/main.browser.ts
```

The shared function must contain only normal Angular bootstrap configuration. It must not import browser-harness code.

If extraction is unnecessary, duplicate the minimal `bootstrapApplication` call rather than introducing broad abstraction.

## Decision 3: Mock the Real `window.chdg` Contract

The browser harness installs a complete object typed as `NonNullable<Window["chdg"]>`.

Suggested structure:

```text
apps/desktop/src/browser-harness/
├── main.browser.ts
├── browser-harness-error.ts
├── browser-harness-query.ts
├── browser-harness-runtime.ts
├── install-browser-bridge.ts
├── browser-scenario.ts
├── scenario-registry.ts
├── fixture-builders/
└── scenarios/
```

The exact file split may change if repository conventions favor a different organization.

Every method must be one of:

1. explicitly supported by the active scenario;
2. an explicitly documented deterministic safe no-op;
3. an explicit rejected promise describing the unsupported operation.

There must be no implicit success fallback.

### Error Contract

Use one recognizable error type or message prefix, for example:

```text
BrowserHarnessError: operation "pickSourceFile" is unsupported in scenario "preview-ready"
```

The error must identify both the operation and active scenario.

## Decision 4: Resolve Scenario Before Bootstrap

`main.browser.ts` performs this order:

1. parse query parameters;
2. resolve the scenario;
3. fail on an unknown scenario;
4. create and install the scenario bridge;
5. create browser-only Angular providers for state seeding;
6. bootstrap Angular;
7. attach harness-only visual chrome unless hidden.

Angular must never start with an unresolved or partially installed browser bridge.

### Query Contract

Supported parameters:

| Parameter | Values | Default |
|---|---|---|
| `scenario` | registered scenario ID | `empty` |
| `harnessUi` | `visible`, `hidden` | `visible` |

Unexpected `harnessUi` values should either fail explicitly or use one documented normalization rule. The implementation must not guess silently; record the selected rule in tests and documentation.

## Decision 5: Scenario Model

Use a typed scenario contract similar to:

```ts
export type BrowserHarnessScenario = {
  id: BrowserScenarioId;
  description: string;
  recommendedRoute: string;
  createBridge: () => NonNullable<Window["chdg"]>;
  seedApplicationState?: (
    context: BrowserHarnessSeedContext,
  ) => Promise<void> | void;
};
```

`BrowserHarnessSeedContext` may expose only the services required to seed public application state, such as:

- `ProjectWorkflowHydrator`;
- `ProjectSessionStore`;
- generation feature state;
- preview feature state;
- router only if navigation is explicitly part of the scenario contract.

Prefer the narrowest context.

## Decision 6: Browser-Only Angular State Initializer

Bridge responses alone are insufficient for direct routes such as `/source-review`, `/generate`, and `/preview`, because the active project and feature state normally arise from user actions.

Provide browser-only startup initialization through Angular's supported application-initializer mechanism.

The initializer must:

- run only from the browser-harness entry point;
- seed the scenario before route-dependent work relies on it;
- use existing public hydration APIs where available;
- add a narrow explicit browser-harness adapter when no suitable public API exists;
- never mutate private fields;
- reject startup if seeding fails.

### State-Seeding Boundary

Do not add generic "set anything" methods to production stores.

If a feature needs deterministic harness seeding, add a narrow adapter with explicit domain intent, for example:

```text
BrowserHarnessProjectSeeder
BrowserHarnessGenerationSeeder
BrowserHarnessPreviewSeeder
```

These adapters must be provided only in the browser-harness bootstrap.

If implementing a scenario would require a broad new production mutation API or changing domain semantics, stop and ask the user before proceeding.

## Decision 7: Runtime Mode

The mock bridge reports a runtime mode distinct from desktop mode:

```ts
type RuntimeMode = "desktop" | "browser-harness";
```

Widen shared app-info and health models only as necessary.

The shell must distinguish:

- healthy production desktop;
- healthy browser harness;
- unavailable desktop bridge.

Production desktop labels and behavior must remain unchanged.

Suggested browser status wording:

```text
Browser Harness · Mock Data
```

Do not overload the unavailable-backend state to represent browser mode.

## Decision 8: Harness Indicator Outside Production Markup

Render harness-only visual chrome from browser-harness startup code or a browser-only provider/component.

Do not permanently add harness markup to the production `AppComponent` template.

The indicator must:

- identify browser-harness mode;
- show the active scenario ID;
- be fixed and visually distinct;
- avoid blocking normal controls;
- be absent when `harnessUi=hidden`;
- never appear in Electron.

The exact visual styling is not a product-design decision and should remain minimal.

## Decision 9: Deterministic Fixtures

Fixtures must be:

- committed to the repository;
- typed against real domain types;
- stable across runs;
- free of personal data;
- independent of filesystem state;
- intentionally small but realistic.

Use clearly synthetic paths such as:

```text
C:\CHDG-Harness\Projects\Demo Project.chdg.json
C:\CHDG-Harness\Sources\demo.mid
C:\CHDG-Harness\Output\Demo Song
```

These strings are display fixtures only. They must never be read from disk.

Centralize common builders for:

- successful and failed JSON envelopes;
- app information and health;
- settings;
- recent projects;
- project state;
- source inspection;
- normalized mapping data;
- mapping profiles;
- generation results;
- chart preview data.

## Decision 10: Initial Scenario Semantics

### `empty`

- Healthy browser-harness runtime.
- Default settings.
- No recent projects unless a single explicit synthetic example is needed by the page.
- No active project.
- No source or generated output.

### `project-loaded`

- Active synthetic project.
- Deterministic project metadata and paths.
- Source may be selected, but source-review readiness is not required.
- Useful for shell and Project Details inspection.

### `source-review-ready`

- Active project and source.
- Source inspection and normalization available.
- At least one selected drum track.
- Mapping state has no blocking issue.
- Continue-to-generate action is enabled.

### `source-review-attention`

- Active project and source.
- Deterministic unknown or overridden mappings require attention.
- Warning and issue counts are coherent with displayed rows.
- Continue behavior matches the real application's blocking rules.

### `generate-ready`

- Active project.
- Required source, mapping, metadata, and output state are present.
- Generation can start.
- No generation process runs automatically.

### `generate-running`

- Same coherent inputs as `generate-ready`.
- Feature state is deterministically seeded as in progress.
- Progress and logs are stable.
- No real process, timer race, or filesystem operation is required.

### `generate-failed`

- Same coherent inputs as `generate-ready`.
- Feature state contains one deterministic failure and related log evidence.
- Retry behavior follows current UI behavior.
- No real failure is triggered.

### `preview-ready`

- Active generated project.
- Deterministic chart preview data is available.
- The Highway and chart preview can render without a chart file.
- Audio may be unavailable unless a deterministic browser-safe source already exists; limitations must be represented honestly.
- No output file is read from disk.

## Decision 11: Scenario and Route Independence

The scenario registry defines a `recommendedRoute`, but query selection does not force navigation by default.

This allows an agent to inspect how one coherent state appears across multiple routes.

Documentation should provide canonical route examples.

If the current application cannot safely render a scenario outside its recommended route, the implementation may add an explicit validation warning, but it must not silently redirect unless the user approves that behavior.

## Decision 12: Tests

Add focused Vitest coverage for:

- query parsing;
- default scenario resolution;
- known scenario resolution;
- unknown scenario failure;
- bridge installation order and duplicate protection;
- unsupported-operation errors;
- fixture type consistency;
- state seeding for at least one project-backed scenario;
- hidden and visible harness UI resolution;
- runtime mode reporting.

Where practical, add an architecture assertion that production `main.ts` does not import from `browser-harness/`.

Do not add Playwright in this issue.

## Decision 13: Documentation

Add the development document at the repository's established desktop documentation location:

```text
docs/desktop/browser-visual-harness.md
```

It must document:

- commands;
- supported scenarios;
- canonical URLs;
- safe-fixture policy;
- unsupported-operation behavior;
- ChatGPT/Codex validation workflow;
- how to add a scenario;
- production-isolation expectations;
- troubleshooting.

This is an approved deviation from the originally proposed `docs/development/` path. The user selected `docs/desktop/` after preflight confirmed that it is the repository's established desktop documentation location.

## Validation Strategy

### Static

- lint;
- architecture checks;
- typecheck;
- browser build;
- normal desktop build.

### Automated

- desktop tests;
- browser-harness unit tests;
- repository tests.

### Interactive

Start:

```bash
pnpm --filter @chdg/desktop dev:browser
```

Verify at minimum:

```text
http://127.0.0.1:4200/home?scenario=empty
http://127.0.0.1:4200/projects/details?scenario=project-loaded
http://127.0.0.1:4200/source-review?scenario=source-review-ready
http://127.0.0.1:4200/source-review?scenario=source-review-attention
http://127.0.0.1:4200/generate?scenario=generate-ready
http://127.0.0.1:4200/generate?scenario=generate-running
http://127.0.0.1:4200/generate?scenario=generate-failed
http://127.0.0.1:4200/preview?scenario=preview-ready
http://127.0.0.1:4200/preview?scenario=preview-ready&harnessUi=hidden
```

For each relevant page:

- reload directly;
- inspect console;
- confirm runtime status;
- confirm scenario indicator;
- confirm no real file dialog or filesystem access occurs;
- confirm layout renders at ordinary and narrow desktop widths.

## Implementation Stop Conditions

The agent must stop and ask the user before proceeding when:

- a referenced file or service cannot be found;
- the preload contract differs materially from the expected `window.chdg` boundary;
- project state cannot be seeded without private-field mutation;
- the required Angular builder does not support the proposed configuration;
- implementing runtime mode would change production behavior;
- a scenario's intended domain state is ambiguous;
- repository architecture rules conflict with the proposed directory structure;
- a new dependency appears necessary;
- fulfilling an acceptance criterion requires scope outside issue #90.
