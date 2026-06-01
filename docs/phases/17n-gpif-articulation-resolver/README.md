# Phase 17N — GPIF Articulation Resolver

## Status

Proposed for implementation after Phase 17M.

## Summary

Phase 17N improves CHDG's Guitar Pro / GPIF drum interpretation by resolving GPIF articulations using their own metadata instead of relying only on raw MIDI input numbers.

Phase 17L introduced the MIDI Drum Note Atlas and mapping coverage model. Phase 17M made the Mapping Review UI actionable. Phase 17N now connects GPIF articulation metadata into that system so that cases such as:

```text
InputMidiNumbers: [92]
Name: Hi-Hat (half)
OutputMidiNumber: 46
```

resolve correctly as:

```text
hihat_open
```

instead of appearing as an unknown MIDI 92.

## Problem

GPIF can use internal or instrument-specific input MIDI numbers that do not correspond directly to General MIDI percussion notes.

The source may contain enough information to resolve the articulation correctly through fields such as:

- `Name`
- `InputMidiNumbers`
- `OutputMidiNumber`
- instrument/element metadata
- track/drumkit context

If CHDG treats `InputMidiNumbers` as the primary source of truth, valid GPIF articulations may be reported as unknown even though `OutputMidiNumber` or the articulation name clearly describes the playable drum sound.

## Goals

- Resolve GPIF drum articulations using the best available GPIF metadata.
- Prioritize `OutputMidiNumber` over raw `InputMidiNumbers`.
- Use the 17L MIDI atlas for `OutputMidiNumber` decisions.
- Use controlled name-pattern fallback only when output MIDI is unavailable or insufficient.
- Preserve 17L semantics: `map` creates hits, `candidate` does not create hits by default, `ignore` does not create hits, and `unknown` remains visible and non-blocking.
- Preserve 17M Mapping Review behavior.
- Expose meaningful Source Review rows for GPIF articulations.
- Add robust tests for hi-hat half, rimshot, ride bell, china, splash, auxiliary percussion, unknown, and conflict cases.

## Non-goals

- No new Clone Hero lanes.
- No automatic candidate mapping by default.
- No aggressive profile.
- No Preview changes.
- No tempo-map review or override.
- No Generate screen redesign.
- No full Source Review UI redesign.
- No section editor.
- No manual global mapping profile redesign.
- No attempt to resolve every arbitrary text string aggressively.

## Key design rule

```text
OutputMidiNumber > Name pattern > InputMidiNumbers
```

`InputMidiNumbers` should only be used as fallback evidence. It must not override a valid `OutputMidiNumber`.

## Required user-visible outcome

The Decode-like case must be fixed:

```text
InputMidiNumbers: [92]
Name: Hi-Hat (half)
OutputMidiNumber: 46
```

Expected:

```text
sourceKind: gpif
action: map
automaticPiece: hihat_open
resolvedVia: output-midi-number
confidence: high
```

Source Review should show this as a resolved GPIF articulation, not as unknown MIDI 92.
