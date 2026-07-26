# ADR 0009: Preserve Musical Piece and Clone Hero Target Separately

## Status

Accepted.

## Context

Current overrides replace `DrumHit.piece`, then a fixed table chooses the lane. “Ride → Green Cymbal” would falsely turn Ride into Crash.

## Decision

Persist:

1. source interpretation/effective musical piece;
2. source-specific Clone Hero target.

Unknown flow selects piece first, proposes standard target, then permits target customization.

## Consequences

Musical provenance remains correct, Clone Hero placement stays flexible, mapping UI remains understandable, and domain validation becomes richer.
