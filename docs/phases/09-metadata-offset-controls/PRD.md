# PRD Phase 09: Metadata and Offset Controls

## Final result

CHDG can generate MIDI and GPIF song packages with user-provided song metadata and a manual chart offset.

Expected command shape:

```bash
pnpm chdg generate /path/to/source.gp \
  --track 3 \
  --audio-source /path/to/audio.mp3 \
  --out /path/to/output \
  --name "Eat My Dust" \
  --artist "Dead Pony" \
  --charter "CHDG" \
  --offset-ms 900
```

The generated package should still contain:

```txt
notes.chart
song.ini
song.ogg
```

## Why this phase exists

The MIDI and GPIF generation flows now work end-to-end, but generated song packages still use limited/default metadata and may require manual timing adjustment in Moonscraper.

Before moving to desktop, CHDG should support the user-facing values that the desktop UI will need to collect:

- song name;
- artist;
- charter;
- optional album/year/genre;
- manual chart offset.

## Scope

- Add metadata options to `generate`.
- Write supported metadata to `song.ini`.
- Add manual offset option to `generate`.
- Write chart offset to `notes.chart`.
- Convert `--offset-ms` from milliseconds to chart seconds.
- Preserve existing MIDI and GPIF generation behavior when options are omitted.
- Add tests for argument parsing, song.ini output, and chart offset output.
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

The value is provided by the user in milliseconds and written to the `.chart` `[Song]` `Offset` field in seconds.

Examples:

```txt
--offset-ms 900  -> Offset = 0.9
--offset-ms 1200 -> Offset = 1.2
--offset-ms -250 -> Offset = -0.25
--offset-ms 0    -> Offset = 0
```

This phase must not shift note/event ticks to apply offset.

The offset should be represented in the chart-level offset field only.

## Non-goals

- No automatic offset detection.
- No waveform/audio analysis.
- No beat detection.
- No desktop UI.
- No visual editor.
- No preview player.
- No source-specific offset heuristics.
- No chart tick shifting for offset.
- No changes to GPIF normalization.
- No changes to MIDI normalization.
- No lower difficulties.
- No star power/fills.

## Expected behavior

### Metadata

Given:

```bash
pnpm chdg generate song.gp --track 3 --audio-source song.mp3 --out output/song --name "Eat My Dust" --artist "Dead Pony" --charter "CHDG"
```

Then `song.ini` should contain the chosen metadata values.

### Offset

Given:

```bash
pnpm chdg generate song.gp --track 3 --audio-source song.mp3 --out output/song --offset-ms 900
```

Then generated `notes.chart` should contain:

```chart
[Song]
{
  ...
  Offset = 0.9
  ...
}
```

The note ticks should not be shifted.

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
  --offset-ms 900
```

Expected output:

```txt
output/demo-gp-meta/notes.chart
output/demo-gp-meta/song.ini
output/demo-gp-meta/song.ogg
```

Expected offset:

```txt
notes.chart contains Offset = 0.9
```

## Definition of done

- `generate` accepts metadata options.
- `song.ini` writes provided metadata.
- `generate` accepts `--offset-ms`.
- `--offset-ms` is converted to chart seconds.
- `notes.chart` writes the converted `Offset`.
- Note/event ticks are not shifted.
- MIDI and GPIF generation still work.
- Tests cover metadata and offset behavior.
- Docs/checklist updated.
