# Change Proposal — Phase 17I GPIF Timeline Tempo Map

## Summary

Fix GPIF/Guitar Pro timing drift by preserving tempo map events, section positions, and time signature timing when generating Clone Hero `.chart` files.

The reproduced issue is that a GPIF source with tempo automations at bar 0 and bar 48 generates a chart with only the bar 0 tempo. The chart therefore drifts after the missing tempo change.

## Motivation

CHDG must produce rhythmically correct charts. Missing tempo changes are a critical correctness bug because the output can start synchronized and then progressively drift. This makes the generated chart unusable for real play.

## Scope

- Parse GPIF tempo automations with bar/position.
- Convert GPIF bar/position into chart ticks.
- Emit all tempo events into normalized `TempoEvent[]`.
- Preserve GPIF time signature changes when available.
- Place GPIF sections/markers at correct ticks when timing context is available.
- Add regression tests using a GPIF fixture with a tempo change after the start.

## Out of scope

- Audio tempo detection.
- Manual tempo editor.
- Offset changes.
- UI redesign.
- Preview sync tools.
- Any source-specific hardcoded fix for Decode only.

## Process requirements

- First implementation task: transfer the accepted OpenSpec into Engram.
- Engram is the project source of truth.
- If any required file is missing, stop and report the missing file.
- If GPIF structures are ambiguous, ask Jon before guessing.
- Do not perform final review; final review is external.
