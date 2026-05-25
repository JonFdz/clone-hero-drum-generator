# Phase 17H — Generate + Validation Unification

## Summary

Unify the standalone `Generate` and `Validation` desktop steps into a single user-facing `Generate` screen.

The user should no longer navigate to a separate Validation page. Validation becomes an integrated readiness/report area inside Generate. The resulting flow is:

```text
Source Review → Generate → Preview
```

## User-facing decisions

- Keep the screen name as **Generate**.
- Keep `/generate` as the canonical route.
- Remove `Validation` from the sidebar.
- Remove the standalone Validation page/component once its useful UI and behavior have been migrated into Generate.
- Keep a compatibility redirect from `/validation` to `/generate`, but do not keep unused Validation UI code.
- Run validation automatically when entering Generate and again immediately before generation starts.
- Errors block generation.
- Warnings and info do not block generation.
- After successful generation, stay on Generate and show actions for output folder and Preview.
- The primary action remains **Start Generate** before generation.
- After successful generation, the primary generation action should become **Regenerate**.

## Mockups

Reference mockups for this phase:

- `docs/desktop/mockups/12-generate-ready.png`
- `docs/desktop/mockups/12a-generate-complete.png`

Implementation should match the established CHDG desktop visual style:

- dark background with subtle purple radial glow;
- persistent left sidebar;
- elevated dark cards with subtle borders;
- purple primary actions;
- green success status pills;
- yellow warning badges;
- compact, dense tables;
- no visual regression from the existing Source Review style.

## Existing source references

At the time this phase was planned:

- `GeneratePageComponent` already contains some validation preflight UI, generation configuration, static generation steps, output files preview, generation log, and generate action.
- `ValidationPageComponent` contains the richer standalone readiness/checklist UI that should be moved into Generate and then removed.
- `DesktopValidationService` should remain the source of validation logic.
- Validation UI should be consolidated into Generate, not duplicated.

## In scope

- Redesign `/generate` to include:
  - Generate header and status pill;
  - Validation Report;
  - Generation Configuration;
  - QA Checklist;
  - Generation Steps;
  - Generation Log;
  - Output Files Preview;
  - unified bottom actions.
- Remove Validation from sidebar navigation.
- Remove the standalone Validation page/component after migration.
- Redirect `/validation` to `/generate` for compatibility.
- Update links and fix actions that point to `/validation` or obsolete Generate/Validation routes.
- Add post-generation `Open Preview` action.
- Autosave generation results when possible, without causing regenerate/validation loops.
- Preserve overwrite confirmation behavior for now.

## Out of scope

- Report History.
- Copy Report.
- Export Report.
- Cancel generation unless real backend support already exists.
- Real-time structured generation progress events via IPC.
- Custom overwrite modal.
- Generate + Preview unification.
- Historical validation persistence.
- Output editor.
