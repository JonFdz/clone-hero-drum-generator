# Highway Preview v1 — Requirements

## Requirement: Additive rich Preview note events

Preview SHALL expose each valid raw Expert Drums event with duration endpoint timing while preserving existing Preview data behavior.

### Scenario: Expose tap and sustain timing

- **GIVEN** generated Expert Drums contains `tick = N lane length`
- **WHEN** Preview chart data is parsed
- **THEN** the raw event contains `tick`, `lane`, `length`, `seconds` and `endSeconds`
- **AND** `endSeconds` is calculated from `tick + length` through the generated timing map
- **AND** a zero-length event has `seconds === endSeconds`.

### Scenario: Sustain crosses tempo change

- **GIVEN** a valid note begins before a tempo change and its end tick occurs after that change
- **WHEN** Preview data is parsed
- **THEN** `endSeconds` reflects both tempo segments
- **AND** it is not derived from the start tempo alone.

### Scenario: Preserve raw modifier events

- **GIVEN** generated Expert Drums includes supported or unknown modifier events
- **WHEN** Preview data is parsed
- **THEN** syntactically valid raw modifier events remain available to semantic grouping
- **AND** parsing does not itself create a playable base note from them.

### Scenario: Malformed raw data

- **GIVEN** Expert Drums includes malformed, negative or non-integer note fields
- **WHEN** Preview data is parsed
- **THEN** the invalid event is ignored safely
- **AND** Preview remains available.

## Requirement: Deterministic semantic notes

Highway SHALL derive renderable notes only from valid generated base events and supported same-tick modifiers.

### Scenario: Render base chart identifiers

- **GIVEN** a raw base event on lane `0`, `1`, `2`, `3` or `4`
- **WHEN** Highway semantics are built
- **THEN** one renderable semantic note is produced
- **AND** it preserves chart lane, tick, start/end time and duration.

### Scenario: Kick is a separate visual primitive

- **GIVEN** a raw base event on chart lane `0`
- **WHEN** Highway semantics are built
- **THEN** its visual kind is `kick-rail`
- **AND** it has no pitched-lane identity
- **AND** it is not mapped to a fifth road lane.

### Scenario: Pitched base notes have square default heads

- **GIVEN** a raw base event on chart lane `1`, `2`, `3` or `4` without a compatible cymbal marker
- **WHEN** Highway semantics are built
- **THEN** it maps to red, yellow, blue or green respectively
- **AND** its visual kind is `square-head`.

### Scenario: Render cymbal semantics

- **GIVEN** yellow, blue or green base event has its compatible same-tick marker `66`, `67` or `68`
- **WHEN** Highway semantics are built
- **THEN** the semantic note has `cymbal: true`
- **AND** its visual kind is `cymbal-head`
- **AND** the marker does not render as a separate playable note.

### Scenario: Render supported dynamics

- **GIVEN** a compatible non-kick base event has a same-tick supported accent or ghost marker
- **WHEN** Highway semantics are built
- **THEN** the note receives that dynamic state
- **AND** chart lane, timing, duration and visual shape family remain unchanged.

### Scenario: Resolve dynamic conflict

- **GIVEN** a compatible base event has both supported accent and ghost markers
- **WHEN** Highway semantics are built
- **THEN** it is accent
- **AND** it is not ghost
- **AND** only one playable semantic note exists for that base event.

### Scenario: Ignore orphan or unknown modifiers

- **GIVEN** a modifier has no compatible same-tick base event, or an unknown/special lane value is encountered
- **WHEN** Highway semantics are built
- **THEN** no playable note is created from that entry
- **AND** no exception is thrown
- **AND** no unsupported musical meaning is invented.

### Scenario: Do not infer named articulation

- **GIVEN** a yellow cymbal also has accent
- **WHEN** Highway semantics are built
- **THEN** it remains a yellow cymbal plus accent
- **AND** the UI does not name or infer a separate articulation.

## Requirement: Four pitched lanes plus kick rail

The Highway SHALL render four pitched road lanes—red, yellow, blue and green—and a separate orange kick rail.

### Scenario: Read pitched road geometry

- **GIVEN** Highway has a readable Canvas size
- **WHEN** road geometry is prepared
- **THEN** there are exactly four pitched lane centers and three internal dividers
- **AND** the four fixed hit targets are red, yellow, blue and green
- **AND** no fifth kick target or divider exists.

### Scenario: Render kick rail

- **GIVEN** a `kick-rail` semantic note is visible
- **WHEN** Highway renders it
- **THEN** it is an orange horizontal bar spanning the projected road interior
- **AND** it uses no lane-center placement
- **AND** it remains within road bounds at horizon, mid-road and hit-line depths.

### Scenario: Render square pitched heads

- **GIVEN** a standard/snare/tom-style pitched semantic note is visible
- **WHEN** Highway renders it
- **THEN** it is a square centered in its red, yellow, blue or green pitched lane.

