# Change Proposal: Browser Visual Harness

## Summary

Add a deterministic browser-based visual harness for the CHDG Angular desktop renderer.

The harness will allow ChatGPT/Codex and developers to start the renderer without Electron, open reproducible UI states by URL, inspect the application in a browser, compare implementation against Pencil, and validate visual changes without using real local files.

## Why

The production UI currently runs inside Electron and receives desktop capabilities through the preload-provided `window.chdg` API.

That works for normal use, but it creates friction for design and agent-assisted UI work:

- the agent cannot reliably open a specific application state without interacting with native file dialogs;
- inspecting a page may require a real project, source file, generated output, or local configuration;
- visual validation is slower when every iteration launches Electron;
- screenshots are difficult to reproduce when state depends on local files;
- browser developer tooling cannot be used as directly as it can with a local Angular development server.

Issue #89 introduces Pencil as the version-controlled design workspace. A browser harness is required so an agent can compare approved Pencil designs with the real Angular implementation and validate changes through a local browser.

## What Changes

The desktop package will gain:

- a browser-only Angular entry point;
- a `dev:browser` command bound to `127.0.0.1`;
- a browser build command for deterministic validation;
- a browser-only implementation of the existing `window.chdg` contract;
- a scenario registry selected through the `scenario` URL query parameter;
- deterministic repository-owned fixtures;
- browser-only Angular state seeding for scenario setup;
- a visible harness indicator showing the active scenario;
- a `harnessUi=hidden` query option for clean screenshots;
- focused tests and development documentation.

## Initial Scenarios

The first implementation will support:

- `empty`
- `project-loaded`
- `source-review-ready`
- `source-review-attention`
- `generate-ready`
- `generate-running`
- `generate-failed`
- `preview-ready`

## In Scope

- Starting the Angular renderer without Electron.
- Reusing the existing Angular routes and components.
- Mocking the existing preload boundary.
- Deterministic bridge responses.
- Deterministic session and feature-state seeding.
- Direct route loading and browser reload.
- Clear identification of browser/mock mode.
- Explicit errors for unsupported operations.
- Unit and integration-level tests for harness infrastructure.
- Documentation for ChatGPT/Codex visual validation.

## Out of Scope

- Replacing Electron.
- Making the production application a normal hosted web application.
- Implementing real browser filesystem access.
- Uploading real MIDI, GPIF, audio, chart, project, or image files.
- Calling production backend processes from the browser.
- Playwright screenshot baselines.
- Automatic Pencil-to-Angular code generation.
- Redesigning the current UI.
- Changing chart generation, source parsing, mapping, preview, persistence, or IPC semantics.
- Introducing React, Tailwind, or another frontend stack.

## Impact

### Production

The Electron application must retain its current startup path and preload behavior.

Shared runtime models may be widened only where necessary to distinguish `desktop` from `browser-harness` mode. Desktop behavior and wording must remain unchanged.

### Development

Developers and agents will be able to run:

```bash
pnpm --filter @chdg/desktop dev:browser
```

and open deterministic states such as:

```text
http://127.0.0.1:4200/source-review?scenario=source-review-ready
http://127.0.0.1:4200/generate?scenario=generate-failed
http://127.0.0.1:4200/preview?scenario=preview-ready&harnessUi=hidden
```

### Testing

The change adds focused tests for:

- scenario resolution;
- unknown-scenario rejection;
- bridge installation;
- explicit unsupported-operation failures;
- browser-only state seeding;
- harness visibility options;
- preservation of production startup behavior.

## Risks

### Browser code leaking into production

Mitigation:

- use a separate Angular browser-harness configuration and entry point;
- do not import browser-harness modules from the production `main.ts`;
- add architecture or build assertions where practical.

### Fixtures drifting from real contracts

Mitigation:

- type all fixtures against the real `Window["chdg"]` and project-domain types;
- centralize envelope and fixture builders;
- keep scenario tests close to the contract.

### Scenarios rendering impossible state

Mitigation:

- define each scenario as one coherent bundle of bridge responses and Angular state;
- seed through public feature APIs or explicit browser-only adapters;
- document the scenario's intended route and invariants.

### Silent false confidence

Mitigation:

- unsupported operations reject with descriptive errors;
- unknown scenarios do not silently fall back;
- harness mode and active scenario remain visible unless intentionally hidden.

## Dependencies

This change depends on the current renderer, preload contract, desktop bridge service, application startup sequence, and project-session hydration mechanisms.

If any referenced boundary or file is missing or materially different, implementation must stop until the discrepancy is reviewed with the user.

## Success Criteria

The change is successful when an agent can:

1. start the renderer without Electron;
2. open every initial scenario directly by URL;
3. reload the route without losing the selected scenario;
4. inspect a healthy browser-harness runtime rather than an unavailable backend;
5. hide harness chrome for screenshots;
6. observe explicit errors for unsupported actions;
7. verify that production Electron builds remain unaffected;
8. run the repository quality gates successfully.
