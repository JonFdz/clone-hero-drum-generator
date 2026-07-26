# Spec: Multi-track Normalization / Generation

## ADDED Requirements

### Requirement: CLI accepts multi-track selection

CHDG SHALL support selecting multiple tracks through:

```txt
--tracks <comma-separated-indexes>
```

while preserving existing:

```txt
--track <index>
```

#### Scenario: Single track still works

Given an existing valid command using `--track 3`
When the command runs
Then it behaves as before
And the selected track list is equivalent to `[3]`.

#### Scenario: Multiple tracks parse correctly

Given a command using `--tracks 3,10`
When arguments are parsed
Then the selected track list is `[3, 10]`.

#### Scenario: Track flags conflict

Given a command using both `--track 3` and `--tracks 3,10`
When arguments are parsed
Then CHDG fails with a clear error.

#### Scenario: Invalid tracks fail

Given `--tracks` contains an empty value, duplicate value, or non-integer value
When arguments are parsed
Then CHDG fails with a clear error.

---

### Requirement: Project services support selected track arrays

CHDG SHALL support selected track arrays in `packages/project`.

Single-track inputs SHALL remain supported.

#### Scenario: Single selected track

Given `--track 3` or selected tracks `[3]`
When project services normalize or generate
Then output is equivalent to existing single-track behavior.

#### Scenario: Multiple selected tracks

Given selected tracks `[3, 10]`
When project services normalize or generate
Then hits from both tracks are combined into one output stream.

---

### Requirement: Multi-track normalization works for MIDI and GPIF

CHDG SHALL support multi-track normalization for MIDI and GPIF where feasible.

#### Scenario: MIDI multi-track normalization

Given a MIDI source and selected tracks `[3, 10]`
When normalization runs
Then hits from selected MIDI tracks are normalized and merged.

#### Scenario: GPIF multi-track normalization

Given a GPIF source and selected tracks `[3, 10]`
When normalization runs
Then hits from selected GPIF tracks are normalized and merged.

---

### Requirement: Merged hits preserve timing and avoid averaging

CHDG SHALL NOT average hit timing or velocity during multi-track merge.

#### Scenario: Timing is preserved

Given two selected tracks with hits at ticks `960` and `970`
When the tracks are merged
Then the merged output contains hits at `960` and `970`
And does not replace them with an averaged tick.

#### Scenario: Velocity is not averaged

Given duplicate hits at the same tick and piece with velocities `80` and `100`
When deduplication occurs
Then CHDG keeps a single hit using deterministic strongest-hit behavior
And does not average velocity to `90`.

---

### Requirement: Duplicate hits are deduplicated

CHDG SHALL deduplicate identical hits during multi-track merge.

Identical hits are initially defined as:

```txt
same tick
same drum piece
```

#### Scenario: Duplicate kick

Given track 3 contains kick at tick 960
And track 10 contains kick at tick 960
When the tracks are merged
Then the merged output contains one kick at tick 960
And the merge summary records one duplicate.

---

### Requirement: Conflicting hi-hat states have deterministic priority

CHDG SHALL prefer open hi-hat over closed hi-hat when both occur at the same tick from merged tracks.

#### Scenario: Open hi-hat wins

Given one selected track has closed hi-hat at tick 1000
And another selected track has open hi-hat at tick 1000
When tracks are merged
Then the merged output keeps open hi-hat behavior for that tick
And records a structured issue or merge detail if appropriate.

---

### Requirement: Impossible hand chords are warned, not aggressively simplified

CHDG SHALL detect likely impossible hand chord situations and report structured warnings.

CHDG SHALL NOT aggressively delete or simplify such chords in this phase.

#### Scenario: Three hand notes at same tick

Given merged tracks produce three non-kick hand notes at the same tick
When tracks are merged
Then CHDG reports a structured warning
And does not silently remove notes as an aggressive correction.

---

### Requirement: Merge summary is structured

CHDG SHALL return a structured merge summary for multi-track operations.

The summary SHOULD include:

```txt
selectedTracks
sourceTrackCount
inputHitCount
mergedHitCount
deduplicatedHitCount
duplicateHitCount
impossibleChordCount
issues
```

#### Scenario: JSON generate includes merge summary

Given a generate command with `--tracks 3,10 --json`
When generation succeeds
Then stdout is parseable JSON
And the result includes selected tracks and merge summary.

---

### Requirement: Human output remains useful

Human CLI output SHALL mention multi-track selection and merge summary when multiple tracks are selected.

#### Scenario: Human generate output

Given a generate command with `--tracks 3,10` without `--json`
When generation succeeds
Then human output includes selected tracks and duplicate/warning summary.

---

### Requirement: Existing JSON mode remains clean

CHDG SHALL preserve the Phase 10A JSON guarantees.

#### Scenario: Multi-track JSON output

Given a command with `--tracks 3,10 --json`
When the command runs
Then stdout contains valid JSON only.

## MODIFIED Requirements

### Requirement: Generate and normalize commands accept selected track lists

Existing generate and normalization flows are extended to accept selected track lists while preserving `--track`.

## REMOVED Requirements

None.
