# Spec: Real Waveform Preview

## ADDED Requirements

### Requirement: Preview displays a real waveform

Preview SHALL display waveform data derived from the current audio source.

#### Scenario: Supported audio file

Given a project has a supported audio file
When the user opens Preview
Then the waveform is derived from that audio file
And it is not a placeholder pattern.

### Requirement: Waveform aligns with audio duration

Waveform rendering SHALL align with the audio duration and playhead.

#### Scenario: Playback

Given waveform data is loaded
When the user plays audio
Then the playhead moves over the waveform according to the current audio time.

### Requirement: Waveform handles loading state

Preview SHALL show a loading state while waveform data is being prepared.

#### Scenario: Loading

Given waveform extraction is in progress
When Preview is shown
Then the UI indicates waveform loading.

### Requirement: Waveform handles decode failures

Preview SHALL handle waveform decode failures without crashing.

#### Scenario: Decode failure

Given waveform extraction fails
When Preview is shown
Then an error/unavailable message is displayed
And the rest of Preview remains usable where possible.

### Requirement: Existing preview features remain functional

The waveform change SHALL preserve existing preview, highway, timeline, and offset behavior.

#### Scenario: Offset adjustment

Given waveform is displayed
When the user adjusts chart offset
Then existing offset preview behavior still works.

## MODIFIED Requirements

### Requirement: Placeholder waveform is replaced

The existing placeholder waveform/overview is modified to use real audio-derived waveform data for supported audio.

## REMOVED Requirements

None.
