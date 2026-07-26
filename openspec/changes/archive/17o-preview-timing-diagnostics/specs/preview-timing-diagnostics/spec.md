# Spec — Preview Timing Diagnostics

## ADDED Requirements

### Requirement: Generated chart timing diagnostics

CHDG SHALL parse the generated `notes.chart` used by Preview and expose generated chart timing diagnostics.

#### Scenario: Generated chart has multiple tempo events

- **GIVEN** generated `notes.chart` contains multiple `B` entries in `[SyncTrack]`
- **WHEN** Preview loads timing diagnostics
- **THEN** every tempo event SHALL be displayed with tick, time, and BPM.

#### Scenario: Generated chart has no tempo events

- **GIVEN** generated `notes.chart` contains no `B` entries in `[SyncTrack]`
- **WHEN** Preview loads timing diagnostics
- **THEN** CHDG SHALL emit `TIMING_NO_TEMPO_EVENTS`
- **AND** generated timing SHALL be marked inaccurate.

#### Scenario: Generated chart has no initial tempo

- **GIVEN** generated `notes.chart` contains BPM entries but none at tick `0`
- **WHEN** Preview loads timing diagnostics
- **THEN** CHDG SHALL emit `TIMING_NO_INITIAL_TEMPO`
- **AND** generated timing SHALL be marked inaccurate.

### Requirement: Time signature diagnostics

CHDG SHALL parse generated chart time signature events from `[SyncTrack]` and display them in Preview.

#### Scenario: Time signature uses default denominator

- **GIVEN** generated `notes.chart` contains `0 = TS 4`
- **WHEN** timing diagnostics are parsed
- **THEN** CHDG SHALL display the signature as `4/4`.

#### Scenario: Time signature uses denominator exponent

- **GIVEN** generated `notes.chart` contains `0 = TS 6 3`
- **WHEN** timing diagnostics are parsed
- **THEN** CHDG SHALL display the signature as `6/8`.

#### Scenario: Generated chart has no time signatures

- **GIVEN** generated `notes.chart` contains no `TS` entries in `[SyncTrack]`
- **WHEN** Preview loads timing diagnostics
- **THEN** CHDG SHALL emit `TIMING_NO_TIME_SIGNATURES`.

### Requirement: Section timing table

CHDG SHALL show generated section events with tick, time, and name.

#### Scenario: Generated chart contains section events

- **GIVEN** generated `notes.chart` contains `E "section ..."` entries in `[Events]`
- **WHEN** Preview loads timing diagnostics
- **THEN** CHDG SHALL display section tick, computed time, and name.

### Requirement: Note timing summary

CHDG SHALL show a generated note timing summary.

#### Scenario: Generated chart contains ExpertDrums notes

- **GIVEN** generated `notes.chart` contains `N` entries in `[ExpertDrums]`
- **WHEN** Preview loads timing diagnostics
- **THEN** CHDG SHALL display note count, first note tick/time, and last note tick/time.

### Requirement: Offset is informational

CHDG SHALL display generated chart offset as an adjustment, not as a warning.

#### Scenario: Generated chart has non-zero offset

- **GIVEN** generated `notes.chart` contains a non-zero `Offset`
- **WHEN** Preview loads timing diagnostics
- **THEN** CHDG SHALL emit or display offset as info/metadata only
- **AND** CHDG SHALL NOT treat offset as a warning.

### Requirement: Suspicious BPM jumps

CHDG SHALL flag large BPM changes using conservative severity.

#### Scenario: BPM jump greater than 30 BPM

- **GIVEN** consecutive tempo events differ by more than 30 BPM and at most 50 BPM
- **WHEN** diagnostics run
- **THEN** CHDG SHALL emit `TIMING_SUSPICIOUS_BPM_JUMP_INFO` as info.

#### Scenario: BPM jump greater than 50 BPM

- **GIVEN** consecutive tempo events differ by more than 50 BPM
- **WHEN** diagnostics run
- **THEN** CHDG SHALL emit `TIMING_SUSPICIOUS_BPM_JUMP_WARNING` as warning.

### Requirement: Constant tempo should not warn

CHDG SHALL NOT warn solely because a generated chart has only one BPM event.

#### Scenario: Long chart has one BPM

- **GIVEN** generated chart has one BPM event and a long note duration
- **WHEN** diagnostics run
- **THEN** CHDG MAY emit `TIMING_ONLY_ONE_TEMPO_LONG_SONG` as info
- **AND** CHDG SHALL NOT emit a warning solely for one BPM.

### Requirement: Source-vs-generated timing comparison

CHDG SHALL compare generated timing data against cached source analysis when available.

#### Scenario: Source has tempo missing in generated chart

- **GIVEN** cached source analysis contains a tempo event
- **AND** generated chart does not contain an equivalent tempo event at the same tick within BPM tolerance
- **WHEN** diagnostics run
- **THEN** CHDG SHALL emit `SOURCE_TEMPO_MISSING_IN_GENERATED`
- **AND** the message SHALL explain possible tempo drift.

#### Scenario: Source analysis unavailable

- **GIVEN** Preview has no cached source analysis available
- **WHEN** timing diagnostics run
- **THEN** CHDG SHALL emit `SOURCE_COMPARISON_UNAVAILABLE`
- **AND** CHDG SHALL NOT automatically recalculate source analysis from Preview.

### Requirement: SyncTrack writer ordering

If the implementation changes writer ordering, CHDG SHALL write generated SyncTrack events ordered by tick.

#### Scenario: BPM and TS share the same tick

- **GIVEN** a chart contains a BPM and time signature at the same tick
- **WHEN** `notes.chart` is written
- **THEN** the `TS` event SHALL appear before the `B` event for that tick.

#### Scenario: SyncTrack has multiple ticks

- **GIVEN** a chart contains timing events at multiple ticks
- **WHEN** `notes.chart` is written
- **THEN** SyncTrack events SHALL appear in ascending tick order.
