# Spec: GPIF sections

## ADDED Requirements

### Requirement: GPIF section markers preserve timeline position

Generated charts SHALL emit GPIF section markers at the chart tick corresponding to their GPIF bar/measure position.

#### Scenario: section at song start

- **GIVEN** a GPIF source with a section marker named `Intro` at bar `0`
- **WHEN** CHDG generates `notes.chart`
- **THEN** `[Events]` SHALL include `0 = E "section Intro"`

#### Scenario: section at later bar

- **GIVEN** a GPIF source with 960 resolution, 4/4 time signature, and a section marker named `Verse 1` at bar `8`
- **WHEN** CHDG generates `notes.chart`
- **THEN** `[Events]` SHALL include `30720 = E "section Verse 1"`

#### Scenario: Decode-like break section

- **GIVEN** a GPIF source with 960 resolution, 4/4 time signature, and a section marker named `Break` at bar `48`
- **WHEN** CHDG generates `notes.chart`
- **THEN** `[Events]` SHALL include `184320 = E "section Break"`

### Requirement: GPIF sections must not all default to tick zero

Generated charts SHALL NOT place every GPIF section marker at tick `0` unless the source truly places every section marker at the beginning of the song.

#### Scenario: multiple sections across timeline

- **GIVEN** a GPIF source with sections at bars `0`, `8`, and `48`
- **WHEN** CHDG generates `notes.chart`
- **THEN** the generated `[Events]` SHALL contain at least one section event with tick greater than `0`

### Requirement: GPIF section export preserves existing tempo and note behavior

Fixing section ticks SHALL NOT regress GPIF tempo-map export or note placement.

#### Scenario: tempo map remains unchanged

- **GIVEN** a GPIF source with tempo changes at bar `0` and bar `48`
- **WHEN** CHDG generates `notes.chart`
- **THEN** `[SyncTrack]` SHALL still include the expected tempo events
- **AND** section events SHALL be placed independently at their correct ticks
