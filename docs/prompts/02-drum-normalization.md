# Prompt Phase 02: Drum Normalization

        Read:

        - `AGENTS.md`
        - `docs/implementation/implementation-plan.md`
        - `docs/phases/02-drum-normalization/PRD.md`
        - `docs/phases/02-drum-normalization/ADR.md`
        - `docs/phases/02-drum-normalization/CHECKLIST.md`

        Implement Phase 02: Drum Normalization.

        ## Goal

        MIDI note events are converted into normalized CHDG DrumHit objects.

        ## Scope

        - Define or extend DrumHit types
- Map MIDI note numbers to DrumPiece
- Preserve tick, velocity, note number, channel and track
- Report unknown notes
- Keep pure functions testable

        ## Non-goals

        - Write Clone Hero files
- Tempo map export
- Frontend

        ## Architecture constraints

        - Keep CLI orchestration thin.
        - Put domain logic in the appropriate `packages/*` package.
        - Do not hardcode mappings in `apps/cli`.
        - Do not add frontend code unless this is the web planning phase.
        - Do not commit copyrighted MIDI/audio.
        - Update docs when behavior changes.

        ## Validation

        - A debug command or inspection mode prints normalized hits
- Unknown notes are not silently dropped
- Mapping changes require only data/config updates

        ## Finish by running

        ```bash
        pnpm build
        pnpm typecheck
        ```
