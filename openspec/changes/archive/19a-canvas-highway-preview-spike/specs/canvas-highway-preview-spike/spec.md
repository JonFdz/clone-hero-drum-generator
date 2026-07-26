# Canvas Highway Preview Spike Specification

## ADDED Requirements

### Requirement: Experimental read-only highway mode

The Preview feature SHALL expose a clearly labeled experimental highway mode while retaining the current two-dimensional chart view as the default and supported baseline.

#### Scenario: Open Preview without selecting highway mode

- **GIVEN** a project with Preview data
- **WHEN** the user opens Preview
- **THEN** the existing two-dimensional chart view is selected by default
- **AND** the highway renderer does not continuously redraw in the background.

#### Scenario: Switch visual mode without disturbing playback

- **GIVEN** Preview is playing or paused at a non-zero time
- **WHEN** the user switches between chart and highway modes
- **THEN** current time, playback state, preview offset, section context and timing diagnostics remain unchanged
- **AND** no chart or project data is mutated.

### Requirement: Native Canvas 2D ownership

The highway mode SHALL be rendered by one feature-owned native Canvas 2D element and SHALL not introduce a production graphics framework, engine, WebGL renderer, worker-based rendering path or external rendering dependency.

#### Scenario: Canvas context is available

- **GIVEN** highway mode is active and the browser provides a Canvas 2D context
- **WHEN** the component renders
- **THEN** it draws the road and notes using Canvas 2D primitives only.

#### Scenario: Canvas context is unavailable

- **GIVEN** highway mode is active
- **WHEN** a Canvas 2D context cannot be created
- **THEN** Preview displays a non-fatal limitation state
- **AND** the user can return to the existing chart view
- **AND** chart/project data remains unchanged.

### Requirement: Authoritative playback synchronization

The highway renderer SHALL derive every note position from Preview's authoritative playback time and SHALL not accumulate independent song time from animation frames.

#### Scenario: High refresh-rate display

- **GIVEN** the display refresh rate differs from 60 Hz
- **WHEN** the renderer redraws frames
- **THEN** equivalent playback times yield equivalent projected note positions
- **AND** visual song speed does not depend on callback frequency.

#### Scenario: Pause and seek

- **GIVEN** the highway is visible
- **WHEN** playback pauses or the user seeks
- **THEN** the next draw uses the supplied playback time directly
- **AND** the renderer does not perform catch-up simulation.

### Requirement: Five-lane generated chart representation

The highway SHALL render exactly five drum lanes from the generated chart lane index: kick, red, yellow, blue and green.

#### Scenario: Render generated note events

- **GIVEN** valid generated Preview note events in lanes 0 through 4
- **WHEN** a note is inside the visible highway window
- **THEN** the renderer places it in the corresponding one of five road lanes
- **AND** no additional lane is created for variants not represented in the current payload.

#### Scenario: Missing richer note semantics

- **GIVEN** Preview data does not provide modifier or sustain information
- **WHEN** highway mode renders notes
- **THEN** it renders the conservative base note representation
- **AND** it does not infer unsupported semantics.

### Requirement: Perspective road and note projection

The highway SHALL display a centered trapezoidal road with a horizon, fixed hit line, five lane dividers and time-derived note depth.

#### Scenario: Note reaches hit line

- **GIVEN** a note's effective visual time equals current playback time
- **WHEN** it is projected
- **THEN** it appears at the hit line using maximum configured note scale.

#### Scenario: Note reaches horizon

- **GIVEN** a note is exactly one configured look-ahead interval ahead of playback
- **WHEN** it is projected
- **THEN** it appears at the horizon using minimum configured note scale.

#### Scenario: Note is outside window

- **GIVEN** a note is older than the configured look-behind or later than configured look-ahead
- **WHEN** the frame is generated
- **THEN** it is not sent to the renderer for drawing.

### Requirement: Configurable visual speed

The highway SHALL provide in-memory Fast, Normal and Slow visual-speed presets that change only look-ahead projection.

#### Scenario: Change visual speed

- **GIVEN** highway mode is active
- **WHEN** the user selects Fast, Normal or Slow
- **THEN** note depth and visible window change according to the preset
- **AND** audio speed, current time, chart data and project data do not change.

### Requirement: Musical timing display

When generated tempo and time-signature data are usable, the highway SHALL show beat lines, stronger measure lines and a HUD containing tick, beat and measure.

#### Scenario: Complete timing map

- **GIVEN** resolution, initial tempo and initial legal time signature are available
- **WHEN** playback advances through known timing fixtures
- **THEN** tick, beat and measure match the documented timing conversion
- **AND** measure lines replace beat lines at shared ticks.

#### Scenario: Incomplete timing map

- **GIVEN** timing data is insufficient for a trustworthy musical position
- **WHEN** highway mode is active
- **THEN** notes still render from supplied note seconds
- **AND** unavailable musical fields display an explicit unavailable state
- **AND** the renderer does not fabricate beat or measure lines.

### Requirement: High-DPI and resize correctness

The Canvas SHALL resize using CSS dimensions and a capped device-pixel ratio while retaining CSS-pixel projection math.

#### Scenario: Resize

- **GIVEN** the highway container changes size
- **WHEN** the resize observer runs
- **THEN** the Canvas backing-store dimensions are recalculated from CSS size and effective DPR
- **AND** the road remains centered and legible.

#### Scenario: High-DPI display

- **GIVEN** the browser reports a device pixel ratio above one
- **WHEN** highway mode renders
- **THEN** output is not intentionally blurred by a CSS/backing-store mismatch
- **AND** effective DPR is capped at two for this spike.

### Requirement: Lifecycle cleanup

The component SHALL cancel pending animation work and disconnect observation resources when no longer active.

#### Scenario: Destroy component

- **GIVEN** a pending animation frame and active resize observer exist
- **WHEN** the highway component is destroyed
- **THEN** the animation frame is cancelled
- **AND** the resize observer is disconnected
- **AND** no chart or playback state is mutated during cleanup.

### Requirement: Reduced motion and accessible summary

The highway SHALL preserve an understandable Preview state when reduced motion is preferred and SHALL expose a compact non-canvas summary.

#### Scenario: Reduced motion preference

- **GIVEN** reduced motion is preferred
- **WHEN** the highway is visible
- **THEN** it does not retain a continuous visual redraw loop solely for animation
- **AND** playback controls and non-canvas Preview information remain available.

#### Scenario: Accessible limitation summary

- **GIVEN** timing information is incomplete or the canvas is compact
- **WHEN** the limitation is shown
- **THEN** an accessible text summary communicates the current mode and limitation
- **AND** it does not announce every animation frame.

### Requirement: No editing or persistence

The spike SHALL not provide any chart-editing capability or persistence behavior.

#### Scenario: User interacts with highway mode

- **GIVEN** highway mode is active
- **WHEN** the user clicks, resizes, changes speed or hides the HUD
- **THEN** no note is selected for editing
- **AND** no chart command, project write, overlay write or output rewrite occurs.
