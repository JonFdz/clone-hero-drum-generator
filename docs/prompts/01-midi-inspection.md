# Prompt Phase 01: MIDI Inspection

        Read:

        - `AGENTS.md`
        - `docs/implementation/implementation-plan.md`
        - `docs/phases/01-midi-inspection/PRD.md`
        - `docs/phases/01-midi-inspection/ADR.md`
        - `docs/phases/01-midi-inspection/CHECKLIST.md`

        Implement Phase 01: MIDI Inspection.

        ## Goal

        The CLI can inspect a MIDI file and print useful information for mapping and validation.

        ## Scope

        - Add MIDI parser dependency
- Read MIDI PPQ/resolution
- Read tracks and names
- Read channels
- Read tempo events
- Read time signatures
- Aggregate note numbers and velocities
- Guess drum pieces using mapping JSON

        ## Non-goals

        - Generate notes.chart
- Normalize to final chart model
- UI

        ## Architecture constraints

        - Keep CLI orchestration thin.
        - Put domain logic in the appropriate `packages/*` package.
        - Do not hardcode mappings in `apps/cli`.
        - Do not add frontend code unless this is the web planning phase.
        - Do not commit copyrighted MIDI/audio.
        - Update docs when behavior changes.

        ## Validation

        - pnpm chdg --inspect-midi samples/demo.mid
- Output shows note counts and velocity stats
- Unknown notes are visible
- No chart files are generated

        ## Finish by running

        ```bash
        pnpm build
        pnpm typecheck
        ```
