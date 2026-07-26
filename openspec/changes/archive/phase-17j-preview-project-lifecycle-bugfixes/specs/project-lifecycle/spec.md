# Spec — Project Lifecycle

## ADDED Requirements

### Requirement: Auto-created project folder follows project rename

When a project lives in a CHDG auto-created project folder, changing the project name SHALL rename the folder and `.chdg` file when safe.

#### Scenario: Rename auto-created project

- **GIVEN** a project was created in a CHDG default/auto-created folder
- **WHEN** the user changes the project name
- **THEN** CHDG renames the project folder when safe
- **AND** CHDG renames the `.chdg` file when safe
- **AND** CHDG updates `projectFilePath`
- **AND** CHDG updates default `outputDir` if applicable
- **AND** CHDG updates recents

#### Scenario: Custom path is not renamed

- **GIVEN** a project is stored in a custom user path
- **WHEN** the user changes the project name
- **THEN** CHDG does not rename the containing folder automatically

### Requirement: Project deletion is safe and reliable

Project deletion SHALL avoid deleting arbitrary directories and SHALL clean recents when safe.

#### Scenario: Delete allowed project file

- **GIVEN** a project file is known through allowed paths or recents
- **WHEN** the user deletes the project
- **THEN** the `.chdg` file is deleted
- **AND** recents are cleaned

#### Scenario: Project file already missing

- **GIVEN** a project appears in recents but its file is already missing
- **WHEN** the user deletes/removes it
- **THEN** CHDG handles the missing file gracefully
- **AND** recents are cleaned where safe

#### Scenario: Unsafe folder deletion

- **GIVEN** a folder is not recognized as a CHDG auto-created project folder
- **WHEN** deletion is requested
- **THEN** CHDG does not delete that folder
- **AND** the user receives a clear explanation
