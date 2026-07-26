# Spec — GPIF Articulation Resolver

## ADDED Requirements

### Requirement: GPIF articulation output MIDI resolution

CHDG SHALL resolve GPIF drum articulations using `OutputMidiNumber` when present.

#### Scenario: Hi-Hat half resolves through OutputMidiNumber

Given a GPIF drum articulation with:

```text
Name: Hi-Hat (half)
InputMidiNumbers: [92]
OutputMidiNumber: 46
```

When CHDG normalizes GPIF drums

Then the articulation SHALL resolve to:

```text
action: map
automaticPiece: hihat_open
confidence: high
resolvedVia: output-midi-number
```

And it SHALL NOT be reported as unknown MIDI 92.

### Requirement: Output MIDI priority over input MIDI

CHDG SHALL NOT classify a GPIF articulation as unknown based on `InputMidiNumbers` when `OutputMidiNumber` resolves through the MIDI Drum Note Atlas.

### Requirement: Controlled name-pattern fallback

CHDG SHALL resolve known GPIF articulation names when output MIDI is unavailable.

#### Scenario: Rimshot name-only

Given a GPIF articulation named `Rimshot`

And no usable `OutputMidiNumber`

When CHDG resolves the articulation

Then it SHALL resolve as:

```text
action: map
automaticPiece: snare
confidence: medium
resolvedVia: name-pattern
```

### Requirement: Pedal Hi-Hat remains candidate

CHDG SHALL treat GPIF Pedal Hi-Hat / Foot Hi-Hat articulations as candidates, not automatic mapped hits.

### Requirement: Known ignored percussion is not unknown

CHDG SHALL classify known auxiliary percussion articulations as ignored known, not unknown.

### Requirement: Candidate auxiliary percussion remains candidate

CHDG SHALL classify known auxiliary percussion candidates according to Phase 17L semantics.

### Requirement: Conflict handling

CHDG SHALL not silently map articulations when name and output MIDI clearly conflict.

### Requirement: GPIF mapping rows include resolver metadata

CHDG SHALL expose enough metadata for Source Review to explain GPIF articulation decisions.

### Requirement: Overrides apply to GPIF articulations

CHDG SHALL preserve project mapping overrides for GPIF articulation rows.
