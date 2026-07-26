# Spec — Mapping Coverage

## ADDED Requirements

### Requirement: MIDI drum mapping SHALL use a rich atlas

CHDG SHALL resolve MIDI drum note numbers using a rich atlas entry model that supports mapping action, note name, confidence, family, source, and reason metadata.

#### Scenario: Safe GM note maps automatically

- **GIVEN** MIDI note `36`
- **WHEN** CHDG resolves the note
- **THEN** the resolution action SHALL be `map`
- **AND** the resolved piece SHALL be `kick`.

#### Scenario: Known auxiliary percussion is ignored

- **GIVEN** MIDI note `54` Tambourine
- **WHEN** CHDG resolves the note
- **THEN** the resolution action SHALL be `ignore`
- **AND** CHDG SHALL NOT create a playable drum hit by default.

#### Scenario: Candidate note does not generate by default

- **GIVEN** MIDI note `39` Hand Clap
- **WHEN** CHDG resolves and normalizes the note without override
- **THEN** the resolution action SHALL be `candidate`
- **AND** CHDG SHALL NOT create a playable drum hit by default
- **AND** the note SHALL be visible in mapping coverage.

#### Scenario: Pedal Hi-Hat is candidate

- **GIVEN** MIDI note `44` Pedal Hi-Hat
- **WHEN** CHDG resolves the note
- **THEN** the resolution action SHALL be `candidate`
- **AND** the suggested piece SHALL be `hihat_closed`
- **AND** CHDG SHALL NOT create a playable drum hit by default.

### Requirement: Candidate behavior SHALL be conservative by default

Candidate notes SHALL NOT generate playable notes by default.

#### Scenario: Candidate requires override

- **GIVEN** a MIDI source containing candidate note `56` Cowbell
- **AND** no project override exists for `midi:56`
- **WHEN** CHDG normalizes the source
- **THEN** no `DrumHit` SHALL be created for note `56`
- **AND** mapping coverage SHALL include note `56` as candidate.

#### Scenario: Candidate can be mapped by override

- **GIVEN** a MIDI source containing candidate note `56` Cowbell
- **AND** a project override maps `midi:56` to `crash`
- **WHEN** CHDG normalizes the source
- **THEN** CHDG SHALL create `crash` hits for note `56`.

### Requirement: Ignored known percussion SHALL be visible but low-noise

Known ignored percussion SHALL be counted and visible in coverage, but SHALL NOT be reported as unknown-note warning noise.

#### Scenario: Ignored note is counted

- **GIVEN** a MIDI source containing note `70` Maracas
- **WHEN** CHDG normalizes the source
- **THEN** no playable hit SHALL be created
- **AND** mapping coverage SHALL count the note under ignored known percussion
- **AND** CHDG SHALL NOT report it as an unknown note.

### Requirement: Unknown notes SHALL remain visible and non-blocking

Valid MIDI notes outside the atlas SHALL be treated as unknown mapping sources. They SHALL be visible and non-blocking.

#### Scenario: Unknown valid MIDI note

- **GIVEN** a MIDI source containing note `92`
- **AND** no GPIF articulation metadata or project override applies
- **WHEN** CHDG normalizes the source
- **THEN** no playable hit SHALL be created by default
- **AND** mapping coverage SHALL include note `92` as unknown
- **AND** Generate SHALL remain non-blocking.

### Requirement: Project overrides SHALL remain authoritative

Project overrides SHALL be able to map or ignore any mapping source supported by the mapping key model.

#### Scenario: Override ignores auto-mapped note

- **GIVEN** a MIDI source containing note `36`
- **AND** a project override ignores `midi:36`
- **WHEN** CHDG normalizes the source
- **THEN** no kick hit SHALL be created for note `36`.

#### Scenario: Override maps ignored known percussion

- **GIVEN** a MIDI source containing note `54` Tambourine
- **AND** a project override maps `midi:54` to `snare`
- **WHEN** CHDG normalizes the source
- **THEN** CHDG SHALL create `snare` hits for note `54`.

### Requirement: Mapping coverage SHALL be persisted in normalization preview

Normalization preview SHALL include mapping coverage summary and mapping rows covering mapped, candidate, ignored, and unknown sources.

#### Scenario: Coverage summary contains counts

- **GIVEN** a MIDI source containing mapped, candidate, ignored, and unknown note events
- **WHEN** CHDG creates a normalization preview
- **THEN** `mappingCoverage` SHALL include mapped, candidate, ignored, and unknown event counts
- **AND** `mappingCoverage.atlasVersion` SHALL equal `0.1.0`.

### Requirement: Mapping atlas version SHALL invalidate stale analysis

Source Review analysis cache/fingerprint SHALL include mapping atlas version.

#### Scenario: Atlas version changes

- **GIVEN** a `.chdg` analysis cached with atlas version `0.0.9`
- **AND** the current atlas version is `0.1.0`
- **WHEN** Source Review loads
- **THEN** cached normalization SHALL be considered stale
- **AND** CHDG SHALL recompute normalization when required.

### Requirement: Minimal Source Review mapping coverage SHALL be visible

Source Review SHALL show a minimal mapping coverage summary without requiring the full Phase 17M UI redesign.

#### Scenario: Coverage summary appears

- **GIVEN** a normalization preview with mapping coverage
- **WHEN** Source Review renders
- **THEN** it SHALL show mapped, candidate, ignored, and unknown counts in a compact form.

## Normative mapping data

The implementation SHALL follow `docs/phases/17l-midi-drum-note-atlas-mapping-coverage/MAPPING_ATLAS_DECISIONS.md` for all GM/GM2 note actions in this phase.
