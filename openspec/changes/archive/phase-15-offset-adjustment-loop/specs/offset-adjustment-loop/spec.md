# Spec: Offset Adjustment Loop

## ADDED Requirements

### Requirement: Preview page shows chart offset controls

CHDG Desktop SHALL show chart offset controls on the Preview page.

#### Scenario: Preview page opened

Given a project is open
When the user opens the Preview page
Then the page shows current chart offset controls.

### Requirement: Offset is edited in milliseconds

The offset UI SHALL use milliseconds.

#### Scenario: Manual input

Given the user enters `900`
When the offset input is applied to preview
Then preview offset is `900 ms`.

### Requirement: Offset converts to chart seconds

When written to `notes.chart`, milliseconds SHALL be converted to seconds.

#### Scenario: Positive offset conversion

Given offset is `900 ms`
When saved to chart
Then `[Song] Offset` is `0.9`.

#### Scenario: Negative offset conversion

Given offset is `-120 ms`
When saved to chart
Then `[Song] Offset` is `-0.12`.

### Requirement: Quick nudge controls exist

The Preview page SHALL provide quick nudge controls.

Required controls:

```txt
-100 ms
-50 ms
-10 ms
+10 ms
+50 ms
+100 ms
```

#### Scenario: Quick nudge

Given preview offset is `0`
When the user clicks `+50 ms`
Then preview offset becomes `50`.

### Requirement: Preview offset applies live without writing files

Changing preview offset SHALL update timeline/highway alignment without writing files.

#### Scenario: Preview-only adjustment

Given the user changes preview offset
When they have not clicked apply/save
Then `.chdg` and `notes.chart` are not written.

### Requirement: Reset/revert exists

The Preview page SHALL allow resetting preview offset to saved offset.

#### Scenario: Revert

Given saved offset is `100`
And preview offset is `250`
When the user clicks reset/revert
Then preview offset becomes `100`.

### Requirement: Apply/save updates project offset

When the user applies offset, CHDG SHALL update project/generation offset state.

#### Scenario: Apply offset to project

Given preview offset is `900`
When the user applies offset
Then project/generation offset is `900`.

### Requirement: Apply/save updates generated chart Offset

When generated `notes.chart` exists and is allowed, applying offset SHALL update only `[Song] Offset`.

#### Scenario: Apply offset to generated chart

Given generated `notes.chart` exists
When the user applies `900 ms`
Then `[Song] Offset` is `0.9`
And note/event ticks are unchanged.

### Requirement: Offset does not shift notes or audio

Offset adjustment SHALL NOT rewrite note/event ticks or modify audio.

#### Scenario: Chart updated

Given a chart has note lines
When offset is applied
Then note/event tick values remain unchanged.

### Requirement: Chart offset update is secure

The renderer SHALL NOT expose arbitrary file writes.

#### Scenario: Arbitrary chart path rejected

Given the renderer requests offset update for a file other than allowed `notes.chart`
When Electron main handles the request
Then the request is rejected.

### Requirement: Existing preview/generation remains functional

Phase 15 SHALL preserve Phase 14A/14B preview, Phase 13 validation, and Phase 11/12 generation/project behavior.

#### Scenario: Generate after offset adjustment

Given the user applied offset
When they return to Generate
Then generation still works.

## MODIFIED Requirements

### Requirement: Preview page applies offset to visual note timing

The existing Preview page timeline/highway views are modified to use preview offset for visual alignment.

## REMOVED Requirements

None.
