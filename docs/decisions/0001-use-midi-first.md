# ADR: Use MIDI as the first input format

## Status

Accepted.

## Decision

Use MIDI first because it already contains ticks, note numbers, velocities, channels, tracks and often tempo maps. Human notation and MusicXML can come later.

## Consequences

Positive:

- Keeps scope controlled.
- Keeps agent tasks easier to review.
- Avoids premature UI/runtime complexity.

Negative:

- Some manual validation remains necessary.
- Some future features may require revisiting this decision.
