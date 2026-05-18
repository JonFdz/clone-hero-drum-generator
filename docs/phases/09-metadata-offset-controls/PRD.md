# PRD Phase 09: Metadata and Offset Controls

## Final result

CHDG can generate MIDI and GPIF song packages with user-provided song metadata and a manual synchronization offset.

Expected command shape:

```bash
pnpm chdg generate /path/to/source.gp \
  --track 3 \
  --audio-source /path/to/audio.mp3 \
  --out /path/to/output \
  --name "Eat My Dust" \
  --artist "Dead Pony" \
  --charter "CHDG" \
  --offset-ms 1200
```

The generated package should still contain:

```txt
notes.chart
song.ini
song.ogg
```

## Why this phase exists

The MIDI and GPIF generation flows now work end-to-end, but generated song packages still use limited/default metadata and require manual timing adjustment in Moonscraper for some sources.

Before moving to desktop, CHDG should support the user-facing values that the desktop UI will need to collect: song name, artist, charter, optional album/year/genre, and manual audio/chart offset.

## Scope

- Add metadata options to `generate`.
- Write supported metadata to `song.ini`.
- Add manual offset option to `generate`.
- Apply offset deterministically to generated chart timing or to the supported Clone Hero metadata field, depending on the chosen implementation.
- Preserve existing MIDI and GPIF generation behavior when options are omitted.
- Add tests for argument parsing, song.ini output, and offset behavior.
- Document exact offset semantics.
- Do not implement automatic audio analysis/alignment.

## Metadata options

Recommended options:

```txt
--name <name>
--artist <artist>
--album <album>
--year <year>
--genre <genre>
--charter <charter>
```

Required behavior:

- `--name` should override the generated/default song name.
- `--artist` should override the default `Unknown Artist`.
- Optional fields should only be written if supported by the current `song.ini` writer or if the writer is extended safely.
- Existing behavior should remain unchanged when no metadata options are passed.

## Offset option

Recommended option:

```txt
--offset-ms <milliseconds>
```

The implementation must document the exact convention chosen.

Examples to define:

```txt
--offset-ms 1200
--offset-ms -250
--offset-ms 0
```

The system should reject non-numeric offset values clearly.

## Non-goals

- No automatic offset detection.
- No waveform/audio analysis.
- No beat detection.
- No desktop UI.
- No visual editor.
- No preview player.
- No source-specific offset heuristics.
- No changes to GPIF normalization.
- No changes to MIDI normalization.
- No lower difficulties.
- No star power/fills.

## Expected behavior

Given:

```bash
pnpm chdg generate song.gp --track 3 --audio-source song.mp3 --out output/song --name "Eat My Dust" --artist "Dead Pony" --charter "CHDG"
```

Then `song.ini` should contain the chosen metadata values.

Given:

```bash
pnpm chdg generate song.gp --track 3 --audio-source song.mp3 --out output/song --offset-ms 1200
```

Then generated output should include the offset according to the documented convention.

## Validation

Required:

```bash
pnpm build
pnpm typecheck
pnpm test
```

Optional local validation:

```bash
pnpm chdg generate /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp \
  --track 3 \
  --audio-source /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mp3 \
  --out /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo-gp-meta \
  --name "Eat My Dust" \
  --artist "Dead Pony" \
  --charter "CHDG" \
  --offset-ms 1200
```

Expected output:

```txt
output/demo-gp-meta/notes.chart
output/demo-gp-meta/song.ini
output/demo-gp-meta/song.ogg
```

## Definition of done

- `generate` accepts metadata options.
- `song.ini` writes provided metadata.
- `generate` accepts manual offset option.
- Offset semantics are documented.
- MIDI and GPIF generation still work.
- Tests cover metadata and offset behavior.
- Docs/checklist updated.
