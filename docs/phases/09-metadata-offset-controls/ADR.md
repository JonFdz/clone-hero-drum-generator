# ADR Phase 09: Metadata and Offset Controls

## Status

Implemented.

## Context

CHDG can now generate full song folders from both MIDI and GPIF inputs.

The generated package currently uses defaults for metadata and has no explicit manual offset controls. Local validation showed that at least one demo required manual start/offset adjustment in Moonscraper.

For Eat My Dust, the useful adjustment was 900 ms, which corresponds to:

```chart
Offset = 0.9
```

in the generated `.chart`.

## Decision

Extend the existing `generate` command with metadata options and a manual offset option.

Recommended options:

```txt
--name
--artist
--album
--year
--genre
--charter
--offset-ms
```

Metadata flows into `song.ini`.

Offset is written to the `.chart` `[Song]` `Offset` field.

`--offset-ms` uses milliseconds at the CLI boundary and is converted to seconds for `.chart` output.

Examples:

```txt
--offset-ms 900  -> Offset = 0.9
--offset-ms 1200 -> Offset = 1.2
--offset-ms -250 -> Offset = -0.25
```

The implementation must not shift chart notes/events for offset in this phase.

Implementation notes:

- `--offset-ms` uses milliseconds at the CLI boundary.
- `notes.chart` `Offset` uses seconds.
- Offset is written to the chart `[Song]` `Offset` field.
- Note/event ticks are not shifted.
- No automatic offset detection or desktop UI is included in this phase.

## Rationale

Metadata and manual offset are user-facing package-quality controls.

Writing the offset to `.chart` matches the manual Moonscraper/Clone Hero convention observed during validation and avoids destructive note tick rewriting.

Using milliseconds in the CLI is more user-friendly and precise, while the `.chart` format stores seconds.

## Consequences

Positive:

- Generated packages look more complete.
- User can avoid some manual Moonscraper metadata edits.
- User can encode known audio/chart alignment adjustments.
- Desktop can reuse the same command/API later.
- Offset does not mutate note/event timing.

Negative:

- The CLI unit and chart unit differ, so conversion must be tested.
- The sign convention follows the `.chart` offset field and must be documented clearly.
