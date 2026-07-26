# Change Proposal — Phase 17K.1 Preview Section Navigation

## Summary

Add section awareness and section navigation to Preview by parsing `[Events]` section markers from generated `notes.chart`.

## Motivation

Phase 17K fixes GPIF section export so generated charts have useful section markers. Preview should now use those generated markers to help the user validate charts and jump between song parts.

## Scope

- Parse generated chart section events.
- Add section events to Preview chart data.
- Show current section in Preview when sections exist.
- Allow previous/next/dropdown section navigation.
- Respect preview offset.
- Preserve play/pause state.

## Out of scope

- Manual section editing.
- Section overrides in `.chdg`.
- Generation changes.
- Source Review changes.
- MIDI Drum Note Atlas/mapping changes.
- Tempo override/editor.

## Source of truth

The accepted OpenSpec must be transferred into Engram before implementation. Engram is the project source of truth.
