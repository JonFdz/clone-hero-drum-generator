# Spec: Desktop Generate MVP

## ADDED Requirements

### Requirement: Desktop file and folder pickers exist

CHDG Desktop SHALL expose safe native pickers through the Electron preload bridge.

Required pickers:

```txt
source file picker
audio file picker
output folder picker
```

#### Scenario: Pick source file

Given the desktop app is running
When the user clicks the source file picker
Then a native file dialog opens
And accepts `.mid`, `.midi`, and `.gp` files
And returns a selected local path through the bridge.

#### Scenario: Pick required audio file

Given the desktop app is running
When the user clicks the audio file picker
Then a native file dialog opens
And returns a selected local audio path through the bridge.

#### Scenario: Pick output folder

Given the desktop app is running
When the user clicks the output folder picker
Then a native folder dialog opens
And returns a selected local folder path through the bridge.

---

### Requirement: Desktop renderer does not access Node directly

CHDG Desktop SHALL preserve Electron security boundaries.

#### Scenario: Renderer calls desktop capability

Given the Angular renderer needs filesystem or generation capabilities
When it performs the action
Then it calls a typed preload bridge method
And does not import/use `fs`, `child_process`, or direct Node APIs.

---

### Requirement: New Project form captures generation inputs

CHDG Desktop SHALL provide a New Project form for the MVP generation inputs.

Required fields:

```txt
source file
audio file required
output folder
song name
artist
album
year
genre
charter
offset ms
```

#### Scenario: Audio missing

Given the user selected source and output folder
But did not select an audio file
When they attempt to generate
Then the UI blocks generation
And clearly states that audio is required for Desktop Generate MVP.

#### Scenario: Source type auto-detected

Given the user selects `.mid`, `.midi`, or `.gp`
When the source field is set
Then the UI shows the detected source type.

---

### Requirement: Source inspection works from Desktop

CHDG Desktop SHALL inspect selected source files through `@chdg/project`.

#### Scenario: Inspect GPIF source

Given the user selected a `.gp` source
When they run inspection
Then the desktop UI displays structured inspection data:
  - source kind
  - tracks
  - drum candidates
  - tempos/time signatures/sections where available
  - issues/warnings.

#### Scenario: Inspect MIDI source

Given the user selected a `.mid` or `.midi` source
When they run inspection
Then the desktop UI displays structured inspection data:
  - source kind
  - tracks
  - drum candidates
  - resolution
  - tempos/time signatures/sections where available
  - issues/warnings.

---

### Requirement: Track selection supports single and multiple tracks

CHDG Desktop SHALL allow selecting one or more drum tracks for generation.

#### Scenario: Select single track

Given inspection results show track candidates
When the user selects one track
Then the selected track list contains that track
And normalization/generation uses a single selected track.

#### Scenario: Select multiple tracks

Given inspection results show multiple track candidates
When the user selects more than one track
Then the selected track list contains all selected tracks
And normalization/generation uses multi-track selection.

---

### Requirement: Normalization summary is shown

CHDG Desktop SHALL show a structured summary for the selected track(s).

The summary SHOULD include:

```txt
selected tracks
hit count
piece summary
first hits
merge summary when multi-track
issues/warnings
```

#### Scenario: Multi-track summary

Given multiple tracks are selected
When normalization preview runs
Then the UI shows selected tracks and merge summary.

---

### Requirement: Desktop can generate a Clone Hero song folder

CHDG Desktop SHALL generate a Clone Hero song folder using `@chdg/project.generatePackage`.

Generated output SHALL include:

```txt
notes.chart
song.ini
song.ogg
```

when audio conversion succeeds.

#### Scenario: Generate GPIF

Given the user selected a `.gp` source, required audio file, output folder, metadata, offset, and one or more tracks
When they click Generate
Then CHDG Desktop calls the project generation service
And the output folder contains `notes.chart`, `song.ini`, and `song.ogg`.

#### Scenario: Generate MIDI

Given the user selected a `.mid` or `.midi` source, required audio file, output folder, metadata, offset, and one or more tracks
When they click Generate
Then CHDG Desktop calls the project generation service
And the output folder contains `notes.chart`, `song.ini`, and `song.ogg`.

---

### Requirement: Generation result is displayed

CHDG Desktop SHALL display generation status and result.

The result SHOULD include:

```txt
selected tracks
output folder
created files
hit count
mapped note count
merge summary when available
issues/warnings
```

#### Scenario: Generation succeeds

Given generation completes successfully
When the result is returned
Then the UI displays success state
And lists generated files.

#### Scenario: Generation fails

Given generation returns an error
When the UI receives the error
Then it displays a clear error state
And does not crash.

---

### Requirement: Output folder can be opened

CHDG Desktop SHALL expose a safe Open Output Folder action through Electron.

#### Scenario: Open generated output folder

Given generation succeeded
When the user clicks Open Output Folder
Then the operating system opens the generated output folder.

---

### Requirement: Existing CLI/package behavior remains intact

Phase 11 SHALL NOT regress CLI behavior.

#### Scenario: Existing validation commands

Given Phase 11 is implemented
When root validation commands run
Then existing CLI and package tests still pass.

## MODIFIED Requirements

### Requirement: Desktop placeholder pages become MVP workflow screens

Existing placeholder pages from Phase 10 are modified into working MVP screens for New Project, Inspect Source, Track Selection and Generate.

## REMOVED Requirements

None.
