# OpenSpec Proposal — Phase 17N — GPIF Articulation Resolver

## Summary

Implement a GPIF Articulation Resolver that maps Guitar Pro / GPIF drum articulations using GPIF metadata rather than relying only on raw input MIDI numbers.

The resolver must prioritize `OutputMidiNumber` through the Phase 17L MIDI Drum Note Atlas, then controlled `Name` patterns, then `InputMidiNumbers` as fallback evidence.

## Motivation

GPIF can represent drum articulations with internal input MIDI numbers that are not General MIDI percussion notes. A known real case is:

```text
InputMidiNumbers: [92]
Name: Hi-Hat (half)
OutputMidiNumber: 46
```

This should map to `hihat_open`, but can be treated as unknown if CHDG uses the input MIDI number directly.

## Scope

- Add GPIF articulation resolver.
- Use `OutputMidiNumber` with 17L atlas.
- Use controlled name-pattern fallback.
- Use input MIDI fallback only when needed.
- Add conflict handling.
- Emit enriched Source Review mapping rows.
- Preserve existing 17L/17M semantics.
- Add tests.

## Out of scope

- No Preview changes.
- No Generate screen redesign.
- No tempo-map review/override.
- No automatic candidate generation.
- No aggressive profile.
- No new lanes.
- No broad UI polish.
