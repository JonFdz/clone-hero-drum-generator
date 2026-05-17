# Research: Pro Drums Dynamics and Open Hi-Hat Encoding

## Status

Accepted as project research for the next small implementation phase.

## Context

After Phase 05, CHDG correctly emits Clone Hero Pro Drums cymbal modifiers:

```txt
yellow cymbal -> N 66
blue cymbal   -> N 67
green cymbal  -> N 68
```

Manual Moonscraper validation confirmed cymbals display correctly.

Further investigation was requested because real charts appear to distinguish:

```txt
closed hi-hat
open hi-hat
accent/strong hits
ghost/soft hits
```

A reference `notes.chart` was inspected. It contains normal cymbal flags plus accent/ghost flags.

## Confirmed .chart / Moonscraper drum flags

Moonscraper source confirms these drum note flag offsets:

```txt
Pro Drums cymbal offset: 64
Drums accent offset:    33
Drums ghost offset:     39
Instrument plus offset: 32
```

Therefore the relevant note numbers are:

```txt
Cymbals:
yellow -> N 66
blue   -> N 67
green  -> N 68

Accents:
red    -> N 34
yellow -> N 35
blue   -> N 36
green  -> N 37

Ghosts:
red    -> N 40
yellow -> N 41
blue   -> N 42
green  -> N 43
```

Moonscraper also has internal support for:

```txt
ProDrums_Cymbal
ProDrums_Accent
ProDrums_Ghost
DoubleKick / InstrumentPlus
```

## Reference chart findings

The reference chart contains:

```txt
Base notes:
N 0  -> kick
N 1  -> red/snare
N 2  -> yellow
N 3  -> blue
N 4  -> green

Cymbals:
N 66 -> yellow cymbal
N 67 -> blue cymbal
N 68 -> green cymbal

Dynamics:
N 35 -> yellow accent
N 40 -> red ghost
N 41 -> yellow ghost
N 43 -> green ghost
```

The important observation is that `N 35` appears together with:

```txt
N 2 + N 66
```

That means the chart is using:

```txt
yellow base + yellow cymbal + yellow accent
```

This is likely the practical encoding used by many charters to represent open hi-hat or stronger/open yellow cymbal hits.

## Open hi-hat conclusion

No separate `.chart` flag was found for:

```txt
open_hihat
closed_hihat
```

The supported primitives appear to be:

```txt
yellow cymbal
yellow accent
yellow ghost
```

Practical convention:

```txt
hihat_closed -> yellow cymbal
hihat_open   -> yellow cymbal + yellow accent
```

Important distinction:

```txt
open hi-hat is an articulation
accent is a dynamic/gameplay flag
```

Using accent to represent open hi-hat is a charting convention, not a perfect musical model.

## Recommended CHDG model direction

Do not collapse open hi-hat into pure velocity accent internally.

Keep the semantic distinction internally if possible:

```ts
type DrumArticulation = "open_hihat";

type CloneHeroDrumNote = {
  tick: number;
  lane: CloneHeroDrumLane;
  length: number;
  cymbal?: boolean;
  ghost?: boolean;
  accent?: boolean;
  articulation?: DrumArticulation;
};
```

Recommended default writer behavior for `.chart`:

```txt
hihat_closed -> N 2 + N 66
hihat_open   -> N 2 + N 66 + N 35
```

Recommended option name for future configurability:

```txt
openHihatEncoding = "yellow-accent" | "none"
```

Default for Clone Hero/Moonscraper:

```txt
yellow-accent
```

## Dynamics encoding recommendation

Implement chart output for already-supported internal dynamics:

```txt
accent red    -> N 34
accent yellow -> N 35
accent blue   -> N 36
accent green  -> N 37

ghost red     -> N 40
ghost yellow  -> N 41
ghost blue    -> N 42
ghost green   -> N 43
```

Kick accents/ghosts should not be emitted unless explicitly verified, because Moonscraper comments indicate kick accent/ghost are reserved.

## Conflict handling

A note must not emit both ghost and accent.

Current project decision:

```txt
accent wins over ghost
```

When open hi-hat is encoded via yellow accent, this may override a low-velocity open hi-hat being represented as ghost.

Preferred semantic rule for `.chart` MVP:

```txt
open_hihat representation takes precedence over velocity ghost on that same yellow cymbal
```

Reason:

```txt
The purpose is to distinguish open vs closed hi-hat in the game/editor.
```

This should be documented clearly because it is a gameplay/charting convention.

## Recommended next phase

Create a small phase before GPIF:

```txt
Phase 05A — Pro Drums Dynamics and Open Hi-Hat Encoding
```

Scope:

```txt
- Emit accent note flags.
- Emit ghost note flags.
- Keep accent-over-ghost conflict prevention.
- Encode hihat_open as yellow cymbal + yellow accent by default.
- Keep hihat_closed as yellow cymbal.
- Document the convention.
- Add tests for dynamics and open hi-hat.
```

Non-goals:

```txt
- No GPIF import.
- No desktop UI.
- No lower difficulties.
- No automatic Moonscraper automation.
- No audio/chart offset support.
- No unverified open hi-hat-specific chart flag.
