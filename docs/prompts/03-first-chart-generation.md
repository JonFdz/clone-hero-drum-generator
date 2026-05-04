# Prompt Phase 03: First Chart Generation

        Read:

        - `AGENTS.md`
        - `docs/implementation/implementation-plan.md`
        - `docs/phases/03-first-chart-generation/PRD.md`
        - `docs/phases/03-first-chart-generation/ADR.md`
        - `docs/phases/03-first-chart-generation/CHECKLIST.md`

        Implement Phase 03: First Chart Generation.

        ## Goal

        The CLI generates notes.chart and song.ini with ExpertDrums from a MIDI file.

        ## Scope

        - Implement generate command
- Read MIDI
- Normalize DrumHit objects
- Map hits to Clone Hero lanes
- Write notes.chart
- Write song.ini
- Create output directory

        ## Non-goals

        - Lower difficulties
- Advanced Pro Drums flags if not ready
- Web UI

        ## Architecture constraints

        - Keep CLI orchestration thin.
        - Put domain logic in the appropriate `packages/*` package.
        - Do not hardcode mappings in `apps/cli`.
        - Do not add frontend code unless this is the web planning phase.
        - Do not commit copyrighted MIDI/audio.
        - Update docs when behavior changes.

        ## Validation

        - pnpm chdg --generate samples/demo.mid --out output/demo
- output/demo/notes.chart exists
- output/demo/song.ini exists
- Moonscraper opens chart
- Clone Hero detects ExpertDrums

        ## Finish by running

        ```bash
        pnpm build
        pnpm typecheck
        ```

## Important chart encoding rule

For 4-lane Clone Hero drums, serialize lanes as:

```txt
kick   -> N 0
red    -> N 1
yellow -> N 2
blue   -> N 3
green  -> N 4
```

Do not use `N 5` for green in this phase.

## Do not implement yet

Do not implement:

- cymbal flags;
- ghost notes;
- accent notes;
- double kick;
- star power;
- drum fills;
- lower difficulties;
- frontend UI.

Those features belong to later phases.

## Validation requirement

Generated `notes.chart` must be inspected to confirm that standard green drum notes are emitted as:

```txt
N 4
```

not:

```txt
N 5
```
