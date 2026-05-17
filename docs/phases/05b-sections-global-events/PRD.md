# PRD Phase 05B: Sections and Global Events

## Final result

CHDG can represent song sections internally and write them to generated `.chart` files.

The generated chart can include:

```chart
[Events]
{
  0 = E "section Intro"
  6144 = E "section Verse 1"
  12288 = E "section Chorus 1"
}
```

MIDI files that contain useful semantic marker/text/cue events can import those events as sections.

Technical/generated markers such as `MEASURE_0`, `MEASURE_1`, and `END_OF_VOICE` should not become sections.

## Why this phase exists

Real Clone Hero/Moonscraper charts include sections for arrangement navigation.

The reference chart inspected during research contains 19 semantic sections, including `Intro`, `Verse`, `Chorus`, `Breakdown`, and `Outro`.

The current demo MIDI only contains generated measure markers, so it should not create semantic sections from that file.

## Scope

- Add a shared `SongSection` type.
- Add sections to the chart/domain model.
- Write `[Events]` section entries in `notes.chart`.
- Add tests for section writing.
- Add MIDI raw meta-event extraction for marker/text/cue events.
- Import semantic MIDI marker/text/cue events as sections.
- Filter out measure markers and other technical markers.
- Add CLI inspection output showing section candidates or imported sections.
- Document behavior and limitations.

## Non-goals

- No GPIF section import yet.
- No desktop UI.
- No section editor.
- No automatic AI section detection from audio.
- No Moonscraper automation.
- No lower difficulties.
- No star power/fills.
- No offset support.

## Validation

Required:

```bash
pnpm build
pnpm typecheck
pnpm test
```

Manual validation should confirm generated `.chart` has `[Events]` section lines when sections are provided.

For the current demo MIDI, validation should confirm:

```txt
MEASURE_* markers are not imported as sections.
```

## Definition of done

- `SongSection` exists in shared core types.
- Chart writer outputs sections correctly.
- MIDI meta-events can be inspected.
- Semantic MIDI markers can become sections.
- Generated measure markers are filtered.
- Tests cover writer and MIDI filtering behavior.
- Docs are updated.
