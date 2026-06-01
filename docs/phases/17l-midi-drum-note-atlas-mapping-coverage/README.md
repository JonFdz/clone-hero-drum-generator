# Phase 17L — MIDI Drum Note Atlas and Mapping Coverage

## Status

Accepted for validation package generation.

## Summary

Phase 17L introduces a richer MIDI drum note atlas and mapping coverage model so CHDG can distinguish between:

- notes that are safe to auto-map;
- notes that are plausible but need user review (`candidate`);
- known auxiliary percussion that should be ignored without noisy warnings;
- real unknown notes that should remain visible to the user.

This phase is intentionally focused on backend/model behavior plus minimal Source Review visibility. The full Mapping Review redesign is deferred to Phase 17M.

## Why this matters

The current mapping is a small `note -> DrumPiece` JSON. Any note outside that small set can be treated as `unknown`, even when it is a known General MIDI / GM2 percussion sound. That means CHDG may skip useful notes, create confusing warnings, or fail to explain why percussion was ignored.

Phase 17L makes mapping decisions explicit and inspectable.

## Key decisions

- Candidate notes do **not** generate playable notes by default.
- Candidate notes are visible in Source Review and can be mapped via overrides.
- Known ignored percussion is visible in summary/detail, but is not a strong warning.
- Unknown and unresolved candidate notes do not block Generate.
- `44 Pedal Hi-Hat` becomes `candidate -> hihat_closed`, not an automatic mapping.
- The new atlas version starts at `0.1.0` because the app is still in development.
- No backwards compatibility with the old flat JSON format is required.
- Advanced GPIF articulation metadata is out of scope, but the model should not block a future GPIF phase.

## Phase boundaries

### In scope

- Replace the flat General MIDI mapping with a rich atlas.
- Add mapping actions: `map`, `candidate`, `ignore`, `unknown`.
- Add confidence and reason metadata.
- Expand atlas coverage to General MIDI 35–81 plus GM2/GS-style 27–34 and 82–87.
- Update MIDI normalization to respect atlas actions.
- Add mapping coverage summary to `NormalizationPreview`.
- Persist mapping coverage summary in `.chdg` analysis.
- Invalidate analysis cache when mapping atlas version changes.
- Add minimal Source Review visibility for mapping coverage.
- Add tests for safe mappings, candidates, ignored percussion, unknown notes, and cache/version behavior.

### Out of scope

- Full Mapping Review redesign with filters and advanced table UX.
- Advanced GPIF articulation metadata extraction.
- GPIF InputMidiNumbers / OutputMidiNumber mapping, except for future-ready model fields if useful.
- Aggressive profile that automaps candidates.
- Manual mapping editor redesign.
- Tempo map review/override.
- Preview changes.
- Generate/Validate layout changes.
- Section editor or section overrides.

## Follow-up phases

- Phase 17M — Source Review Mapping Coverage UI redesign.
- Phase 17N — GPIF Articulation Mapping.
- Phase 17O — Tempo Map Review / Override.
