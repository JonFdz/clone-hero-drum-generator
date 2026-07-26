# Browser Visual Harness Specification

## Purpose

Define the observable behavior of the deterministic browser-based visual harness for the CHDG Angular desktop renderer.

## ADDED Requirements

### Requirement: Browser-Only Renderer Startup

The system SHALL provide a supported command that starts the Angular renderer in a browser without launching Electron.

#### Scenario: Starting the browser harness

- **GIVEN** the repository dependencies are installed
- **WHEN** a developer runs `pnpm --filter @chdg/desktop dev:browser`
- **THEN** the Angular renderer SHALL start without launching Electron
- **AND** the development server SHALL bind to `127.0.0.1`
- **AND** the renderer SHALL be available on a documented local port

#### Scenario: Building the browser harness

- **GIVEN** the browser harness is configured
- **WHEN** a developer runs `pnpm --filter @chdg/desktop build:browser`
- **THEN** the browser-harness renderer SHALL compile successfully
- **AND** the build SHALL use the browser-harness entry point rather than the production Electron renderer entry point

### Requirement: Production Startup Isolation

The system SHALL preserve the existing production Electron startup path and preload behavior.

#### Scenario: Building the production desktop application

- **GIVEN** browser-harness code exists in the repository
- **WHEN** the normal desktop build runs
- **THEN** the production Angular renderer SHALL continue using the production entry point
- **AND** the Electron preload SHALL remain the source of `window.chdg`
- **AND** browser-harness startup code SHALL NOT install mock behavior

#### Scenario: Running the Electron application

- **GIVEN** the application is launched through Electron
- **WHEN** Angular starts
- **THEN** existing desktop behavior SHALL remain unchanged
- **AND** browser-harness indicators SHALL NOT be rendered

### Requirement: Bridge Installation Before Angular

The browser harness SHALL install a deterministic implementation of the existing `window.chdg` contract before Angular application startup.

#### Scenario: Bootstrapping a valid scenario

- **GIVEN** a valid browser scenario is selected
- **WHEN** the browser-harness entry point executes
- **THEN** the scenario bridge SHALL be installed before Angular services can access `window.chdg`
- **AND** Angular services SHALL use the existing desktop bridge boundary
- **AND** components SHALL NOT require scenario-specific mocks

#### Scenario: Preventing double installation

- **GIVEN** `window.chdg` is already defined
- **WHEN** the browser-harness installer attempts to install a bridge
- **THEN** the installer SHALL fail with a descriptive error
- **AND** it SHALL NOT overwrite an existing bridge silently

### Requirement: Deterministic Scenario Selection

The browser harness SHALL resolve the active scenario from the `scenario` URL query parameter.

#### Scenario: Selecting a known scenario

- **GIVEN** the URL contains a registered scenario identifier
- **WHEN** the page loads
- **THEN** the matching deterministic scenario SHALL be selected
- **AND** the scenario identifier SHALL remain available to the harness UI and diagnostics

#### Scenario: Omitting the scenario parameter

- **GIVEN** the URL does not contain a `scenario` parameter
- **WHEN** the page loads
- **THEN** the harness SHALL select the documented `empty` default scenario
- **AND** the active scenario SHALL be identified as `empty`

#### Scenario: Selecting an unknown scenario

- **GIVEN** the URL contains an unregistered scenario identifier
- **WHEN** the page loads
- **THEN** startup SHALL fail with a clear unknown-scenario error
- **AND** the error SHALL list or link to the supported scenario identifiers
- **AND** the harness SHALL NOT silently fall back to another scenario

### Requirement: Direct Route Reproduction

The browser harness SHALL support direct navigation and reload for Angular routes combined with a deterministic scenario.

#### Scenario: Opening a scenario route directly

- **GIVEN** a registered scenario and an existing Angular route
- **WHEN** a developer opens the route and query string directly
- **THEN** the Angular router SHALL render the requested route
- **AND** the selected scenario SHALL be active before route-dependent services initialize

#### Scenario: Reloading a scenario route

- **GIVEN** a scenario route is already open
- **WHEN** the browser reloads the page
- **THEN** the same route and scenario SHALL be restored from the URL
- **AND** manual project setup SHALL NOT be required

### Requirement: Coherent Scenario State

Each scenario SHALL define one coherent and testable combination of bridge responses and Angular application state.

#### Scenario: Loading a project-backed scenario

- **GIVEN** a scenario requires an active project
- **WHEN** Angular initializes
- **THEN** the project session SHALL contain deterministic project data
- **AND** route components SHALL observe state consistent with the scenario bridge responses
- **AND** no private component or service field SHALL be mutated to create the state

#### Scenario: Loading a stateless scenario

- **GIVEN** the `empty` scenario is selected
- **WHEN** Angular initializes
- **THEN** no active project SHALL be seeded
- **AND** default settings and deterministic empty recents SHALL be available
- **AND** the application SHALL render its normal empty states

### Requirement: Repository-Owned Safe Fixtures

The browser harness SHALL use deterministic repository-owned fixtures and SHALL NOT access arbitrary local files.

#### Scenario: Serving fixture data

- **GIVEN** a browser scenario needs project, source, mapping, generation, or preview data
- **WHEN** the corresponding bridge method is called
- **THEN** it SHALL return typed deterministic fixture data from the repository
- **AND** it SHALL NOT read private user directories
- **AND** it SHALL NOT require a real MIDI, GPIF, audio, chart, image, project, or output file

