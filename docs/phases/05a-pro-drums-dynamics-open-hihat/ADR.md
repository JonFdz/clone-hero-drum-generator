# ADR Phase 05A: Pro Drums Dynamics and Open Hi-Hat Encoding

## Status

Implemented for Phase 05A.

## Context

Phase 05 implemented cymbal modifiers:

```txt
yellow cymbal -> N 66
blue cymbal   -> N 67
green cymbal  -> N 68
```

Further investigation of Moonscraper confirms `.chart` support for Pro Drums accent and ghost flags:

```txt
accent offset = 33
ghost offset  = 39
```

A real chart known to distinguish open hi-hat uses yellow cymbal plus yellow accent patterns.

No separate `.chart` flag was found for open hi-hat.

## Decision

Implement Phase 05A as a small focused phase.

CHDG will emit supported Pro Drums accent/ghost flags and use this documented convention:

```txt
hihat_closed -> yellow cymbal
hihat_open   -> yellow cymbal + yellow accent
```

CHDG will not invent any separate open hi-hat chart flag.

CHDG will not emit kick ghost/accent flags until they are explicitly verified.

## Rationale

This matches observed charting practice and Moonscraper-supported chart primitives while keeping internal semantics clear.

Open hi-hat is not musically identical to accent, but in `.chart` output yellow accent is the practical available representation for open hi-hat distinction.

## Consequences

Positive:

- Better fidelity for real drum charts.
- Open and closed hi-hat become distinguishable in Moonscraper/Clone Hero-style output.
- Velocity-based ghost/accent behavior becomes visible in the generated chart.
- The implementation remains small and testable.

Negative:

- Open hi-hat uses an accent flag as a convention.
- Low-velocity open hi-hats may still need accent encoding to remain visually/gameplay-distinct from closed hi-hats.
- More nuanced hi-hat states remain out of scope.
