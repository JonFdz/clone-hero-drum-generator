# Simplified V1 Browser Harness Scenarios

## Principles

- deterministic synthetic data;
- direct route and reload;
- no copyrighted or real local project assets;
- fixture bridge matches public desktop contract;
- `harnessUi=hidden` for capture;
- scenario state does not redefine product behavior.

## Scenarios

Home/Projects/Settings:

- `home-empty`
- `home-recent`
- `projects-list`
- `settings-ready`

Create Details:

- `create-details-empty`
- `create-details-filled`
- `create-details-invalid`

Track & Mapping:

- `create-mapping-default`
- `create-mapping-attention`
- `create-mapping-multiple-tracks`
- `create-mapping-no-detected-track`

Creating:

- `create-progress`
- `create-failed-source`
- `create-failed-audio`
- `create-failed-write`

Editor Preview:

- `editor-loading`
- `editor-ready`
- `editor-note-selected`
- `editor-edit-note`
- `editor-note-modified`
- `editor-duration-warning`
- `editor-audio-missing`
- `editor-save-failed`
- `editor-project-details`

Mappings:

- `mappings-default`
- `mappings-modified`
- `mappings-attention`
- `mappings-reset-confirmation`

Export:

- `export-first-confirmation`
- `export-progress`
- `export-success`
- `export-partial-update-success`
- `export-conflict`
- `export-failed`

## Viewports

- 1440×900
- 1024×768

## Per-scenario validation

1. open direct URL;
2. verify route/state;
3. reload;
4. inspect console;
5. hide harness controls;
6. inspect focus order;
7. capture when required;
8. record limitations.
