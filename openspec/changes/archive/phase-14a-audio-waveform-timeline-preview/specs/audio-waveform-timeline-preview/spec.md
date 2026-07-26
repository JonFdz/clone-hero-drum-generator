# Spec: Audio + Waveform + Timeline Preview

## ADDED Requirements

### Requirement: Preview page loads local audio safely

CHDG Desktop SHALL provide local audio preview through a secure Electron bridge.

#### Scenario: Generated song audio exists

Given a project has generated `song.ogg`
When the user opens the Preview page
Then the app loads `song.ogg` as the preferred preview audio source.

#### Scenario: Generated song audio is missing but selected audio exists

Given generated `song.ogg` is unavailable
And the project has a selected audio file
When the user opens the Preview page
Then the app may load the selected audio as a safe fallback.

#### Scenario: Arbitrary audio path rejected

Given the renderer requests a preview source for an arbitrary path
When Electron main handles the request
Then the request is rejected.

### Requirement: Audio playback controls exist

The Preview page SHALL provide basic playback controls.

Controls SHALL include:

```txt
play
pause
seek
current time
duration
```

#### Scenario: Play audio

Given preview audio is loaded
When the user clicks Play
Then audio playback starts
And current time advances.

#### Scenario: Pause audio

Given audio is playing
When the user clicks Pause
Then audio playback pauses.

### Requirement: Waveform or waveform-like overview exists

The Preview page SHALL show a waveform or lightweight waveform-like overview.

#### Scenario: Waveform available

Given audio can be decoded or sampled
When the Preview page renders
Then the waveform overview is shown.

#### Scenario: Waveform unavailable

Given waveform data cannot be produced
When the Preview page renders
Then the page shows a clear limited waveform state
And audio playback can still work.

### Requirement: Timeline-style notes exist when data is available

The Preview page SHALL render timeline-style note visualization when chart/hit data is available.

#### Scenario: Notes available

Given generated chart or structured hit data is available
When the Preview page renders
Then notes are shown on a timeline.

#### Scenario: Notes unavailable

Given no chart/hit data is available
When the Preview page renders
Then the page shows a clear empty/limited note timeline state.

### Requirement: Timeline syncs to audio playback

The Preview page SHALL sync playhead position to audio playback.

#### Scenario: Playback advances

Given audio is playing
When time advances
Then the timeline playhead advances.

#### Scenario: Seek timeline

Given the user seeks on the timeline
When seek is supported
Then audio current time updates accordingly.

### Requirement: Notes near current time are highlighted

The Preview page SHALL highlight notes near the current playback time when note timing data is available.

#### Scenario: Current-time note highlight

Given note timing data exists
When playback reaches a note time
Then the nearby note is visually highlighted.

### Requirement: Preview is read-only

The Preview page SHALL NOT support note editing in Phase 14A.

#### Scenario: User views timeline

Given notes are displayed
When the user interacts with preview
Then notes are not added, removed, moved, or edited.

### Requirement: Existing validation/generation remains functional

Phase 14A SHALL preserve Phase 13 validation and Phase 11/12 generation behavior.

#### Scenario: Generate after preview

Given the user has used Preview
When they return to Generate
Then existing generation behavior still works.

## MODIFIED Requirements

### Requirement: Preview page becomes functional

The existing Preview placeholder is modified into a working local audio + timeline preview screen.

## REMOVED Requirements

None.
