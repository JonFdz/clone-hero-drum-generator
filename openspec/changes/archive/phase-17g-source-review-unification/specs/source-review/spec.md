# Source Review Specification Delta

## ADDED Requirements

#### Requirement: Source Review route

CHDG Desktop SHALL provide a single user-facing Source Review route for reviewing source analysis, selected tracks, normalized preview, mapping review, and source-related issues before generation.

##### Scenario: Sidebar shows unified Source Review

- **GIVEN** the desktop app sidebar is rendered
- **WHEN** the Phase 17G navigation is active
- **THEN** the sidebar shows `Source Review`
- **AND** it does not show `Inspect Source`, `Track Selection`, or `Mapping` as separate navigation items.

##### Scenario: Old routes do not remain separate user-facing screens

- **GIVEN** a user navigates to `/inspect-source`, `/track-selection`, or `/mapping`
- **WHEN** compatibility routing is enabled
- **THEN** the user is redirected to `/source-review`.

#### Requirement: Source Review input scope

Source Review SHALL require only a supported source file and SHALL NOT require audio or output folder to run or display source review.

##### Scenario: Source Review runs without audio or output

- **GIVEN** a project has `sourcePath`
- **AND** does not have `audioPath` or `outputDir`
- **WHEN** the user opens `/source-review`
- **THEN** the app can inspect and normalize the source
- **AND** the screen does not block on missing audio/output.

#### Requirement: Automatic source review

Source Review SHALL automatically inspect and normalize when a valid source exists and no valid cached analysis is available.

##### Scenario: First entry with no valid cache

- **GIVEN** a project has a supported source file
- **AND** the project has no valid source review cache
- **WHEN** the user opens `/source-review`
- **THEN** CHDG starts source review automatically
- **AND** inspects the source
- **AND** selects exactly one strongest track by default
- **AND** normalizes the selected track
- **AND** displays the ready Source Review state.

##### Scenario: User does not press Normalize Preview

- **GIVEN** source review is running or ready
- **WHEN** the user views the page
- **THEN** no required `Normalize Preview` action is needed to populate the normalized preview.

#### Requirement: Default track selection

For a new source with no manual saved selection, Source Review SHALL select exactly one strongest candidate by default.

##### Scenario: Strongest candidate auto-selected

- **GIVEN** source inspection returns multiple track candidates
- **AND** one candidate is strongest according to existing candidate ranking
- **WHEN** Source Review analyzes a new source
- **THEN** exactly one track is selected by default
- **AND** the selected track is the strongest candidate.

##### Scenario: Manual selection is preserved

- **GIVEN** the user changes selected tracks manually
- **WHEN** the user remains on the same source
- **THEN** CHDG preserves the manual selected tracks
- **AND** does not reapply the strongest-only default.

##### Scenario: Source change resets manual selection

- **GIVEN** the user previously selected tracks manually
- **WHEN** the source file changes
- **THEN** CHDG invalidates the old selection
- **AND** selects exactly one strongest candidate for the new source.

#### Requirement: Automatic re-normalization

Source Review SHALL re-normalize automatically when selected tracks or mapping overrides change.

##### Scenario: Track selection changes

- **GIVEN** Source Review is ready
- **WHEN** the user selects or deselects a track
- **THEN** CHDG re-normalizes automatically
- **AND** updates Combined Summary, Piece Summary Preview, Mapping Review, and Issues.

##### Scenario: Mapping override changes

- **GIVEN** Source Review is ready
- **WHEN** the user changes a mapping override or applies a profile
- **THEN** CHDG re-normalizes automatically
- **AND** updates Combined Summary, Piece Summary Preview, Mapping Review, and Issues.

#### Requirement: Analysis cache persistence

CHDG SHALL persist a complete optional analysis cache in `.chdg` when possible.

##### Scenario: Valid cache persists and reloads

- **GIVEN** Source Review completes successfully
- **AND** the project has a `projectFilePath`
- **WHEN** the project is saved or autosaved
- **THEN** the `.chdg` file contains a valid analysis cache
- **AND** reopening the project can restore cached inspection and normalization preview.

##### Scenario: Old projects remain valid

- **GIVEN** a `.chdg` project file does not contain `analysis`
- **WHEN** the project is opened
- **THEN** the project opens successfully
- **AND** Source Review can rebuild analysis when needed.

##### Scenario: Malformed cache does not block project open

- **GIVEN** a `.chdg` project file contains malformed `analysis`
- **WHEN** the project is opened
- **THEN** the project still opens
- **AND** the invalid analysis cache is ignored or dropped safely.

#### Requirement: Cache invalidation

