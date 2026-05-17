# PRD Phase 04A: Audio Packaging

## Final result

CHDG can generate a complete local song folder for Moonscraper/Clone Hero validation from:

```txt
MIDI input
+
audio source
```

Output:

```txt
output/song/
  notes.chart
  song.ini
  song.ogg
```

## Why this phase exists

Phase 03 generates `notes.chart` and `song.ini`, but manual validation in Moonscraper shows `No audio` unless the user manually converts/copies audio.

Because CHDG is moving desktop-first, audio processing should happen locally on the user's PC.

## Scope

- Add audio source support to generation.
- Convert common audio inputs to `song.ogg`.
- Copy existing `.ogg` files when possible.
- Keep current `--audio` behavior or rename it clearly.
- Keep CLI support because the desktop app will reuse the same pipeline.
- Prepare for future Electron main-process use.

## Suggested CLI

Preferred:

```bash
pnpm chdg -- generate samples/demo.mid \
  --track 53 \
  --audio-source "/path/to/input.mp3" \
  --out output/demo
```

Expected output:

```txt
output/demo/notes.chart
output/demo/song.ini
output/demo/song.ogg
```

`song.ini` should contain:

```ini
song = song.ogg
```

## Suggested option semantics

- `--audio-source <path>`: real audio file to copy/convert.
- `--audio <filename>`: final audio filename referenced in `song.ini`, default `song.ogg`.

If both are present:

```bash
--audio-source input.mp3 --audio song.ogg
```

then input is converted/copied to:

```txt
output/song/song.ogg
```

## Audio conversion

Default target:

```txt
song.ogg
```

Recommended conversion:

```bash
ffmpeg -i input.mp3 -c:a libvorbis -q:a 6 song.ogg
```

## ffmpeg strategy

For CLI MVP:

- use system `ffmpeg` from `PATH`;
- show a clear error if missing.

For desktop app:

- later bundle ffmpeg or allow user-configured ffmpeg path.

## Non-goals

- No frontend UI in this phase.
- No ffmpeg.wasm.
- No server/cloud processing.
- No audio transcription.
- No audio sync correction.
- No offset detection.
- No Moonscraper automation.

## Validation checklist

- Generates `notes.chart`.
- Generates `song.ini`.
- Generates or copies `song.ogg`.
- `song.ini` references `song.ogg`.
- Existing `.ogg` can be copied without re-encoding.
- Non-`.ogg` audio can be converted if ffmpeg exists.
- Missing ffmpeg produces a helpful error.
- Generated folder opens in Moonscraper without `No audio`.
