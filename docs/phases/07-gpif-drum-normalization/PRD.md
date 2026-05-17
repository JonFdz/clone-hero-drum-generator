# PRD Phase 07: GPIF Drum Normalization

## Final result

CHDG can normalize a selected modern `.gp` / GPIF drum track into the shared `DrumHit[]` model and print a deterministic CLI report.

Expected command:

```bash
pnpm chdg normalize-gp-drums <file.gp> --track <index>
```

## Scope

- Add GPIF drum normalization APIs in `packages/guitarpro`.
- Add `normalize-gp-drums` to the CLI.
- Map conservative GPIF percussion/articulation text to existing `DrumPiece` values.
- Preserve deterministic ticks for supported linear bar/voice/beat/note structures.
- Preserve explicit velocity or mapped dynamics when available.
- Report unknown articulations without failing normalization.
- Use synthetic/minimal GPIF fixtures only in tests.

## Supported target pieces

- `kick`
- `snare`
- `hihat_closed`
- `hihat_open`
- `crash`
- `ride`
- `tom_high`
- `tom_mid`
- `tom_floor`

## Non-goals

- No chart generation from `.gp` yet.
- No audio packaging changes.
- No desktop UI.
- No Songsterr scraping/downloading.
- No full repeat or alternate-ending expansion.
- No old binary `.gp3`, `.gp4`, `.gp5` support.
- No automatic drum track merging or difficulty generation.
- No copyrighted `.gp`, MIDI, or audio fixtures committed.

## Validation

Required:

```bash
pnpm build
pnpm typecheck
pnpm test
```

Optional local validation when Jon's ignored sample exists:

```bash
pnpm chdg inspect-gp /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp
pnpm chdg normalize-gp-drums /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp --track 3
```

Track index may be adjusted based on `inspect-gp` output.