### Scenario: Render circular cymbal heads

- **GIVEN** a cymbal semantic note is visible
- **WHEN** Highway renders it
- **THEN** it is a circle centered in its pitched lane
- **AND** it retains that lane's color identity.

### Scenario: Render dynamic treatments

- **GIVEN** an accent or ghost note is visible
- **WHEN** Highway renders it
- **THEN** accent is visibly emphasized and ghost is visibly subdued
- **AND** neither changes kick rail, square-head or cymbal-head identity.

### Scenario: Dense visible chart window

- **GIVEN** multiple valid base notes are visible
- **WHEN** Highway renders
- **THEN** all valid base notes are represented
- **AND** no playable note is sampled away for appearance
- **AND** only decorative timing lines may use bounded density.

## Requirement: Duration tails are faithful and bounded

### Scenario: Pitched sustain tail

- **GIVEN** a square-head or cymbal-head note has non-zero valid duration
- **WHEN** its duration intersects the visible chart-time window
- **THEN** Highway draws a lane-colored tail inside that pitched lane
- **AND** it draws the tail before its head
- **AND** it clips the tail to valid road geometry.

### Scenario: Kick sustain band

- **GIVEN** a kick rail has non-zero valid duration
- **WHEN** its duration intersects the visible chart-time window
- **THEN** Highway draws a translucent orange road-spanning band between projected endpoints
- **AND** it draws the band before the kick rail
- **AND** it does not manufacture a fifth lane.

### Scenario: Sustain starts outside viewport

- **GIVEN** a note begins before visible chart time but ends inside it
- **WHEN** Highway prepares visible notes
- **THEN** the note remains represented
- **AND** its tail/head geometry is safely clipped.

### Scenario: Invalid endpoint

- **GIVEN** a duration endpoint cannot produce valid finite geometry
- **WHEN** Highway renders
- **THEN** it renders the valid start as a tap/rail safely
- **AND** no false tail/band or out-of-road geometry is shown.

## Requirement: Existing Preview clock remains authoritative

Highway SHALL derive visual state from existing Preview playback time and shall not create an independent playback clock.

### Scenario: Normal playback

- **GIVEN** audio plays and reduced motion is not requested
- **WHEN** Preview time advances
- **THEN** Highway redraws smoothly from that clock
- **AND** does not accumulate song time from frame duration.

### Scenario: Pause and seek

- **GIVEN** Highway is visible
- **WHEN** user pauses or seeks through existing transport controls
- **THEN** Highway promptly renders the paused/sought position
- **AND** chart data is not mutated.

### Scenario: Reduced motion

- **GIVEN** platform requests reduced motion
- **WHEN** audio playback advances and parent `currentTime` updates repeatedly
- **THEN** Highway does not redraw continuously from those updates
- **AND** discrete initial, play, pause, seek, resize, reload, offset, mode, speed and HUD events still refresh.

## Requirement: Timing integrity

Highway SHALL preserve existing timing limitations and not invent musical timing.

### Scenario: Unavailable timing map

- **GIVEN** generated timing lacks a reliable initial tempo map
- **WHEN** Highway is visible
- **THEN** valid notes may render from supplied chart seconds
- **AND** beat/measure HUD values are unavailable
- **AND** static limitation status remains visible.

### Scenario: Invalid metric transition

- **GIVEN** metric validity ends at known tick due to invalid time-signature transition
- **WHEN** playback reaches/passes it
- **THEN** tick may remain visible
- **AND** beat/measure are unavailable
- **AND** no beat/measure line is generated at or after it.

## Requirement: Safe lifecycle, accessibility and phase boundary

### Scenario: Resize and high-DPI canvas

- **GIVEN** container size or DPR changes
- **WHEN** component responds
- **THEN** backing dimensions track CSS dimensions with approved DPR cap
- **AND** four-lane geometry remains aligned.

### Scenario: Component destruction

- **GIVEN** Highway has an active RAF or ResizeObserver
- **WHEN** it is destroyed
- **THEN** RAF is canceled
- **AND** observer disconnects
- **AND** no render loop remains active.

### Scenario: Accessible playback description

- **GIVEN** Highway is visible while playback advances
- **WHEN** time/tick/beat/measure/FPS change per frame
- **THEN** assistive technology is not continuously notified by polite live region
- **AND** stable mode/limitation descriptions remain available.

### Scenario: Dependency, asset and editing audit

- **GIVEN** Phase 19B implementation is complete
- **WHEN** files/dependencies are reviewed
- **THEN** no new external renderer dependency, copied asset, copied code or copied layout exists
- **AND** no editor behavior from Phase 19C+ exists
- **AND** no project/chart mutation occurs
- **AND** no changes occur outside additive Preview data fields unless explicitly required by this specification.
