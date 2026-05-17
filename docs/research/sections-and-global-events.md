# Research: Sections and Global Events

## Status

Accepted as project research for a future implementation phase.

## Why this matters

Clone Hero / Moonscraper charts can contain global song sections. These are useful for:

- navigation in Moonscraper;
- readable generated charts;
- future desktop preview/navigation;
- future GPIF import fidelity;
- future user-edited arrangement structure.

CHDG should support sections as first-class shared metadata rather than treating them as editor-only output.

## Confirmed `.chart` representation

Sections are stored in the global `[Events]` block as events whose text starts with `section`.

Example:

```chart
[Events]
{
  768 = E "section Guitar Intro"
  6144 = E "section Intro A"
}
```

The section name is the text after `section`.

Recommended internal representation:

```ts
export type SongSection = {
  tick: number;
  name: string;
};
```

Recommended `DrumChart` extension:

```ts
export type DrumChart = {
  resolution: number;
  tempos: TempoEvent[];
  timeSignatures: TimeSignatureEvent[];
  sections: SongSection[];
  expertDrums: CloneHeroDrumNote[];
};
```

## Reference chart analysis

The uploaded reference `notes.chart` contains semantic sections in `[Events]`.

Observed sections:

```txt
tick 768     bar 2    Guitar Intro
tick 6144    bar 9    Intro A
tick 13056   bar 18   Intro B
tick 19200   bar 26   Pre-Verse 1
tick 25344   bar 34   Verse 1A
tick 31488   bar 42   Verse 1B
tick 34560   bar 46   Pre-Chorus 1
tick 40704   bar 54   Chorus 1A
tick 46848   bar 62   Chorus 1B
tick 52992   bar 70   Verse 2A
tick 59136   bar 78   Verse 2B
tick 62208   bar 82   Pre-Chorus 2
tick 68352   bar 90   Chorus 2A
tick 74496   bar 98   Chorus 2B
tick 80640   bar 106  Interlude
tick 83712   bar 110  Breakdown
tick 89856   bar 118  Chorus 3A
tick 96000   bar 126  Chorus 3B
tick 102144  bar 134  Outro
```

These are true semantic sections, not merely measure markers.

## Demo MIDI analysis

The current local demo MIDI was inspected for raw MIDI meta events.

Findings:

- The MIDI contains track names and instrument names.
- It contains repeated `marker` meta-events named `MEASURE_0`, `MEASURE_1`, etc.
- It contains `END_OF_VOICE`.
- It does not appear to contain semantic song sections such as `Intro`, `Verse`, `Chorus`, `Bridge`, or `Outro`.

Conclusion:

```txt
The demo MIDI does not provide useful semantic sections.
```

It has measure markers, but those should not be imported as song sections.

## MIDI extraction notes

MIDI can contain useful section-like metadata as meta-events:

```txt
0x01 Text Event
0x03 Track Name
0x06 Marker
0x07 Cue Point
```

Potential section candidates:

```txt
Intro
Verse
Chorus
Bridge
Solo
Breakdown
Outro
section Intro
section Verse 1
```

But not every marker is a section. Some files contain generated technical markers:

```txt
MEASURE_0
MEASURE_1
END_OF_VOICE
```

These should be filtered out or reported separately.

## Current CHDG limitation

The current MIDI reader uses `@tonejs/midi` for PPQ, tempos, time signatures, tracks and notes. It does not currently return raw marker/text/cue meta-events.

To reliably support MIDI sections, CHDG probably needs one of:

1. A lower-level MIDI meta-event parser.
2. An additional dependency such as `midi-file` for raw MIDI event access.
3. A small internal parser for meta-events only.

Recommended approach for the phase:

```txt
Keep @tonejs/midi for notes/tempos/time signatures.
Add a focused raw meta-event reader for marker/text/cue events.
```

## MIDI section import policy

Recommended classification:

### Import as section

A marker/text/cue may become a section if:

- it is semantic;
- it has a non-empty cleaned name;
- it is not a generated technical marker;
- it is not a duplicate at the same tick/name.

Examples:

```txt
Intro
Verse
Verse 1
Chorus
Bridge
Solo
Breakdown
Outro
section Intro
```

### Ignore as section

Do not import as semantic sections:

```txt
MEASURE_0
MEASURE_1
END_OF_VOICE
END
Start
```

These may be exposed later as raw markers if useful.

## GPIF expectation

GPIF is likely to be a better source for semantic sections than MIDI when the `.gp` file contains arrangement markers.

Phase 06 should inspect GPIF for section-like structures such as:

```txt
master bars
markers
rehearsal marks
sections
directions
```

Exact XML element names should be verified against real `.gp` files during GPIF inspection.

## Recommended next phase

Create a focused phase before or alongside GPIF inspection:

```txt
Phase 05B — Sections and Global Events
```

Scope:

- Add `SongSection` to core.
- Add `sections` to generated chart model.
- Write sections to `[Events]` as `E "section ..."` lines.
- Parse sections from `.chart` in tests or fixtures if useful.
- Extract MIDI marker/text/cue events as raw candidates.
- Import semantic MIDI markers as sections.
- Filter generated measure markers.
- Do not yet implement GPIF section import.
- Leave GPIF section extraction for Phase 06 inspection.
