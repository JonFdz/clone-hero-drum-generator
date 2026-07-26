# Spec: Preview Highway UX Redesign

## ADDED Requirements

### Requirement: Preview matches mock 08a

Preview SHALL use `docs/desktop/mockups/08a-preview-highway-redesign.png` as the primary visual target.

#### Scenario: Preview layout

Given the user opens Preview
Then the content area resembles the 08a mock with transport card, 2D chart stage, and offset panel.

### Requirement: Preview is componentized

Preview SHALL be split into focused visual components instead of keeping all chart rendering inside the top-level page component.

#### Scenario: Component boundaries

Given the implementation
Then transport, chart stage, waveform background, lane labels, note layer, playhead, offset panel, and footer stats are separated into focused components or clearly separated equivalent files.

### Requirement: Preview uses one 2D chart stage

Preview SHALL replace the old separate Timeline Notes and rough Highway blocks with one integrated left-to-right chart stage.

#### Scenario: Chart stage

Given chart data is available
When Preview renders
Then notes are shown in a left-to-right time-based lane chart.

### Requirement: Waveform is one global background

Preview SHALL render one waveform background behind all lanes.

#### Scenario: Waveform rendering

Given waveform data is available
When the chart stage renders
Then one waveform is visible behind the lanes
And it is not duplicated per lane.

### Requirement: Drum lanes use canonical order

Preview SHALL render lanes in this order:

```txt
KICK
SNARE
HI-HAT
TOM 1
RIDE
TOM 2
CRASH
TOM 3
```

#### Scenario: Lane labels

Given Preview is open
Then the left label column shows the canonical lane order.

### Requirement: Glyph colors and shapes are canonical

Preview SHALL use required color and shape rules.

#### Scenario: Cymbals

Given hi-hat, ride, or crash notes
Then they render as diamonds.

#### Scenario: Non-cymbals

Given kick, snare, tom_high, tom_mid, or tom_floor notes
Then they render as circles.

### Requirement: Offset behavior is preserved

The redesign SHALL preserve existing offset controls and persistence.

#### Scenario: Apply offset

Given the user changes offset
When they apply it
Then the existing notes.chart/project offset behavior still works.

## MODIFIED Requirements

### Requirement: Old Timeline Notes is no longer primary

The old Timeline Notes panel is replaced or removed as a primary Preview visualization.

## REMOVED Requirements

None.