#### Scenario: Receiving a path-like value

- **GIVEN** a mocked operation receives a path-like argument
- **WHEN** the browser bridge handles the operation
- **THEN** it SHALL treat the value as scenario data only
- **AND** it SHALL NOT perform filesystem access

### Requirement: Explicit Unsupported Operations

A browser bridge operation that is not supported by the active scenario SHALL fail explicitly.

#### Scenario: Calling an unsupported operation

- **GIVEN** the active scenario does not support a bridge operation
- **WHEN** Angular invokes that operation
- **THEN** the returned promise SHALL reject with a descriptive browser-harness error
- **AND** the error SHALL identify the active scenario and operation
- **AND** the operation SHALL NOT silently report success

#### Scenario: Calling a supported no-op operation

- **GIVEN** the specification explicitly defines an operation as a safe deterministic no-op
- **WHEN** Angular invokes it
- **THEN** the operation MAY return a typed success result
- **AND** that behavior SHALL be documented in the scenario fixture

### Requirement: Browser Runtime Identification

The application SHALL distinguish a healthy browser-harness runtime from an unavailable desktop backend.

#### Scenario: Rendering harness runtime status

- **GIVEN** the browser bridge is installed successfully
- **WHEN** the shell loads application information and health
- **THEN** runtime status SHALL indicate browser-harness or mock mode
- **AND** it SHALL NOT display the normal unavailable-backend state
- **AND** existing healthy desktop wording SHALL remain unchanged in Electron mode

### Requirement: Harness Indicator

The browser harness SHALL display a browser-only indicator containing the active scenario.

#### Scenario: Showing the indicator

- **GIVEN** browser-harness mode is active
- **AND** the URL does not request hidden harness UI
- **WHEN** the application renders
- **THEN** an indicator SHALL identify browser-harness mode
- **AND** it SHALL show the active scenario identifier
- **AND** it SHALL be visually distinct from production application content

#### Scenario: Hiding the indicator for screenshots

- **GIVEN** browser-harness mode is active
- **AND** the URL contains `harnessUi=hidden`
- **WHEN** the application renders
- **THEN** harness-only visual chrome SHALL be hidden
- **AND** scenario bridge behavior and state seeding SHALL remain active

### Requirement: Initial Scenario Catalog

The browser harness SHALL provide the initial scenarios defined by issue #90.

#### Scenario: Listing supported initial scenarios

- **WHEN** the scenario registry is inspected
- **THEN** it SHALL contain:
  - `empty`
  - `project-loaded`
  - `source-review-ready`
  - `source-review-attention`
  - `generate-ready`
  - `generate-running`
  - `generate-failed`
  - `preview-ready`
- **AND** every identifier SHALL map to one deterministic scenario definition

#### Scenario: Opening the source review ready scenario

- **GIVEN** `source-review-ready` is selected
- **WHEN** `/source-review` renders
- **THEN** a deterministic source and project SHALL be active
- **AND** the selected tracks and mapping state SHALL be ready to continue
- **AND** no real source file SHALL be required

#### Scenario: Opening the source review attention scenario

- **GIVEN** `source-review-attention` is selected
- **WHEN** `/source-review` renders
- **THEN** deterministic mapping or issue data SHALL require user attention
- **AND** the state SHALL remain internally coherent

#### Scenario: Opening generation scenarios

- **GIVEN** one of `generate-ready`, `generate-running`, or `generate-failed` is selected
- **WHEN** `/generate` renders
- **THEN** the generation feature SHALL display the corresponding deterministic state
- **AND** no production generation process SHALL execute

#### Scenario: Opening the preview ready scenario

- **GIVEN** `preview-ready` is selected
- **WHEN** `/preview` renders
- **THEN** deterministic chart preview data SHALL be available
- **AND** the preview SHALL not require generated files on disk

### Requirement: Agent-Friendly Diagnostics

The browser harness SHALL provide sufficient diagnostics for an agent to identify startup and scenario failures.

#### Scenario: Successful startup diagnostics

- **GIVEN** a valid scenario starts successfully
- **WHEN** an agent inspects the browser
- **THEN** the active scenario and runtime mode SHALL be discoverable
- **AND** the browser console SHALL not contain unexpected harness startup errors

#### Scenario: Failed startup diagnostics

- **GIVEN** scenario resolution, bridge installation, or state seeding fails
- **WHEN** startup terminates
- **THEN** a descriptive error SHALL be emitted
- **AND** the failure stage SHALL be identifiable
- **AND** the system SHALL NOT continue with partially initialized scenario state

### Requirement: Automated Harness Verification

The browser harness SHALL include automated tests for its critical contracts.

#### Scenario: Testing scenario resolution

- **WHEN** automated tests run
- **THEN** known scenario identifiers SHALL resolve correctly
- **AND** omitted identifiers SHALL resolve to `empty`
- **AND** unknown identifiers SHALL fail explicitly

#### Scenario: Testing bridge installation

- **WHEN** automated tests install a scenario bridge
- **THEN** the bridge SHALL conform to the existing `window.chdg` contract
- **AND** duplicate installation SHALL fail
- **AND** unsupported operations SHALL reject descriptively

#### Scenario: Testing production isolation

- **WHEN** production renderer tests and builds run
- **THEN** existing Electron behavior SHALL remain green
- **AND** browser-harness bootstrap code SHALL not execute
