# Spec: Project Persistence + Settings

## ADDED Requirements

### Requirement: CHDG project files are saved as JSON

CHDG Desktop SHALL support saving project state to a `.chdg` JSON file.

#### Scenario: Save project

Given the user has source, audio, output folder, metadata, selected tracks and offset in desktop state
When the user saves the project
Then CHDG writes a `.chdg` JSON file
And the file includes project schema version, paths, metadata, selected tracks, offset, and generation status.

#### Scenario: Project file extension

Given the user saves a project
When the save dialog is shown
Then the suggested file extension is `.chdg`.

---

### Requirement: CHDG project files can be loaded

CHDG Desktop SHALL support opening `.chdg` files and restoring desktop state.

#### Scenario: Open project

Given a valid `.chdg` project file exists
When the user opens it
Then the desktop state is restored with source path, audio path, output folder, metadata, selected tracks, offset, and generation status.

#### Scenario: Invalid project file

Given a malformed or unsupported `.chdg` file
When the user opens it
Then the UI displays a clear error
And does not crash.

---

### Requirement: Recent projects are tracked

CHDG Desktop SHALL track recently opened/saved projects.

#### Scenario: Recent project added

Given the user saves or opens a project
When the operation succeeds
Then the project appears in recent projects.

#### Scenario: Recent project missing

Given a recent project path no longer exists
When the user tries to open it
Then the UI shows a missing project error
And allows removing it from recents.

---

### Requirement: Desktop settings persist locally

CHDG Desktop SHALL persist local settings through Electron main/preload.

Settings SHALL include at least:

```txt
project location
default output folder
default charter
default offset ms
ffmpeg path
theme/accent placeholders where useful
```

#### Scenario: Save settings

Given the user changes settings
When settings are saved
Then the settings are written to local app storage
And survive app restart.

#### Scenario: Read settings on launch

Given settings were previously saved
When the desktop app starts
Then settings are loaded into the Settings screen.

---

### Requirement: Default project and output locations exist

CHDG Desktop SHALL provide default locations for new projects and outputs.

#### Scenario: New project default path

Given the user creates a new project named `Demo Song`
When no custom project location is configured
Then the default project folder is under `~/Documents/CHDG Projects/Demo Song/`.

#### Scenario: Output folder default

Given a project folder exists
When no custom output folder is selected
Then the default output folder is inside the project folder.

---

### Requirement: Project dirty and output status are tracked

CHDG Desktop SHALL track unsaved changes and whether generated output is stale.

Output status SHALL support:

```txt
not-generated
generated
needs-regenerate
failed
```

#### Scenario: Dirty after metadata change

Given a saved project is open
When the user changes metadata
Then the project becomes dirty.

#### Scenario: Needs regenerate after generation input change

Given a generated project is open
When the user changes source, audio, selected tracks, metadata or offset
Then output status becomes `needs-regenerate`.

---

### Requirement: Missing project files are detected

CHDG Desktop SHALL show missing path warnings when saved source/audio/output paths no longer exist.

#### Scenario: Missing source

Given a project references a source file that no longer exists
When the project is opened
Then the UI shows a missing source warning
And generation is blocked until the user selects a valid source.

---

### Requirement: FFmpeg path can be configured and tested

CHDG Desktop SHALL allow configuring and testing FFmpeg availability.

#### Scenario: Test configured FFmpeg

Given the user configured an FFmpeg path
When they click Test FFmpeg
Then the app reports whether FFmpeg is available.

#### Scenario: FFmpeg from PATH

Given no configured FFmpeg path exists
When diagnostics run
Then the app attempts to detect FFmpeg from PATH where feasible.

---

### Requirement: Existing Desktop Generate MVP remains functional

Phase 12 SHALL preserve the Phase 11 generation workflow.

#### Scenario: Generate after loading project

Given a valid project has been loaded
When the user generates
Then CHDG creates `notes.chart`, `song.ini`, and `song.ogg` as before.

## MODIFIED Requirements

### Requirement: Desktop workflow becomes project-aware

Existing Phase 11 desktop screens are modified to read/write project state instead of only in-memory generation state.

## REMOVED Requirements

None.
