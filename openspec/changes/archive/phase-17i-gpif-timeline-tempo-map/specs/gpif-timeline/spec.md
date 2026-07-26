# Spec — GPIF Timeline

## ADDED Requirements

### Requirement: GPIF tempo automations are preserved

CHDG SHALL convert GPIF tempo automations into chart tempo events with correct ticks.

#### Scenario: Tempo automation at bar 48

Given a GPIF source with 960 PPQ and 4/4 time signature
And a tempo automation at bar 0 with value 164 BPM
And a tempo automation at bar 48 with value 160 BPM
When CHDG normalizes the GPIF source
Then the normalized tempo events SHALL include `{ tick: 0, bpm: 164 }`
And the normalized tempo events SHALL include `{ tick: 184320, bpm: 160 }`.

#### Scenario: Generated chart writes all tempo events

Given normalized tempo events at ticks 0 and 184320
When CHDG writes `notes.chart`
Then `[SyncTrack]` SHALL include `0 = B 164000`
And `[SyncTrack]` SHALL include `184320 = B 160000`.

### Requirement: GPIF bar positions convert to ticks

CHDG SHALL convert GPIF bar/position data into chart ticks using the GPIF timeline.

#### Scenario: Standard 4/4 bar conversion

Given resolution 960
And time signature 4/4
When converting bar 48 position 0
Then the resulting tick SHALL be 184320.

### Requirement: GPIF sections use timeline ticks

CHDG SHALL place GPIF sections/markers at the correct ticks when bar/position context is available.

#### Scenario: Section with bar context

Given a GPIF marker associated with a later bar
When CHDG normalizes sections
Then the section tick SHALL be the converted tick for that bar
And it SHALL NOT default to tick 0 unless the marker truly belongs at tick 0 or no timing context exists.

### Requirement: GPIF time signature changes are preserved

CHDG SHALL preserve GPIF time signature changes where available.

#### Scenario: Multiple time signatures

Given a GPIF source with time signature changes across master bars
When CHDG normalizes the source
Then the normalized time signature events SHALL include the changes at their corresponding ticks.

### Requirement: Timing fallbacks remain safe

CHDG SHALL preserve safe fallback behavior for GPIF files that do not expose timing structures.

#### Scenario: No tempo found

Given a GPIF source with no recognized tempo
When CHDG normalizes the source
Then CHDG SHALL emit a fallback tempo at tick 0.

#### Scenario: No time signature found

Given a GPIF source with no recognized time signature
When CHDG normalizes the source
Then CHDG SHALL emit 4/4 at tick 0.

## MODIFIED Requirements

### Requirement: GPIF normalization returns chart-ready timing data

CHDG SHALL return chart-ready `TempoEvent[]`, `TimeSignatureEvent[]`, and `SongSection[]` from GPIF normalization. These values SHALL be suitable for direct chart writing and SHALL NOT depend on lossy text summaries.

#### Scenario: Inspection sees multiple tempos

Given GPIF inspection sees multiple tempo structures
When CHDG generates the package
Then generation SHALL use parsed timeline events rather than only the first parsed BPM.
