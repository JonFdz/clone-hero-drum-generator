# ADR — MIDI Drum Note Atlas and Mapping Coverage

## Context

CHDG currently maps MIDI drum notes using a small flat JSON table. This cannot represent confidence, ignored known percussion, candidate notes, reasons, families, or future profile/GPIF metadata. It also makes Source Review less informative.

## Decision

Introduce a rich MIDI drum note atlas and coverage model.

The default mapping action semantics are:

- `map`: generate notes automatically.
- `candidate`: do not generate notes by default; show for review.
- `ignore`: do not generate notes; show as known ignored percussion.
- `unknown`: do not generate notes; show warning/status.

The atlas version starts at `0.1.0`.

`candidate` remains non-generating by default as a stable base rule. Future profiles may introduce aggressive behavior, but that is out of scope.

`44 Pedal Hi-Hat` is treated as `candidate -> hihat_closed`, not auto-map, because it represents a foot action and can create over-dense or unrealistic hand patterns if blindly charted.

## Consequences

### Positive

- Known auxiliary percussion no longer becomes noisy unknowns.
- Candidate notes become visible and reviewable without over-charting by default.
- Source Review can show mapping coverage.
- The model can later support GPIF articulation metadata and mapping profiles.

### Negative / tradeoffs

- Some notes that could be musically useful will not generate by default until the user overrides them.
- The data model changes and cached analysis must be invalidated by atlas version.
- Source Review UI will need a follow-up redesign to fully expose the richer data.

## Rejected alternatives

### Keep flat JSON and add more notes

Rejected because it cannot express candidate/ignore/confidence/reasons.

### Auto-map all plausible percussion

Rejected because it risks noisy or unplayable charts.

### Ignore all auxiliary percussion silently

Rejected because users need to know what CHDG saw and skipped.

### Implement full GPIF articulation mapping now

Rejected for scope. The model should be future-ready, but the full GPIF articulation phase is deferred.
