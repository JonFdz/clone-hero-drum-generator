# ADR — GPIF Articulation Resolver

## Status

Proposed.

## Context

Phase 17L introduced a MIDI Drum Note Atlas that classifies notes into `map`, `candidate`, `ignore`, and `unknown`. Phase 17M made mapping coverage visible and actionable in Source Review.

GPIF / Guitar Pro drum articulations contain richer metadata than raw MIDI note numbers. Using `InputMidiNumbers` as the primary mapping signal is unsafe because these numbers can be internal or non-GM. `OutputMidiNumber` and articulation `Name` can provide the actual playable drum meaning.

## Decision

Introduce a GPIF Articulation Resolver.

The resolver will use this priority order:

```text
1. Project override
2. OutputMidiNumber via MIDI Drum Note Atlas
3. Controlled name-pattern resolver
4. InputMidiNumbers via MIDI Drum Note Atlas as fallback evidence
5. Unknown
```

The resolver will emit mapping results compatible with the 17L/17M mapping coverage model.

## Rationale

### Why prioritize OutputMidiNumber?

`OutputMidiNumber` represents the MIDI note that GPIF expects for the articulation. If it maps to General MIDI percussion, it is a stronger signal than internal input MIDI numbers.

### Why not use InputMidiNumbers first?

The Decode case showed that `InputMidiNumbers: [92]` can be valid GPIF-internal input while `OutputMidiNumber: 46` correctly means Open Hi-Hat.

### Why controlled name patterns?

Some GPIF articulations may not provide output MIDI, or output MIDI may be missing/corrupt. Names such as `Rimshot`, `Hi-Hat (half)`, `Ride Bell`, `China`, or `Splash` are meaningful. But generic names like `Bell`, `Click`, `Cymbal`, or `Effect` are ambiguous and should not be resolved aggressively.

### Why conflict handling?

If name and output point to different CHDG pieces, silent mapping may create wrong charts. Conflicts should become review candidates or unknowns with reasons.

## Consequences

Positive: fewer false unknowns, correct half-open hi-hat, more trustworthy Mapping Review, reuse of 17L atlas.

Tradeoffs: resolver complexity increases; some ambiguous articulations remain candidates/unknown; future GPIF profiles may still be needed.

## Compatibility

The resolver must preserve MIDI source behavior, project mapping overrides, candidate non-generation default, ignored-known non-warning semantics, and existing Source Review UI concepts.

## Future work

- GPIF-specific articulation profiles.
- More instrument/drumkit-aware mapping.
- Better UI display of `inputMidiNumbers` and `outputMidiNumber`.
- User-configurable GPIF articulation overrides.
