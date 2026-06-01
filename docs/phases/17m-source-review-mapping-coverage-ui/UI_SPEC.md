# UI Spec — Phase 17M Mapping Review

## Overall structure

Mapping Review accordion/card:

```txt
Mapping Review                         [status badge]
Mapped events 412 · Candidate events 28 · Ignored known events 8 · Unknown events 1 · 0 overrides
Atlas 0.1.0 · Sources: 9 mapped, 2 candidates, 1 ignored known, 1 unknown

Candidates are skipped by default. Apply a suggestion only if the sound is important for the playable drum chart.

[Needs review (3)] [Candidates (2)] [Unknown (1)] [Ignored known (1)] [Auto-mapped (9)] [Overrides (0)] [All (13)]

<row list>
```

The exact layout can follow existing CHDG Source Review styling.

## Filter behavior

### Needs review

Includes:

- unresolved candidates;
- unresolved unknowns.

Excludes:

- ignored known;
- auto-mapped;
- override-resolved rows.

### Candidates

Includes all candidate rows, including resolved by override.

### Unknown

Includes all unknown rows, including resolved by override.

### Ignored known

Includes all action `ignore` rows.

### Auto-mapped

Includes action `map` rows without override by default.

If a row is action `map` but has override, it should appear in `Overrides`.

### Overrides

Includes any row with project override.

### All

Includes every mapping row.

## Default filter

When unresolved unknown or unresolved candidate count > 0:

```txt
Needs review
```

Otherwise:

```txt
All
```

If the user changes filter manually, do not constantly reset it while they are interacting.

If mapping state changes because overrides are applied, update reasonably:

- It is acceptable to keep current filter.
- If current filter becomes empty, show “No rows match this filter” rather than force-switching unexpectedly.

## Row anatomy

```txt
[MIDI 44] Pedal Hi-Hat                         [Candidate]
126 hits · first tick 960
Suggested: Closed Hi-Hat · Confidence: medium
Reason: Foot hi-hat/chick may not represent a playable hand note and can over-densify charts.
[Apply suggestion] [Ignore] [Map to...]
```

## Row examples

### Auto-mapped

```txt
[MIDI 36] Bass Drum 1                           [Auto-mapped]
412 hits · first tick 0
Default mapping: Kick
[Keep default] [Override] [Ignore]
```

### Candidate with suggestion

```txt
[MIDI 44] Pedal Hi-Hat                          [Candidate]
126 hits · first tick 480
Suggested: Closed Hi-Hat · Confidence: medium
Reason: Foot hi-hat/chick may not represent a playable hand note.
[Apply suggestion] [Ignore] [Map to...]
```

### Candidate without suggestion

```txt
[MIDI 56] Cowbell                               [Candidate]
8 hits · first tick 30240
No default lane · Confidence: low
Reason: No natural lane; may be important in some songs.
[Map to...] [Ignore]
```

### Ignored known

```txt
[MIDI 54] Tambourine                            [Ignored known]
14 hits · first tick 15360
Known auxiliary percussion recognized but not charted by default.
[Keep ignored] [Map to...]
```

### Unknown

```txt
[MIDI 92] Note 92                               [Unknown]
36 hits · first tick 7680
CHDG does not know what drum lane this note represents.
[Map to...] [Ignore]
```

### Override

```txt
[MIDI 44] Pedal Hi-Hat                          [Override]
126 hits · first tick 480
Mapped by project override: Closed Hi-Hat
[Reset override] [Change mapping] [Ignore]
```

## Button rules

### Keep default / Keep ignored

These can be disabled/static labels if no write is needed.

### Apply suggestion

Only show when:

- `row.action === "candidate"`;
- `row.suggestedPiece` exists;
- no piece override already exists.

Effect:

```txt
set override: target.kind = "piece", piece = row.suggestedPiece
```

### Ignore

Show unless current override is already ignore.

Effect:

```txt
set override: target.kind = "ignore"
```

### Reset override

Show only when override exists.

Effect:

```txt
delete override for row.key
```

### Map to...

Use a select/dropdown of supported pieces:

```txt
Kick
Snare
Closed Hi-Hat
Open Hi-Hat
Crash
Ride
High Tom
Mid Tom
Floor Tom
```

Selecting a piece sets piece override.

## Copy requirements

Show short explanatory copy once near filters:

```txt
Candidates are skipped by default. Apply a suggestion only if the sound is important for the playable drum chart.
```

If there are ignored known rows:

```txt
Known ignored percussion is recognized but not charted by default.
```

If there are unknown rows:

```txt
Unknown notes were skipped because CHDG does not know what drum lane they represent.
```

Avoid long paragraphs.

## Responsive behavior

- Filters may wrap.
- Rows should stack cleanly.
- Actions may wrap.
- Do not create horizontal overflow.
