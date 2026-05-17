# PRD Phase 06: GPIF / .gp Inspection

## Final result

CHDG can inspect modern Guitar Pro `.gp` files that contain GPIF XML and print a deterministic report without generating charts.

Expected CLI command:

```bash
pnpm chdg inspect-gp /path/to/song.gp
```

Expected report areas:

```txt
file/container information
GPIF entry path
metadata
tracks
drum track candidates
tempo/time signature information when available
sections/markers when available
drum/percussion/articulation structures when available
warnings/unhandled structures
```

## Why this phase exists

The MIDI-first flow is now validated enough to start supporting `.gp` files.

`.gp`/GPIF can contain richer symbolic information than MIDI:

- track names;
- instrument/drum kit information;
- voices;
- measures/master bars;
- markers/sections;
- tempo maps;
- time signatures;
- drum articulations;
- dynamics.

Before normalizing GPIF drum tracks to `DrumHit[]`, CHDG needs an inspection command that reveals what real `.gp` files contain.

## Scope

- Add a `packages/guitarpro` package.
- Add `inspect-gp <file.gp>` to the CLI.
- Extract GPIF XML from modern `.gp` containers.
- Parse enough XML to inspect metadata, tracks, timing, sections/markers and drum-related structures.
- Detect likely drum track candidates.
- Summarize drum/percussion/articulation structures where possible.
- Report unknown/unhandled structures without crashing.
- Add tests using synthetic/minimal fixtures.
- Keep output deterministic.

## Non-goals

- No GPIF drum normalization to `DrumHit[]`.
- No chart generation from `.gp`.
- No audio packaging changes.
- No desktop UI.
- No section import from GPIF into generated charts yet.
- No support guarantee for old binary `.gp3`, `.gp4`, `.gp5` formats.
- No Songsterr scraping/downloading.
- No copyrighted `.gp` fixtures committed.
- No automatic mapping decisions beyond inspection/candidate reporting.

## Validation

Required:

```bash
pnpm build
pnpm typecheck
pnpm test
```

Optional local validation if sample files exist:

```bash
pnpm chdg inspect-gp /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp
pnpm chdg inspect-gp /Users/jonfdz/Projects/clone-hero-drum-generator/samples/eat-my-dust.gp
```

The command should not create `notes.chart`, `song.ini`, `song.ogg`, or output folders.

## Definition of done

- `packages/guitarpro` exists.
- `inspect-gp` command exists.
- GPIF XML can be extracted from synthetic `.gp` fixtures.
- Unsupported files fail clearly.
- Metadata and tracks can be reported.
- Drum track candidates can be detected conservatively.
- Timing/sections/drum structures are reported when detected or marked unhandled.
- Tests cover extraction and inspection.
- Docs are updated.
