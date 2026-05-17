# Future Work: GPIF Sections

## Status

Deferred to GPIF inspection/import phases.

## Context

MIDI often lacks useful semantic sections or may only include generated measure markers.

Guitar Pro / GPIF may contain richer arrangement information, potentially including:

```txt
sections
markers
master bar labels
rehearsal marks
directions
```

Exact XML structures should be verified against real `.gp` files during GPIF inspection.

## Desired future behavior

When GPIF contains arrangement sections, CHDG should import them into the shared model:

```ts
SongSection[]
```

and generated `.chart` output should write them as:

```chart
tick = E "section Name"
```

## Non-goals for Phase 05B

- Do not implement GPIF section import.
- Do not assume GPIF element names without inspecting real files.