CHDG SHALL invalidate analysis cache based on source and mapping fingerprints.

##### Scenario: Source fingerprint mismatch invalidates complete cache

- **GIVEN** the project has cached analysis
- **AND** the current source fingerprint differs from the cached fingerprint
- **WHEN** Source Review opens or refreshes
- **THEN** cached inspection and normalization are not reused
- **AND** source review runs again.

##### Scenario: Mapping fingerprint mismatch invalidates normalization

- **GIVEN** the project has cached inspection and normalization
- **AND** the current mapping fingerprint differs from the cached mapping fingerprint
- **WHEN** Source Review opens or refreshes
- **THEN** cached normalization is not reused
- **AND** CHDG re-normalizes using current mapping overrides.

#### Requirement: Source Review screen layout

Source Review SHALL match the provided Phase 17G mockups and remain consistent with the existing CHDG desktop visual system.

##### Scenario: Default collapsed layout

- **GIVEN** Source Review is up to date and mapping/issues are clean
- **WHEN** the screen is rendered on a desktop-sized window
- **THEN** it shows the header, Selected Source card, Source Summary, Combined Summary, Piece Summary Preview, Track Candidates, Mapping Review collapsed, Issues & Warnings collapsed, Back to Project Details, and Continue to Generate.

##### Scenario: Expanded attention layout

- **GIVEN** mapping or issues require attention
- **WHEN** the user expands Mapping Review and Issues & Warnings or the screen auto-expands attention sections
- **THEN** it shows the mapping table, active overrides summary, profile actions, and detailed warnings/unknowns.

#### Requirement: Track Candidates table

Source Review SHALL show Track Candidates without a user-facing Role column.

##### Scenario: Track table columns

- **GIVEN** Source Review has inspection results
- **WHEN** Track Candidates are rendered
- **THEN** the table columns are checkbox, Track, Name, Notes, Confidence, and Status
- **AND** no Role column is shown.

#### Requirement: Sections summary

Source Review SHALL show sections only as a summary value in Source Summary.

##### Scenario: Sections detected

- **GIVEN** inspection result includes sections
- **WHEN** Source Summary renders
- **THEN** it shows the count as `N detected`.

##### Scenario: No sections detected

- **GIVEN** inspection result includes no sections
- **WHEN** Source Summary renders
- **THEN** it shows `None detected`.

#### Requirement: Compact Mapping Review

Mapping Review SHALL remain compact by default and SHALL show attention/expand when review is needed.

##### Scenario: Clean mapping state

- **GIVEN** mapping has no unknowns and no active overrides
- **WHEN** Source Review renders
- **THEN** Mapping Review is collapsed and summarizes mapped sources, unknowns, overrides, and profile status.

##### Scenario: Mapping attention state

- **GIVEN** mapping has unknown/unmapped source candidates or active overrides
- **WHEN** Source Review renders
- **THEN** Mapping Review shows attention and can expand to show table, override summary, and profile actions.

#### Requirement: Issues and warnings behavior

Issues & Warnings SHALL be compact when clean and useful when attention is required.

##### Scenario: Clean issues state

- **GIVEN** there are no warnings or unknowns
- **WHEN** Source Review renders
- **THEN** Issues & Warnings is compact and indicates the source review is clean.

##### Scenario: Warning or unknown state

- **GIVEN** there are warnings or unknown source mappings
- **WHEN** Source Review renders the expanded issues state
- **THEN** it lists warnings and unknowns
- **AND** provides Review in Mapping Review actions where useful.

#### Requirement: Generate integration

Generate and Validation SHALL use Source Review as the route for track/chart review actions.

##### Scenario: Generate Back route

- **GIVEN** the user is on Generate
- **WHEN** the user clicks Back
- **THEN** the app navigates to `/source-review`.

##### Scenario: Validation tracks/chart fix route

- **GIVEN** Validation reports a tracks or chart issue
- **WHEN** the user clicks the fix action
- **THEN** the app navigates to `/source-review`.

#### Requirement: Safe async orchestration

Source Review SHALL avoid infinite loops and stale async state updates during inspect/normalize orchestration.

##### Scenario: Stale inspect result is discarded

- **GIVEN** an inspect operation is running
- **AND** the source changes before the operation completes
- **WHEN** the old inspect operation returns
- **THEN** its result is discarded
- **AND** it does not overwrite state for the newer source.

##### Scenario: Stale normalization result is discarded

- **GIVEN** a normalization operation is running
- **AND** selected tracks or mapping overrides change before it completes
- **WHEN** the old normalization operation returns
- **THEN** its result is discarded
- **AND** it does not overwrite newer preview state.
