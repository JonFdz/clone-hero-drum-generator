# Clone Hero / Moonscraper Drum Chart Format Reference

This document records what CHDG currently knows about Clone Hero / Moonscraper drum chart encoding.

The observations below are based on an inspected real `notes.chart` example and should be validated with Moonscraper and Clone Hero before relying on them for final chart generation.

## Basic sections

A typical chart contains:

```txt
[Song]
[SyncTrack]
[Events]
[ExpertDrums]
```

For the first CHDG milestones, we generate only:

```txt
[Song]
[SyncTrack]
[Events]
[ExpertDrums]
```

Lower difficulties are out of scope for the initial implementation.

## Song metadata

Example:

```txt
[Song]
{
  Name = "Example Song"
  Artist = "Example Artist"
  Charter = "CHDG"
  Offset = 0
  Resolution = 192
  MusicStream = "song.opus"
}
```

Notes:

- `Resolution` controls ticks per quarter note in the `.chart` file.
- If CHDG writes `MusicStream`, it should match the generated/expected audio filename.
- `song.ini` should also reference the real audio file.

## SyncTrack

Example:

```txt
[SyncTrack]
{
  0 = TS 4
  0 = B 195000
}
```

BPM is stored as:

```txt
BPM * 1000
```

So:

```txt
195 BPM -> 195000
```

Time signatures are stored with `TS`.

For 4/4:

```txt
0 = TS 4
```

## ExpertDrums base notes

For 4-lane Clone Hero drums, observed base note encoding is:

```txt
N 0 = kick
N 1 = red / snare
N 2 = yellow
N 3 = blue
N 4 = green
```

Important:

```txt
green = N 4
```

Do not serialize green as `N 5` for 4-lane Clone Hero drums unless a later validated format requires it.

## Cymbal flags

Cymbals are encoded by writing the base lane note plus a cymbal flag at the same tick.

Observed encoding:

```txt
yellow cymbal = N 2 0 + N 66 0
blue cymbal   = N 3 0 + N 67 0
green cymbal  = N 4 0 + N 68 0
```

Example:

```txt
1536 = N 2 0
1536 = N 66 0
```

This represents a yellow cymbal hit.

## Ghost notes

Ghost notes are encoded as a base note plus a ghost flag at the same tick.

Observed encoding:

```txt
red ghost = N 1 0 + N 40 0
```

Other ghost-note lane flags need confirmation before implementation.

Do not invent unconfirmed ghost flags.

## Accent notes

Accent encoding has not yet been confirmed from the inspected chart.

Accent support should remain out of scope until the exact encoding is confirmed with either:

- Moonscraper-generated examples;
- Clone Hero-compatible chart references;
- reliable source-code confirmation.

Do not invent unconfirmed accent flags.

## Double kick

Observed:

```txt
N 32 = double kick / instrument plus kick
```

Double kick is out of scope for the first chart generation milestone unless explicitly required.

## Star power and drum fills

Observed special events:

```txt
S 2  = star power phrase
S 64 = drum activation / drum fill
```

These are out of scope for the first chart generation milestone.

## Current CHDG implementation guidance

Phase 03 should generate only base drum notes:

```txt
kick   -> N 0
red    -> N 1
yellow -> N 2
blue   -> N 3
green  -> N 4
```

Phase 05 should add cymbal/ghost/accent support after validation.

Moonscraper remains a visual/manual validation tool, not a runtime dependency.
