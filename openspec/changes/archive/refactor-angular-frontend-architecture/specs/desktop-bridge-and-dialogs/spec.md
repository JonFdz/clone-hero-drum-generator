# Desktop Bridge and Dialogs Specification

## ADDED Requirements

### Requirement: Single Angular desktop boundary

`DesktopBridgeService` SHALL remain the sole Angular boundary to Electron/preload APIs.

#### Scenario: A feature needs a native file operation

- **WHEN** a feature needs to open a picker, save a project, read mapping profiles, or invoke another desktop operation
- **THEN** a feature/application service calls `DesktopBridgeService`
- **AND** no page or presentation component imports `DesktopBridgeService`
- **AND** no Angular feature accesses the preload API directly through `window`

### Requirement: Angular-managed confirmations and prompts

The Angular renderer SHALL NOT use `window.confirm` or `window.prompt`.

#### Scenario: The user must confirm overwrite

- **WHEN** generation requires overwrite confirmation
- **THEN** the user is shown an accessible Angular confirmation dialog
- **AND** cancellation and confirmation produce typed UI outcomes

#### Scenario: The user edits mapping-profile metadata

- **WHEN** the user edits mapping-profile name or description
- **THEN** the user is shown an Angular dialog/form
- **AND** input validation and cancellation are handled by Angular UI state
