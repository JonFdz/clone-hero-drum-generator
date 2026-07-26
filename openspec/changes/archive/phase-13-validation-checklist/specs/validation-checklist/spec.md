# Spec: Validation Checklist / Pre-Generate Review

## ADDED Requirements

### Requirement: Project validation summary exists

CHDG SHALL provide a structured validation summary for the current desktop project.

The summary SHALL include:

```txt
canGenerate
errorCount
warningCount
infoCount
items
checkedAt
```

#### Scenario: Valid project

Given the current project has valid source, audio, output folder and selected tracks
When validation runs
Then the validation summary has `canGenerate: true`
And has zero blocking errors.

#### Scenario: Invalid project

Given the current project is missing required generation inputs
When validation runs
Then the validation summary has `canGenerate: false`
And includes blocking error items.

### Requirement: Validation items have severity and category

Each validation item SHALL include severity and category.

Required severities:

```txt
error
warning
info
```

Required categories include at least:

```txt
project
source
audio
output
tracks
metadata
offset
ffmpeg
generation
chart
```

#### Scenario: Missing audio

Given the current project has no audio file
When validation runs
Then the summary contains an `audio` category item
And its severity is `error`
And it is blocking.

#### Scenario: Missing recommended metadata

Given the current project has required generation inputs
But has no artist or charter metadata
When validation runs
Then the summary may contain `metadata` warnings
And those warnings do not block generation.

### Requirement: Validation blocks generation only for errors

CHDG Desktop SHALL block generation when validation contains blocking errors.

#### Scenario: Errors block generation

Given validation summary contains one or more blocking errors
When the user attempts to generate
Then generation does not start
And the UI shows the blocking errors.

#### Scenario: Warnings do not block generation

Given validation summary contains warnings but no errors
When the user attempts to generate
Then generation is allowed.

### Requirement: Validation page displays checklist

CHDG Desktop SHALL implement the Validation page as a real checklist.

The page SHOULD show:

```txt
overall status
can generate / cannot generate
errors
warnings
info
categories
fix actions where useful
last checked timestamp
```

#### Scenario: User opens Validation page

Given a project is open
When the user navigates to Validation
Then the validation checklist is displayed.

### Requirement: Pre-generate review is shown on Generate page

CHDG Desktop SHALL show validation status on the Generate page before running generation.

#### Scenario: Generate page with errors

Given the project has blocking validation errors
When the Generate page is shown
Then the page displays the errors
And the Generate action is disabled or blocked.

#### Scenario: Generate page with warnings only

Given the project has warnings but no blocking errors
When the Generate page is shown
Then the page displays the warnings
And allows generation.

### Requirement: Source validation exists

Validation SHALL check source readiness.

Checks include:

```txt
source path exists
source type is supported
source inspection state where available
```

#### Scenario: Source missing

Given a project references a missing source file
When validation runs
Then validation returns a blocking source error.

#### Scenario: Unsupported source

Given a selected source has unsupported extension
When validation runs
Then validation returns a blocking source error.

### Requirement: Audio validation exists

Validation SHALL check audio readiness.

#### Scenario: Audio missing

Given the project has no audio file
When validation runs
Then validation returns a blocking audio error.

#### Scenario: Saved audio path missing

Given a loaded `.chdg` references an audio file that no longer exists
When validation runs
Then validation returns a blocking audio error.

### Requirement: Output validation exists

Validation SHALL check output folder readiness.

#### Scenario: Output missing

Given the project has no output folder
When validation runs
Then validation returns a blocking output error.

#### Scenario: Output has existing known files

Given the output folder contains known CHDG output files
When validation runs
Then validation may return a warning
And generation still uses the existing overwrite confirmation behavior.

### Requirement: Track validation exists

Validation SHALL check selected tracks.

#### Scenario: No selected tracks

Given the project has no selected tracks
When validation runs
Then validation returns a blocking tracks error.

#### Scenario: Multi-track selected

Given the project has multiple selected tracks
When validation runs
Then validation reports selected tracks
And does not fail solely because there are multiple tracks.

### Requirement: FFmpeg validation exists

Validation SHALL include FFmpeg readiness when audio conversion is required.

#### Scenario: FFmpeg unavailable

Given FFmpeg diagnostic reports unavailable
When validation runs
Then validation returns a blocking FFmpeg error.

#### Scenario: FFmpeg available

Given FFmpeg diagnostic reports available
When validation runs
Then validation may include an informational FFmpeg item.

### Requirement: Generation status validation exists

Validation SHALL surface current output status.

#### Scenario: Needs regenerate

Given project output status is `needs-regenerate`
When validation runs
Then validation includes a warning that generated output is stale.

#### Scenario: Generated

Given project output status is `generated`
When validation runs
Then validation may include info that output is current.

### Requirement: Project issues are surfaced

Validation SHALL surface relevant issues from normalization/generation where available.

#### Scenario: Impossible hand chord

Given normalization/merge summary contains impossible hand chord warnings
When validation runs
Then validation includes non-blocking chart warnings.

#### Scenario: Multi-track merge conflicts

Given normalization/merge summary contains duplicate hits or hi-hat conflicts
When validation runs
Then validation includes non-blocking chart warnings.

## MODIFIED Requirements

### Requirement: Generate page respects validation

The existing Generate page is modified to run and display validation before invoking generation.

## REMOVED Requirements

None.
