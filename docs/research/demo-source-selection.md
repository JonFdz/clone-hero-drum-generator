# Demo Source Selection

## Decision

The main CHDG demo should move away from the previous Stairway to Heaven sample and use a more suitable drum validation sample.

Preferred current demo:

```txt
Eat My Dust — Dead Pony
```

## Why Stairway is not ideal as the main demo

The Stairway sample was useful for early proof-of-concept work, but it is not ideal as the main validation sample because:

- drums enter very late in the song;
- much of the chart is empty before drums begin;
- visual validation in Moonscraper can look suspicious even when generation is correct;
- it is better as an edge case than a primary demo.

## Why Eat My Dust is better

Observed from the supplied `demo.mid` and `demo.gp`:

```txt
Song: Eat My Dust
Artist: Dead Pony
Tempo: 147 BPM
Time signature: 4/4
MIDI drum track: 53
Channel: 9
Hits: 1039
Unknown notes: none
```

Normalized drum summary:

```txt
kick: 347
snare: 215
hihat_open: 123
hihat_closed: 99
crash: 232
tom_mid: 14
tom_floor: 9
```

The source is better for validation because:

- drums begin near the start;
- there is one clear MIDI drum track for generation;
- the GP and MIDI appear to align well;
- there are no unknown notes in the selected drum track;
- it contains enough cymbals to validate Phase 05 later;
- generated Phase 03 output has no triples, no exact duplicates and only base notes `N 0` to `N 4`.

## Known issue exposed by this demo

`inspect-midi --drums-only` currently reports multiple strong drum tracks:

```txt
Strong Drum Tracks: 10, 28, 53
```

But only track `53` is the clear MIDI drum track:

```txt
[53] "" (ch 9): 1039 notes
```

Tracks `10` and `28` are drum-like by note numbers but are on channel 5 and have empty names. They should not be classified as strong drum tracks.

Desired behavior:

```txt
Strong Drum Tracks: 53
Weak Drum Candidates: 10, 28
```

or equivalent.

## Action items

- Use track `53` for current Eat My Dust MIDI generation.
- Add or update tests for drum track detection:
  - channel 9 + drum-like notes => strong;
  - empty name + non-channel-9 + drum-like notes => weak, not strong;
  - clear drums/percussion name may still be strong even if channel is non-standard.
- Keep local copyrighted samples out of the repo unless licensing is explicitly safe.
