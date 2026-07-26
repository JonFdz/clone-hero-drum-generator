# Spec: Structured Project Services + CLI JSON

## ADDED Requirements

### Requirement: Project orchestration package exists

CHDG SHALL include a shared project orchestration package for high-level operations used by CLI and future Desktop.

The package SHOULD be named:

```txt
packages/project
```

unless repository conventions require another name.

#### Scenario: Project package is available

Given the repository after Phase 10A  
When a developer inspects the workspace  
Then a project orchestration package exists  
And it exposes high-level functions for source inspection and generation-oriented workflows.

---

### Requirement: Source inspection has structured DTO output

CHDG SHALL provide structured source inspection results.

The structured result SHALL represent:

```txt
source kind
source path
resolution / PPQ where available
tempo events or summary
time signatures
sections where available
tracks
drum candidates
unknown notes/articulations
warnings
```

#### Scenario: Inspect MIDI as structured data

Given a valid MIDI source  
When the source is inspected through project services  
Then the result is structured data  
And includes MIDI tracks and detected drum candidates.

#### Scenario: Inspect GPIF as structured data

Given a valid `.gp` source  
When the source is inspected through project services  
Then the result is structured data  
And includes GPIF tracks and drum-related candidates.

---

### Requirement: Normalization preview has structured DTO output

CHDG SHALL provide structured normalization preview results for selected tracks.

The result SHALL include:

```txt
source kind
selected track or tracks, if supported by current phase
hit count
piece summary
first hits
unknown notes/articulations
warnings
```

#### Scenario: MIDI normalization preview

Given a valid MIDI source and selected track  
When the track is normalized through project services  
Then a structured preview is returned.

#### Scenario: GPIF normalization preview

Given a valid `.gp` source and selected track  
When the track is normalized through project services  
Then a structured preview is returned.

---

### Requirement: Generate result has structured DTO output

CHDG SHALL provide structured generation result output.

The result SHALL include:

```txt
source kind
selected track
output directory
created files
metadata summary where available
offset summary where available
warnings
```

#### Scenario: Generate returns structured result

Given a valid generate command  
When generation succeeds through project services  
Then the result includes the generated files:
  - `notes.chart`
  - `song.ini`
  - `song.ogg` when audio was provided.

---

### Requirement: CLI supports clean JSON output

CHDG SHALL support `--json` for key inspection, normalization and generation commands.

When `--json` is provided:

```txt
stdout SHALL contain valid JSON only
human logs SHALL NOT be mixed into stdout
warnings SHALL be included in JSON or sent to stderr
exit code SHALL indicate success/failure
```

#### Scenario: Inspect command JSON

Given a valid source  
When the user runs an inspect command with `--json`  
Then stdout is parseable JSON  
And contains structured inspection data.

#### Scenario: Normalize command JSON

Given a valid source and selected track  
When the user runs a normalize command with `--json`  
Then stdout is parseable JSON  
And contains structured normalization preview data.

#### Scenario: Generate command JSON

Given a valid generate command  
When the user runs it with `--json`  
Then stdout is parseable JSON  
And contains structured generation result data.

#### Scenario: Human output remains available

Given a command currently has human-readable output  
When the same command is run without `--json`  
Then existing human-readable output remains available.

---

### Requirement: Structured warnings and errors exist

CHDG SHALL represent warnings and recoverable issues as structured items.

A structured issue SHOULD include:

```txt
severity
code
message
details
```

#### Scenario: Unknown articulation warning

Given GPIF normalization finds an unknown articulation  
When JSON output is requested  
Then the warning is represented as structured JSON  
And does not corrupt stdout with human text.

---

### Requirement: Existing behavior is preserved

Phase 10A SHALL preserve current MIDI and GPIF behavior.

#### Scenario: Existing commands still pass

Given existing CLI commands from previous phases  
When run without `--json`  
Then they continue to behave as before unless explicitly documented otherwise.

## MODIFIED Requirements

### Requirement: CLI commands can select human or JSON output

Existing CLI commands are modified to choose human-readable or JSON output depending on `--json`.

## REMOVED Requirements

None.
