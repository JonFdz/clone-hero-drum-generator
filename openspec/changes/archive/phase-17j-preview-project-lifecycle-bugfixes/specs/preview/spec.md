# Spec — Preview

## ADDED Requirements

### Requirement: Preview uses generated output only

Preview SHALL use generated `notes.chart` and generated `song.ogg` as its playback and timing sources.

#### Scenario: Generated output exists

- **GIVEN** a project has generated `notes.chart` and `song.ogg`
- **WHEN** the user opens Preview
- **THEN** Preview loads chart timing from generated `notes.chart`
- **AND** Preview loads audio from generated `song.ogg`

#### Scenario: Generated output is missing

- **GIVEN** a project has no generated output
- **WHEN** the user opens Preview
- **THEN** Preview shows a clear empty state instructing the user to generate first

### Requirement: Preview must not use analysis cache for generated timing

Preview SHALL NOT use `.chdg` `analysis.normalizationPreview.firstHits` to simulate generated chart playback.

#### Scenario: Chart load fails but analysis cache exists

- **GIVEN** generated `notes.chart` is missing or unreadable
- **AND** `.chdg` contains `analysis.normalizationPreview.firstHits`
- **WHEN** the user opens Preview
- **THEN** Preview shows generated chart unavailable
- **AND** Preview does not stretch `firstHits` across the audio duration

### Requirement: Preview reports generated chart/audio failures visibly

Preview SHALL surface generated chart/audio load failures visibly.

#### Scenario: notes.chart is unreadable

- **GIVEN** generated `notes.chart` exists in state but cannot be read or parsed
- **WHEN** Preview loads
- **THEN** Preview shows a generated chart error

#### Scenario: song.ogg is unreadable

- **GIVEN** generated `song.ogg` exists in state but cannot be loaded
- **WHEN** Preview loads
- **THEN** Preview shows a generated audio error
