# Spec: Project Mapping Overrides

## ADDED Requirements

### Requirement: Project stores mapping overrides

CHDG SHALL store project-level mapping overrides in `.chdg`.

#### Scenario: Save and reload overrides

Given a project has mapping overrides
When the project is saved and reopened
Then the overrides are restored.

#### Scenario: Old project without overrides

Given an existing project has no mapping override data
When the project is opened
Then the project loads successfully with no overrides.

### Requirement: User can override MIDI note mapping

CHDG Desktop SHALL allow mapping a MIDI note number to a `DrumPiece`.

#### Scenario: MIDI note override

Given a MIDI source exposes note number `37`
When the user maps `37` to `snare`
Then normalization/generation uses `snare` for that note.

### Requirement: User can override GPIF/source articulation mapping

CHDG Desktop SHALL allow mapping a GPIF/source articulation key to a `DrumPiece`.

#### Scenario: GPIF articulation override

Given a GPIF source exposes an articulation key
When the user maps that key to a `DrumPiece`
Then normalization/generation uses that `DrumPiece`.

### Requirement: User can ignore source notes/articulations

CHDG Desktop SHALL allow source notes/articulations to be ignored.

#### Scenario: Ignore source note

Given a source note/articulation is present
When the user sets it to ignore
Then normalization/generation skips hits from that source key.

### Requirement: User can reset overrides

CHDG Desktop SHALL allow resetting an override to automatic/default mapping.

#### Scenario: Reset override

Given a source key has a project override
When the user resets the override
Then automatic mapping is used again.

### Requirement: Sidestick can be mapped or ignored

CHDG Desktop SHALL support sidestick correction.

#### Scenario: Sidestick to snare

Given sidestick source events exist
When the user maps sidestick to snare
Then those events normalize as snare.

#### Scenario: Sidestick ignored

Given sidestick source events exist
When the user ignores sidestick
Then those events are skipped.

### Requirement: Override changes mark output stale

Changing mapping overrides SHALL mark preview/generated output stale.

#### Scenario: Override change after generation

Given generated output exists
When the user changes a mapping override
Then output status becomes needs-regenerate or equivalent stale state.

### Requirement: Existing workflows remain functional

Phase 16A SHALL preserve validation, generation, preview, highway, and offset behavior.

#### Scenario: Generate after override change

Given mapping overrides are configured
When the user generates
Then generation completes using overrides
And preview/validation still work.

## MODIFIED Requirements

### Requirement: Normalization applies project mapping overrides

Normalization/generation is modified to apply project mapping overrides before automatic/default mapping output is finalized.

## REMOVED Requirements

None.
