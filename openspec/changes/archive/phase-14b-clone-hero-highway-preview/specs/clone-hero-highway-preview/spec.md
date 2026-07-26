# Spec: Clone Hero Highway Preview

## ADDED Requirements

### Requirement: Preview page includes highway view

CHDG Desktop SHALL show a Clone Hero-style highway section on the Preview page.

#### Scenario: Preview page opened

Given the user opens the Preview page
When chart/hit data is available
Then a highway section is visible.

### Requirement: Highway renders drum lanes

The highway SHALL render drum lanes for:

```txt
kick
red
yellow
blue
green
```

#### Scenario: Lanes visible

Given the highway is rendered
Then lane labels for kick, red, yellow, blue, and green are visible.

### Requirement: Highway renders notes from chart data

The highway SHALL render notes when chart/hit data is available.

#### Scenario: Chart notes available

Given generated `notes.chart` preview data is available
When the Preview page renders
Then notes appear on the corresponding highway lanes.

### Requirement: Highway syncs to audio playback

The highway SHALL position notes relative to current audio playback time.

#### Scenario: Audio time advances

Given audio is playing
When current time advances
Then highway note positions update.

### Requirement: Highway has hit line

The highway SHALL show a visible hit line representing the current play moment.

#### Scenario: Hit line visible

Given the highway is rendered
Then a hit line is visible.

### Requirement: Highway represents modifiers when available

The highway SHALL represent modifier states when available.

Modifier states include:

```txt
cymbal
open hi-hat
accent
ghost
```

#### Scenario: Cymbal modifier

Given a yellow/blue/green cymbal modifier exists for a note
When the highway renders
Then the note is visually marked as a cymbal.

#### Scenario: Accent or ghost modifier

Given accent or ghost data exists for a note
When the highway renders
Then the note is visually marked accordingly.

### Requirement: Highway handles limited data gracefully

The highway SHALL show a clear limited state when chart/hit data is unavailable or incomplete.

#### Scenario: No chart data

Given no chart or hit data is available
When the Preview page renders
Then the highway shows a limited/empty state
And audio preview can still work.

### Requirement: Highway is read-only

The highway SHALL NOT support note editing in Phase 14B.

#### Scenario: User interacts with highway

Given notes are shown
When the user interacts with the highway
Then notes are not added, removed, moved, or modified.

### Requirement: Existing behavior remains functional

Phase 14B SHALL preserve Phase 14A preview, Phase 13 validation, and Phase 11/12 generation/project behavior.

#### Scenario: Generate after using highway

Given the user used the highway preview
When they return to Generate
Then generation still works as before.

## MODIFIED Requirements

### Requirement: Preview page gains highway section

The existing Preview page is modified to include a Clone Hero-style highway section.

## REMOVED Requirements

None.
