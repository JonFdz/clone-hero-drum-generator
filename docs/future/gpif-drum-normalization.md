# Future Work: GPIF Drum Normalization

## Status

Deferred until after Phase 06 GPIF inspection.

## Context

Phase 06 is intentionally inspection-only.

After real `.gp`/GPIF files can be inspected deterministically, CHDG can define a GPIF normalization phase:

```txt
GPIF drum track
  -> DrumHit[]
```

## Future questions

- How are GPIF drum tracks identified reliably?
- How are percussion articulations represented?
- How are voices, measures, repeats and durations represented?
- How should GPIF sections/markers map to `SongSection[]`?
- How should GPIF dynamics map to accent/ghost?
- How should open hi-hat, closed hi-hat, ride bell, splash, china and side-stick be represented?
- How should repeats and alternate endings be expanded?

## Non-goals for Phase 06

- No mapping to `DrumHit[]`.
- No chart generation.
- No audio packaging.
- No desktop UI.
