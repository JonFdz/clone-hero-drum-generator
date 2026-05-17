# Phase 05 Manual Validation: Moonscraper Pro Drums

## Status

Passed with minor manual offset adjustment.

## Validation target

Local demo:

```txt
Song: Eat My Dust
Artist: Dead Pony
Source MIDI: /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mid
Source audio: /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mp3
Output folder: /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo
```

Generation command:

```bash
pnpm chdg generate /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mid --track 53 --audio-source /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mp3 --out /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo
```

Expected generated files:

```txt
output/demo/notes.chart
output/demo/song.ini
output/demo/song.ogg
```

## Validation result

Moonscraper validation passed.

Confirmed:

- `notes.chart` opens in Moonscraper.
- `song.ogg` loads.
- The chart no longer shows as `No audio`.
- `ExpertDrums` is present.
- Pro Drums cymbal flags display correctly.
- Yellow hihats display as yellow cymbals.
- Green crashes display as green cymbals.
- Toms display as toms, not cymbals.
- No `N 5`/orange lane issue was observed.
- No suspicious repeated triples were observed.
- Sync is reasonable after manually adjusting the start/offset.

## Known manual adjustment

The start of the song needed manual adjustment in Moonscraper.

This is acceptable for the current phase because CHDG does not yet support configurable audio/chart offset.

The issue appears to be a fixed start offset rather than a tempo drift problem.

## Deferred follow-up

Future phase: audio/chart offset support.

Possible requirements:

- Add CLI option such as `--offset-ms`.
- Write the chart/song offset consistently.
- Expose offset in the future desktop UI.
- Allow manual adjustment before final export.
- Document whether the offset should be represented in `[Song] Offset` or by shifting chart events.

## Conclusion

The MIDI-first pipeline is validated end-to-end for the current demo:

```txt
MIDI + MP3
-> inspect
-> normalize
-> generate notes.chart
-> generate song.ini
-> generate song.ogg
-> encode Pro Drums cymbals
-> open and validate in Moonscraper
```

Phase 05 can be considered manually validated for the demo, with offset support deferred.
