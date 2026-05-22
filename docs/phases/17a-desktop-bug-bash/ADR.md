# ADR Phase 17A: Desktop Bug Bash

## Status

Proposed.

## Decision

Run a focused desktop bug bash phase before broad UI redesign or packaging.

The first bug to fix is the Inspect Source false `0 notes` issue for GPIF tracks.

## Context

The app now covers the main functional flow:

```txt
source inspection
track selection
normalization
generation
validation
preview
offset adjustment
mapping overrides
mapping profiles
project persistence
```

Manual testing found data consistency issues and several UI/preview problems.

The UI/preview problems are real, but mixing them with functional bug fixes would make the phase too broad.

## Decision details

Phase 17A will focus on functional correctness only.

It will fix:

```txt
BUG-01 Inspect Source shows false 0 notes for GPIF tracks
related count/track metadata consistency issues discovered while fixing BUG-01
```

It will not redesign:

```txt
timeline
highway
waveform
home/projects information architecture
general visual style
```

## Count semantics decision

The app should not display numeric `0` unless the count is truly known to be zero.

For unknown/unavailable counts, the app should use a distinct representation:

```txt
n/a
Unknown
Available after normalization
```

Exact copy can follow the current UI style, but false zero is not acceptable.

## Why not fix Preview UI in this phase

The waveform/timeline/highway work is larger and should be planned as a dedicated Preview UX Redesign phase.

That phase likely needs:

```txt
real audio waveform extraction
timeline lane redesign
highway layout/scale improvements
playhead/zoom/scroll interaction
visual hierarchy improvements
```

Those changes should not be mixed with the inspection-count bug fix.

## Constraints

- Preserve existing app workflow.
- Preserve Phase 16A/16B behavior.
- Preserve Electron security boundaries.
- Keep bug fixes testable.
- Do not add unrelated redesign.
- Do not implement future roadmap features.

## Review policy

Final PR review is external.

Do not merge without explicit approval.
