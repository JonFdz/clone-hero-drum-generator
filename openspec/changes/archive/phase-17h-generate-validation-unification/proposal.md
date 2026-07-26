# Change: Phase 17H — Generate + Validation Unification

## Why

The desktop app currently exposes both `Generate` and `Validation` as separate user-facing steps. This duplicates readiness information and makes the workflow longer than necessary. Validation is part of the generation decision, so it should live inside Generate.

## What changes

- Keep `/generate` as the canonical Generate route.
- Keep the user-facing name as `Generate`.
- Remove `Validation` from the sidebar.
- Migrate the useful standalone Validation UI into Generate:
  - Validation Report;
  - QA Checklist;
  - fix actions;
  - readiness counters.
- Remove the standalone Validation page/component once migrated.
- Keep `/validation` as a compatibility redirect to `/generate`.
- Add generated-state output actions, including `Open Preview`.
- Autosave successful generation results when possible without causing loops.

## First required task for the implementation agent

Before implementation, transfer this accepted OpenSpec into Engram.

Engram is the project source of truth. OpenSpec is a validation/transfer artifact so Jon can validate the intended work and the implementing agent can understand it. After Engram is aligned, treat Engram as the source of truth.

If any required doc/mockup file is missing, stop and report the missing path. Do not assume or recreate missing files.

## Scope

In scope:

- `/generate` unified screen;
- sidebar cleanup;
- route cleanup/redirect;
- removal of standalone Validation UI code;
- validation report/checklist inside Generate;
- generation config/log/steps/output preview;
- post-generation Preview action;
- autosave after successful generation;
- tests and validation.

Out of scope:

- Report History;
- Copy Report;
- Export Report;
- custom overwrite modal;
- real-time progress IPC;
- cancel generation without real support;
- Generate + Preview unification;
- validation history persistence.

## Mockups

Use these files:

- `docs/desktop/mockups/12-generate-ready.png`
- `docs/desktop/mockups/12a-generate-complete.png`

Known corrections to enforce from discussion:

- Text must be `Validation Report`.
- After generation, use `Regenerate`, not `Start Generate`.
- After generation, bottom action row includes `Open Preview`.
- Do not duplicate `Open Output Folder` both inside Output Files Preview and the bottom action bar.
- Configuration warnings must be attached to the correct row, for example non-zero `Offset`, not `Album`.

## Impact

- Desktop routing and navigation.
- Generate page UI/behavior.
- Validation page removal.
- Validation route fix actions.
- Generation autosave behavior.
- Tests for sidebar/routes/generate validation behavior.
