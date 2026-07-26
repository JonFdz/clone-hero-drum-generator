# Spec: Mapping Override Profiles

## ADDED Requirements

### Requirement: Profiles are stored locally

CHDG Desktop SHALL store mapping override profiles locally.

#### Scenario: Profile persists

Given the user creates a mapping profile
When the app is restarted
Then the profile is still available.

### Requirement: User can create profile from project overrides

CHDG Desktop SHALL allow creating a profile from current project mapping overrides.

#### Scenario: Create profile

Given the current project has mapping overrides
When the user creates a profile named "My MIDI Profile"
Then the profile is saved with those overrides.

### Requirement: User can list profiles

CHDG Desktop SHALL show saved mapping profiles.

#### Scenario: List profiles

Given profiles exist
When the user opens Mapping Profiles
Then the profiles are listed with name and override count.

### Requirement: User can apply profile with replace mode

Applying a profile in replace mode SHALL replace project overrides with profile overrides.

#### Scenario: Replace apply

Given the project has overrides
And a profile has different overrides
When the user applies the profile with replace mode
Then project overrides equal the profile overrides.

### Requirement: User can apply profile with merge mode

Applying a profile in merge mode SHALL merge profile overrides into project overrides.

Profile values SHALL win key conflicts.

#### Scenario: Merge apply conflict

Given the project has `midi:37 -> snare`
And a profile has `midi:37 -> ignore`
When the profile is applied with merge mode
Then project override `midi:37` is `ignore`.

### Requirement: Applying profile marks output stale

Applying a profile SHALL use the same stale behavior as changing mapping overrides manually.

#### Scenario: Apply profile after generation

Given generated output exists
When the user applies a mapping profile
Then project becomes dirty
And generated output is marked needs-regenerate or equivalent stale state.

### Requirement: User can update profile from project overrides

CHDG Desktop SHALL allow replacing a profile's overrides with current project overrides.

#### Scenario: Update profile

Given a profile exists
And current project overrides are changed
When the user updates the profile from current project
Then the profile stores the new overrides.

### Requirement: User can delete profile

CHDG Desktop SHALL allow deleting a local profile.

#### Scenario: Delete profile

Given a profile exists
When the user deletes it
Then it no longer appears in the profile list.

### Requirement: Profiles are not live-linked

Applying a profile SHALL copy overrides into the project.

#### Scenario: Edit profile after apply

Given a profile was applied to a project
When the profile is later edited
Then the project's saved overrides do not change unless the profile is applied again.

### Requirement: Existing workflows remain functional

Phase 16B SHALL preserve project overrides, generation, validation, preview, highway, and offset behavior.

#### Scenario: Generate after applying profile

Given a profile has been applied
When the user generates
Then generation uses the copied project overrides
And validation/preview still work.

## MODIFIED Requirements

### Requirement: Mapping page gains profile management

The existing Mapping workflow is modified to include local profile management and profile application.

## REMOVED Requirements

None.
