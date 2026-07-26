# Design: Phase 17H Generate + Validation Unification

## User-facing route/name

- Route: `/generate`
- Sidebar label: `Generate`
- Page title: `Generate`
- `/validation` redirects to `/generate`

The standalone Validation page is removed after its useful content has been migrated.

## Page layout

Desktop layout:

```text
Header: Generate + status pill

Top row:
Validation Report        Generation Configuration

Middle row:
QA Checklist             Generation Steps

Lower row:
Generation Log           Output Files Preview

Bottom:
Back to Source Review    Open Output Folder    Open Preview    Start Generate/Regenerate
```

Before generation, `Open Preview` is disabled or omitted. After generation it is enabled.

## Status model

Status pill should be derived from validation and generation state:

- generating → `Generating…`
- generation result exists → `Generated`
- generation error → `Failed`
- validation errors > 0 → `Cannot generate yet`
- validation warnings > 0 → `Ready with warnings`
- no errors/warnings → `Ready to generate`

## Validation flow

- Run validation on page entry.
- Run validation again immediately before generation.
- Errors block generation.
- Warnings/info do not block generation.

## Generate flow

- User clicks `Start Generate`.
- Validation runs.
- If blocked, do not generate.
- If allowed, call existing generation bridge/service.
- Preserve current overwrite confirmation behavior.
- On success, apply generation result, show output preview, enable preview action, and autosave if possible.

## Autosave flow

After successful generation:

- If `projectFilePath` exists, save updated generation status/result/output files once.
- Autosave must not trigger generation again.
- Autosave must not mark the project as needing regenerate just because generation output metadata was saved.
- If autosave fails, show a non-blocking warning.

## Validation page removal

Implementation should:

- migrate needed Validation UI into Generate;
- remove `ValidationPageComponent` if no longer referenced;
- remove route to Validation component;
- keep route redirect `/validation -> /generate`;
- remove sidebar item;
- update fix actions and links.

## Generation Steps

Use simple states for this phase:

- pending before generation;
- running while generation is active;
- completed after success;
- failed after error.

Do not implement real per-step backend progress IPC in this phase.

## Output Files Preview

Before generation:

- empty state;
- mention expected files.

After generation:

- list `notes.chart`, `song.ini`, `song.ogg`;
- show metrics: Hits, Mapped, Deduped, Tracks;
- actions should primarily live in bottom action bar.

## QA Checklist

- Shows validation items grouped/sorted by severity.
- Category appears as a badge.
- Fix action appears when available.
- Uses internal scroll when many items exist.
- Collapses/compacts when all checks pass.
