# Future Work: GPIF Generation Refinement

## Status

Deferred until after Phase 08.

## Context

Phase 08 connects GPIF normalization to the existing generation pipeline.

After that, generated `.gp` charts should be compared against the existing MIDI baseline and manually validated in Moonscraper.

## Future questions

- Do GPIF ticks align exactly with the MIDI baseline for the same local demo?
- Are GPIF open hi-hats, cymbals and dynamics encoded as expected after chart generation?
- Are sections/markers from GPIF good enough to import into `SongSection[]`?
- Are repeat/alternate-ending structures common in downloaded `.gp` files?
- Do we need manual offset support before desktop?
- Should side-stick become a dedicated internal articulation instead of snare + warning?

## Likely follow-up phases

```txt
Phase 09 — Metadata and Offset Controls
Phase 10 — Desktop App Shell
Phase 11 — Desktop Full Song Package Flow
```
