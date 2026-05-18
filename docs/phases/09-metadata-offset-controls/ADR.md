# ADR Phase 09: Metadata and Offset Controls

## Status

Proposed.

## Context

CHDG can now generate full song folders from both MIDI and GPIF inputs.

The generated package currently uses defaults for metadata and has no explicit manual offset controls. Local validation showed that at least one demo required manual start/offset adjustment in Moonscraper.

Metadata and offset controls should be added before desktop, because the desktop UI will need to expose these inputs.

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

Metadata should flow into `song.ini`.

Offset behavior must be Clone Hero-compatible and explicitly documented in implementation docs and PR summary.

## Offset decision to confirm during implementation

There are two possible implementation approaches:

1. Write a supported `song.ini` offset field if Clone Hero expects it there.
2. Shift generated chart event/note ticks by the offset converted from milliseconds to ticks using the tempo map.

The implementation should choose the safer Clone Hero-compatible option and document it.

If using chart tick shifting:

- positive offset should be clearly defined;
- negative offset should be handled safely;
- no notes/events should become invalid negative ticks;
- tempo map conversion must be deterministic.

If using `song.ini` offset:

- confirm the field name and units;
- preserve notes/chart timing unchanged;
- add tests for `song.ini`.

## Rationale

Metadata and manual offset are user-facing package-quality controls.

Adding them to the CLI first gives the future desktop app a stable backend workflow to call.

## Consequences

Positive:

- Generated packages look more complete.
- User can avoid some manual Moonscraper metadata edits.
- User can record known audio/chart alignment adjustments.
- Desktop can reuse the same command/API later.

Negative:

- Offset semantics can be confusing if not documented precisely.
- If chart tick shifting is used, tempo/tick conversion needs careful tests.
- If song.ini offset is used, compatibility depends on the exact Clone Hero field behavior.
