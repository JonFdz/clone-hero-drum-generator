# PRD — Phase 17H Generate + Validation Unification

## Problem

The current desktop flow exposes both `Generate` and `Validation` as separate navigation steps. This creates unnecessary user friction because validation is not a separate destination in the user's mental model; it is part of deciding whether the project is ready to generate.

The current `Generate` page already performs preflight validation, while `Validation` provides a fuller checklist. This duplication should be consolidated into a single Generate screen.

## Goals

1. Make `/generate` the only user-facing place for readiness validation and generation.
2. Remove the `Validation` sidebar step and standalone page UI.
3. Keep validation automatic and visible, without making it feel like a separate workflow.
4. Let the user generate when there are warnings but no blocking errors.
5. After generation, clearly show output files and allow opening Preview.
6. Preserve the CHDG dark desktop visual style and match the approved mockups.

## Non-goals

- Do not build validation history.
- Do not add report export/copy actions.
- Do not implement real-time generation progress via backend IPC in this phase.
- Do not implement cancel generation unless already supported end-to-end.
- Do not unify Preview into Generate.

## Primary user flow

### Ready state

1. User opens `/generate`.
2. The app runs validation automatically.
3. Validation Report shows readiness.
4. QA Checklist shows warnings/info/errors.
5. Generation Configuration shows all inputs needed for generation.
6. If there are no blocking errors, `Start Generate` is enabled.

### Blocked state

1. User opens `/generate`.
2. Validation runs automatically.
3. Blocking errors are shown in Validation Report and QA Checklist.
4. `Start Generate` is disabled.
5. Fix actions route the user to Project Details, Source Review, or Settings.

### Generate action

1. User clicks `Start Generate`.
2. The app runs validation again.
3. If errors exist, generation does not start.
4. If only warnings/info exist, generation starts.
5. Existing overwrite confirmation behavior is preserved.

### Complete state

1. Generation succeeds.
2. Generate status becomes `Generated`.
3. Generation Steps show completed state.
4. Generation Log shows actions taken.
5. Output Files Preview shows generated files and metrics.
6. Actions include `Open Output Folder`, `Open Preview`, and `Regenerate`.
7. If a project file exists, generation result is autosaved once.

## UX rules

- `Generate` remains the sidebar label and page title.
- Do not show `Validation` as a separate sidebar item.
- Do not show `Open full validation checklist` because the checklist is now embedded.
- `Validation Report` should describe readiness before generation, not imply a final package validation before output exists.
- Warnings do not block generation.
- Errors block generation.
- `Open Preview` is enabled only after successful generation.
- `Open Output Folder` may be available if `outputDir` exists, but the primary output action after generation should remain visible.
- Generation Log should be compact and have internal scrolling.
- QA Checklist should be compact when everything is OK and expanded/useful when there are errors or warnings.

## Visual references

### `12-generate-ready.png`

Represents the pre-generation ready state. It includes:

- Generate header;
- readiness status pill;
- Validation Report;
- Generation Configuration;
- QA Checklist;
- pending Generation Steps;
- compact empty Generation Log;
- empty Output Files Preview;
- bottom actions.

Known annotations to enforce in implementation:

- Text must be `Validation Report`.
- Avoid duplicate major actions inside Output Files Preview and the bottom action bar.
- If warning is shown for offset, the warning belongs on `Offset`, not unrelated metadata.

### `12a-generate-complete.png`

Represents the generated state. It includes:

- Generate status `Generated`;
- completed Generation Steps;
- populated Generation Log;
- Output Files Preview listing `notes.chart`, `song.ini`, and `song.ogg`;
- output metrics;
- output/preview actions.

Known annotations to enforce in implementation:

- After successful generation, use `Regenerate`, not `Start Generate`, as the generation action label.
- Bottom action row should include `Open Preview` after successful generation.
- Avoid duplicating `Open Output Folder` in both Output Files Preview and bottom action bar.

## Acceptance criteria

- `/generate` contains integrated validation report and QA checklist.
- `/validation` no longer has a standalone component; it redirects to `/generate`.
- Sidebar contains `Generate` but not `Validation`.
- Validation runs on page entry and before generation.
- Errors disable generation; warnings do not.
- Output files and Preview action appear after successful generation.
- Existing generate behavior and overwrite confirmation remain functional.
- Autosave after successful generation does not create validation/regeneration loops.
- UI matches mockups closely enough for manual visual review.
