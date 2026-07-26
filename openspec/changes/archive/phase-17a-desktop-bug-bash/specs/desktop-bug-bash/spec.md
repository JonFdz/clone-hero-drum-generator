# Spec: Desktop Bug Bash

## ADDED Requirements

### Requirement: Inspect Source must not display false zero note counts

Inspect Source SHALL NOT display `0 notes` when the note count is unknown or unavailable.

#### Scenario: GPIF track count unavailable

Given a GPIF source has a track whose count is not available during inspection
When the user views Inspect Source
Then the track count is displayed as `n/a`, `Unknown`, or `Available after normalization`
And it is not displayed as `0 notes`.

#### Scenario: GPIF later normalization finds candidates

Given Inspect Source displayed an unknown/unavailable count for a GPIF drum candidate
When the user continues to normalization and Mapping finds source candidates
Then the earlier Inspect Source display is not contradicted by a false `0 notes`.

### Requirement: Known zero remains distinguishable

Inspect Source SHALL still display zero when the app genuinely knows the track has zero notes.

#### Scenario: Known empty track

Given inspection can prove a track has zero notes
When the user views Inspect Source
Then the UI may display `0 notes`.

### Requirement: MIDI counts remain correct

The fix SHALL preserve MIDI inspection note counts.

#### Scenario: MIDI track with known note count

Given a MIDI track has a known note count
When the user views Inspect Source
Then the UI displays that numeric count.

### Requirement: Track count display is consistent

Detected tracks and drum candidate cards SHALL use the same count semantics.

#### Scenario: Drum candidate card and track table

Given a track count is unknown
When the same track appears in the drum candidate card and detected tracks table
Then both displays use a non-misleading unknown/unavailable representation.

### Requirement: Existing workflows remain functional

The bug bash SHALL preserve existing desktop workflows.

#### Scenario: Continue after inspection

Given the user inspects a GPIF source
When they continue to Track Selection, Normalize, Mapping, Generate, and Preview
Then the flow still works.

## MODIFIED Requirements

### Requirement: Track count model distinguishes unknown from zero

The inspection track/candidate model is modified to distinguish unknown/unavailable count from known numeric zero.

## REMOVED Requirements

None.
