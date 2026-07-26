# Change Proposal — Phase 17L: MIDI Drum Note Atlas and Mapping Coverage

## Status

Proposed for user validation.

## Summary

Introduce a rich MIDI drum note atlas and mapping coverage model. Replace the current flat note-to-piece mapping with explicit actions (`map`, `candidate`, `ignore`, `unknown`), confidence, family, source, and reason metadata. Persist coverage summary in `.chdg` and show minimal mapping coverage in Source Review.

## Motivation

The current MIDI drum mapping is too small and too binary. Many known percussion notes become unknown, while some plausible notes should not be auto-charted. Phase 17L makes CHDG's mapping decisions transparent and conservative.

## Scope

- Rich atlas for GM 35–81 plus extended 27–34 / 82–87.
- Atlas version `0.1.0`.
- Candidate notes do not generate by default.
- Ignored known percussion is visible but low-noise.
- Unknown notes remain visible and non-blocking.
- `44 Pedal Hi-Hat` is `candidate -> hihat_closed`.
- Coverage summary in normalization preview and `.chdg`.
- Minimal Source Review coverage display.

## Out of scope

- Full Mapping Review redesign.
- GPIF articulation metadata implementation.
- Aggressive candidate automapping profiles.
- Tempo map override/editor.
- Preview changes.
- Generate/Validate layout changes.

## Key product decisions

1. `candidate` does not generate notes by default.
2. This candidate rule is a stable base behavior, not a temporary compromise.
3. A future aggressive profile may auto-map candidates, but that is out of scope.
4. `44 Pedal Hi-Hat` is candidate because foot hi-hat/chick is not always a playable hand note.
5. No backwards compatibility with the old flat JSON format is required because the app is still in development.
