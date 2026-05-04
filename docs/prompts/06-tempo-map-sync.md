# Prompt Phase 06: Tempo Map and Sync

        Read:

        - `AGENTS.md`
        - `docs/implementation/implementation-plan.md`
        - `docs/phases/06-tempo-map-sync/PRD.md`
        - `docs/phases/06-tempo-map-sync/ADR.md`
        - `docs/phases/06-tempo-map-sync/CHECKLIST.md`

        Implement Phase 06: Tempo Map and Sync.

        ## Goal

        MIDI tempo and time-signature events are preserved in notes.chart SyncTrack.

        ## Scope

        - Read all tempo events
- Read time signatures
- Write multiple BPM events
- Preserve tick positions
- Warn if no tempo exists

        ## Non-goals

        - Audio beat detection
- Manual tempo editing UI

        ## Architecture constraints

        - Keep CLI orchestration thin.
        - Put domain logic in the appropriate `packages/*` package.
        - Do not hardcode mappings in `apps/cli`.
        - Do not add frontend code unless this is the web planning phase.
        - Do not commit copyrighted MIDI/audio.
        - Update docs when behavior changes.

        ## Validation

        - MIDI with tempo changes generates multiple B events
- Moonscraper shows tempo changes
- Notes remain aligned to MIDI ticks

        ## Finish by running

        ```bash
        pnpm build
        pnpm typecheck
        ```
