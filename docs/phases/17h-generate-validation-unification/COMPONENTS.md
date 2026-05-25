# Components — Phase 17H Generate

## `GeneratePageComponent`

Container for the unified Generate screen.

Responsibilities:

- Run validation on page entry.
- Run validation before generation.
- Block generation on errors.
- Allow generation with warnings/info.
- Trigger generation through existing bridge/service.
- Show generation result, log, and output files.
- Autosave generation result when possible.
- Route to Source Review, Project Details, Settings, Output Folder, or Preview as needed.

The component can remain named `GeneratePageComponent`.

## Generate Header

Location: top of `/generate`.

Content:

- Title: `Generate`.
- Subtitle: `Validate project readiness and create the Clone Hero package.`
- Right status pill.

Status labels:

- `Ready to generate`
- `Ready with warnings`
- `Cannot generate yet`
- `Generating…`
- `Generated`
- `Failed`

Rules:

- `state.status === "generating"` → `Generating…`
- generation result exists → `Generated`
- error message exists / generation failed → `Failed`
- validation errors > 0 → `Cannot generate yet`
- validation warnings > 0 → `Ready with warnings`
- no errors/warnings → `Ready to generate`

## Validation Report Card

Location: top row, left.

Purpose: show readiness summary.

Content:

- Heading: `Validation Report`
- Readiness status:
  - `Ready to generate`
  - `Ready with warnings`
  - `Cannot generate yet`
  - `Generated` after successful generation, if useful
- Counters:
  - Errors
  - Warnings
  - Info
- Last checked timestamp
- Validator label/version if available

Rules:

- Do not imply final output validation before generation exists.
- Warnings do not block.
- Errors block.

## Generation Configuration Card

Location: top row, right.

Purpose: show generation inputs and readiness.

Rows:

- Source File
- Audio File
- Selected Tracks
- Output Folder
- Song
- Artist
- Album
- Offset

Each row should show:

- icon
- label
- value
- status indicator: ok / warning / missing

Fix action routing:

- Source/tracks/mapping → `/source-review`
- Audio/output/metadata/offset → `/projects/details`
- FFmpeg/settings → `/settings`

Offset warning:

- If offset is non-zero and warning-worthy, the warning belongs on `Offset`.
- Do not attach offset warnings to unrelated fields such as Album.

## QA Checklist Card

Location: middle left.

Purpose: detailed validation items.

Default behavior:

- If errors or warnings exist, visible/open.
- If everything is OK, compact/collapsed with `All checks passed`.

Controls:

- `All`
- `Errors`
- `Warnings`
- `Info`

Row content:

- status icon
- check title
- category badge
- message
- fix action when available

Rows should be ordered by severity:

1. Errors
2. Warnings
3. Info

Checklist should have internal scrolling if there are many items.

## Generation Steps Card

Location: middle right.

Purpose: show high-level generation flow without implementing real progress IPC.

Steps:

1. Parse Source
2. Normalize Drums
3. Merge Selected Tracks
4. Write notes.chart
5. Write song.ini
6. Convert Audio to song.ogg
7. Finalize Package

States:

- `Pending` before generation
- `Running` while generation is active
- `Completed` after generation succeeds
- `Failed` if generation fails

This phase does not require real per-step backend progress events.

## Generation Log Card

Location: lower left.

Purpose: compact generation log.

Behavior:

- Low visual prominence before generation.
- Empty state: `No generation actions yet.`
- Shows generation logs after generation starts.
- Internal scrolling; should not dominate the page.
- `Clear Log` optional if already supported or trivial.

Do not mix QA checklist messages into Generation Log.

## Output Files Preview Card

Location: lower right.

Visible before generation as empty preview; populated after success.

Empty state:

- `No output files yet`
- `Run generation to create notes.chart, song.ini, and song.ogg.`

Generated state rows:

- `notes.chart`
- `song.ini`
- `song.ogg`

For each file:

- filename
- timestamp if available
- size if available
- success indicator

Metrics:

- Hits
- Mapped
- Deduped
- Tracks

Actions:

- Prefer keeping major actions in the bottom action bar.
- Avoid duplicating `Open Output Folder` in both card and action bar.

## Generate Actions Bar

Location: bottom.

Ready state:

- `Back to Source Review`
- `Open Output Folder` if output folder exists
- `Start Generate`

Blocked state:

- `Back to Source Review`
- `Start Generate` disabled
- Fix actions live in QA/Configuration cards

Generated state:

- `Back to Source Review`
- `Open Output Folder`
- `Open Preview`
- `Regenerate`

Rules:

- `Open Preview` only enabled after successful generation.
- `Regenerate` replaces `Start Generate` after successful generation.
- Existing overwrite confirmation behavior remains unchanged.
