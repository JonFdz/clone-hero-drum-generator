# PRD Phase 08: Generate from GPIF

## Final result

CHDG can generate a Clone Hero song package from a modern `.gp` / GPIF file by reusing the same downstream pipeline already validated for MIDI.

Expected command:

```bash
pnpm chdg generate /path/to/song.gp --track <index> --audio-source /path/to/audio.mp3 --out /path/to/output
```

For local validation:

```bash
pnpm chdg generate /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp --track 3 --audio-source /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mp3 --out /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo-gp
```

The command should generate:

```txt
notes.chart
song.ini
song.ogg
```

## Why this phase exists

Phase 06 made `.gp` / GPIF inspectable.

Phase 07 made a selected GPIF drum track normalizable into the shared `DrumHit[]` model.

The next logical step is to connect that GPIF normalization path to the existing chart/audio generation pipeline.

Target flow:

```txt
.gp
  -> GPIF extraction
  -> selected drum track normalization
  -> DrumHit[]
  -> Clone Hero Pro Drums notes
  -> notes.chart
  -> song.ini
  -> song.ogg
```

## Scope

- Allow `generate` to accept `.gp` input.
- Detect input type by extension or source parser.
- For `.gp`, use `normalizeGpDrums`.
- Reuse existing `DrumHit[] -> Clone Hero Pro Drums -> chart` path.
- Reuse existing audio packaging path.
- Reuse existing `song.ini` writer.
- Preserve Pro Drums cymbals, dynamics, open hi-hat and sections behavior where available.
- Produce deterministic output.
- Add tests with synthetic/minimal GPIF fixtures only.
- Do not commit copyrighted `.gp`, MIDI or audio fixtures.

## Non-goals

- No desktop UI.
- No automatic track selection.
- No GPIF multi-track merge.
- No lower difficulties.
- No star power/fills.
- No automatic audio alignment.
- No offset support yet.
- No old binary `.gp3`, `.gp4`, `.gp5` support.
- No Songsterr scraping/downloading.
- No full repeat/alternate-ending expansion beyond what Phase 07 already supports.

## Expected behavior

### `.mid` input

Existing MIDI generation behavior must remain unchanged.

```bash
pnpm chdg generate /path/song.mid --track 53 --audio-source /path/song.mp3 --out /path/output
```

### `.gp` input

New behavior:

```bash
pnpm chdg generate /path/song.gp --track 3 --audio-source /path/song.mp3 --out /path/output
```

should:

- normalize selected GPIF track to `DrumHit[]`;
- map to Clone Hero Pro Drums notes;
- write `notes.chart`;
- write `song.ini`;
- convert/copy audio to `song.ogg`;
- report warnings/unknown GPIF articulations if present.

## Validation

Required:

```bash
pnpm build
pnpm typecheck
pnpm test
```

Optional local validation:

```bash
pnpm chdg inspect-gp /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp
pnpm chdg normalize-gp-drums /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp --track 3
pnpm chdg generate /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp --track 3 --audio-source /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mp3 --out /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo-gp
```

Expected output:

```txt
output/demo-gp/notes.chart
output/demo-gp/song.ini
output/demo-gp/song.ogg
```

Expected chart behavior should match the MIDI-generated baseline closely for the same demo:

```txt
ExpertDrums exists
yellow hihats are cymbals
open hi-hats use yellow cymbal + yellow accent
green crashes are cymbals
ghost/accent flags remain supported
no N 5/orange-lane issue
```

## Definition of done

- `generate` supports `.gp`.
- Existing `.mid` generation still works.
- GPIF path produces `notes.chart`, `song.ini`, `song.ogg`.
- Unknown GPIF articulations are surfaced to the user.
- Tests cover `.gp` generation path with synthetic fixtures.
- Docs/checklist updated.
- No copyrighted fixtures committed.
