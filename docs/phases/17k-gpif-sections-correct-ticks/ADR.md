# ADR — Use GPIF timeline for section/marker ticks

## Context

Phase 17I introduced a GPIF timeline fix so tempo events and note placement could preserve real bar/tick positions. However, section export still emits all discovered sections at tick `0`.

## Decision

Use the GPIF timeline as the source of truth for section/marker tick positions.

Section extraction must derive chart ticks from GPIF bar/measure positions instead of defaulting to `0` when raw section nodes do not contain a direct `tick` field.

## Consequences

### Positive

- Generated charts have useful section navigation.
- Decode-like charts export readable `[Events]` blocks.
- Timeline behavior becomes more consistent across tempo, notes, time signatures, and sections.

### Negative / risk

- GPIF marker structures may vary between Guitar Pro versions.
- Some fixtures may be synthetic and not representative enough.
- If a marker lacks a reliable bar/measure reference, CHDG must not invent an incorrect tick.

## Fallback rule

If a section position cannot be determined safely:

- keep behavior conservative;
- do not crash generation;
- optionally emit a warning/issue if the existing issue model supports it;
- avoid placing every unknown section at `0` unless the section is genuinely at the beginning.
