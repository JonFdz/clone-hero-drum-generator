# Spec — Generate Output

## ADDED Requirements

### Requirement: Generate attempts cover output

When a project has a cover image, Generate SHALL attempt to create `album.jpg` in the output folder.

#### Scenario: JPG cover succeeds

- **GIVEN** a project has a valid JPG/JPEG cover image
- **WHEN** the user generates output
- **THEN** the output folder contains `album.jpg`
- **AND** chart/audio/ini generation succeeds

### Requirement: Cover output failure is warning-only

Cover output failure SHALL NOT block generation.

#### Scenario: Cover cannot be converted or copied

- **GIVEN** a project has a cover image
- **AND** the cover cannot be prepared as `album.jpg`
- **WHEN** the user generates output
- **THEN** generation still succeeds for `notes.chart`, `song.ini`, and `song.ogg`
- **AND** the result includes a warning explaining that cover output failed
