# Implementation Tasks: Browser Visual Harness

Update this checklist as work is completed.

Do not mark a task complete until its implementation and stated validation are both finished.

## 0. Preflight and Repository Verification

- [x] 0.1 Read root `AGENTS.md` and all files in this OpenSpec change.
- [x] 0.2 Verify the current branch is `feat/90-browser-visual-harness`.
- [x] 0.3 Verify issue #90 scope against the GitHub issue.
- [x] 0.4 Locate and inspect:
  - `apps/desktop/angular.json`
  - `apps/desktop/package.json`
  - `apps/desktop/src/main.ts`
  - Electron preload source
  - the global `Window["chdg"]` declaration
  - `DesktopBridgeService`
  - `ApplicationStartupService`
  - `ProjectWorkflowHydrator`
  - `ProjectSessionStore`
  - generation state service/store
  - preview state service/store
  - architecture-check scripts
- [x] 0.5 If any required file is missing, renamed, or materially different, stop and notify the user before coding.
- [x] 0.6 Identify material ambiguities and ask the user before choosing an architecture or scenario meaning.
- [x] 0.7 Record any approved deviation in `design.md` before implementation.

## 1. Browser Build and Serve Boundary

- [x] 1.1 Add a `browser-harness` Angular build configuration using a separate browser entry point.
- [x] 1.2 Add the Angular development-server target if one does not exist.
- [x] 1.3 Add `dev:browser` bound to `127.0.0.1:4200`.
- [x] 1.4 Add `build:browser`.
- [x] 1.5 Confirm the normal production renderer entry point remains unchanged.
- [x] 1.6 Add or update architecture checks to prevent production `main.ts` from importing browser-harness code where practical.
- [x] 1.7 Validate a minimal browser entry point before implementing scenarios.

## 2. Harness Query and Error Model

- [x] 2.1 Add typed query parsing for `scenario` and `harnessUi`.
- [x] 2.2 Implement the documented `empty` default.
- [x] 2.3 Implement descriptive unknown-scenario errors.
- [x] 2.4 Implement one recognizable browser-harness error type or message contract.
- [x] 2.5 Add unit tests for query parsing and invalid values.
- [x] 2.6 Document the selected behavior for unexpected `harnessUi` values.

## 3. Scenario Registry and Typed Fixture Foundation

- [x] 3.1 Define `BrowserScenarioId`.
- [x] 3.2 Define the typed `BrowserHarnessScenario` contract.
- [x] 3.3 Add the scenario registry and uniqueness validation.
- [x] 3.4 Add typed success and failure envelope builders.
- [x] 3.5 Add deterministic fixture builders for app info, health, settings, recents, and project state.
- [x] 3.6 Ensure synthetic path values are never passed to filesystem APIs.
- [x] 3.7 Add registry and fixture tests.

## 4. Browser Bridge Installation

- [x] 4.1 Implement a complete bridge object typed as `NonNullable<Window["chdg"]>`.
- [x] 4.2 Install the bridge before Angular bootstrap.
- [x] 4.3 Prevent silent replacement of an existing `window.chdg`.
- [x] 4.4 Implement explicit unsupported-operation rejection.
- [x] 4.5 Implement only documented deterministic safe no-ops.
- [x] 4.6 Add tests for installation, duplicate protection, supported operations, and unsupported operations.
- [x] 4.7 Confirm no bridge method reads arbitrary local files or invokes Electron.

## 5. Browser-Only Application State Seeding

- [x] 5.1 Identify the smallest public APIs required to seed active project state.
- [x] 5.2 Implement a browser-only application initializer.
- [x] 5.3 Seed project state through `ProjectWorkflowHydrator` or another approved public boundary.
- [x] 5.4 Add narrow browser-only generation-state seeding if required.
- [x] 5.5 Add narrow browser-only preview-state seeding if required.
- [x] 5.6 Do not add generic production mutation APIs.
- [x] 5.7 Do not mutate private fields.
- [x] 5.8 Reject startup when scenario seeding fails.
- [x] 5.9 Add at least one automated test for a project-backed scenario seed.
- [x] 5.10 Ask the user before proceeding if coherent state cannot be created through an acceptable boundary.

## 6. Runtime Mode and Harness Indicator

- [x] 6.1 Add the minimum typed runtime-mode support needed for `browser-harness`.
- [x] 6.2 Preserve production desktop labels and behavior.
- [x] 6.3 Render a healthy browser/mock runtime status rather than unavailable backend.
- [x] 6.4 Add browser-only harness chrome showing the active scenario.
- [x] 6.5 Implement `harnessUi=hidden`.
- [x] 6.6 Ensure harness chrome is not part of production `AppComponent` markup unless explicitly approved.
- [x] 6.7 Add focused tests for runtime mode and harness UI visibility.

## 7. Initial Scenario Implementation

- [x] 7.1 Implement `empty`.
- [x] 7.2 Implement `project-loaded`.
- [x] 7.3 Implement `source-review-ready`.
- [x] 7.4 Implement `source-review-attention`.
- [x] 7.5 Implement `generate-ready`.
- [x] 7.6 Implement `generate-running`.
- [x] 7.7 Implement `generate-failed`.
- [x] 7.8 Implement `preview-ready`.
- [x] 7.9 Verify every scenario contains coherent bridge responses and Angular state.
- [x] 7.10 Verify scenario identifiers are stable and unique.
- [x] 7.11 Verify no scenario triggers a real production process or file operation.

## 8. Documentation

- [x] 8.1 Add browser-harness development documentation in the repository's established docs location.
- [x] 8.2 Document commands and loopback URL.
- [x] 8.3 Document every initial scenario and canonical route.
- [x] 8.4 Document `harnessUi=hidden`.
- [x] 8.5 Document unsupported-operation errors.
- [x] 8.6 Document safe fixture policy.
- [x] 8.7 Document how ChatGPT/Codex should start, inspect, and validate the renderer.
- [x] 8.8 Document how to add a new scenario.
- [x] 8.9 Document production-isolation guarantees and troubleshooting.

## 9. Interactive Browser Validation

- [x] 9.1 Start `pnpm --filter @chdg/desktop dev:browser`.
- [x] 9.2 Verify `empty` at `/home`.
- [x] 9.3 Verify `project-loaded` at `/projects/details`.
- [x] 9.4 Verify both Source Review scenarios.
- [x] 9.5 Verify all three generation scenarios.
- [x] 9.6 Verify `preview-ready`.
- [x] 9.7 Reload every canonical URL directly.
- [x] 9.8 Verify browser-harness runtime status.
- [x] 9.9 Verify active scenario indicator.
- [x] 9.10 Verify `harnessUi=hidden`.
- [x] 9.11 Inspect the browser console for unexpected errors.
- [x] 9.12 Verify ordinary and narrow desktop widths.
- [x] 9.13 Verify no real file picker, filesystem access, or production process occurs.

## 10. Quality Gates

- [x] 10.1 Run `pnpm --filter @chdg/desktop lint`.
- [x] 10.2 Run `pnpm --filter @chdg/desktop check:architecture`.
- [x] 10.3 Run `pnpm --filter @chdg/desktop test`.
- [x] 10.4 Run `pnpm --filter @chdg/desktop typecheck`.
- [x] 10.5 Run `pnpm --filter @chdg/desktop build:browser`.
- [x] 10.6 Run `pnpm --filter @chdg/desktop build`.
- [x] 10.7 Run `pnpm test`.
- [x] 10.8 Review the final diff for unintended production coupling.
- [x] 10.9 Confirm only issue #90 scope is included.
- [x] 10.10 Update all completed task checkboxes and record any remaining limitation.

### Remaining validation limitations

- None. Interactive browser validation and every required quality gate completed successfully.

## 11. Completion Report

- [x] 11.1 Report the implemented architecture.
- [x] 11.2 List every verified scenario URL.
- [x] 11.3 Report every quality-gate result.
- [x] 11.4 Report remaining limitations.
- [x] 11.5 Report every approved deviation from this OpenSpec.
- [x] 11.6 Confirm production Electron behavior remains unchanged.
