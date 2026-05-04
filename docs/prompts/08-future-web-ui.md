# Prompt Phase 08: Future Web UI

        Read:

        - `AGENTS.md`
        - `docs/implementation/implementation-plan.md`
        - `docs/phases/08-future-web-ui/PRD.md`
        - `docs/phases/08-future-web-ui/ADR.md`
        - `docs/phases/08-future-web-ui/CHECKLIST.md`

        Implement Phase 08: Future Web UI.

        ## Goal

        A web UI product/technical plan exists, but no frontend dependencies are added yet.

        ## Scope

        - Plan upload screen
- Plan MIDI inspection screen
- Plan mapping editor
- Plan generation settings
- Plan validation report
- Plan export screen

        ## Non-goals

        - Building React/Vite app
- Design system implementation

        ## Architecture constraints

        - Keep CLI orchestration thin.
        - Put domain logic in the appropriate `packages/*` package.
        - Do not hardcode mappings in `apps/cli`.
        - Do not add frontend code unless this is the web planning phase.
        - Do not commit copyrighted MIDI/audio.
        - Update docs when behavior changes.

        ## Validation

        - UI plan references reusable packages
- No UI implementation is added
- No frontend dependency is added

        ## Finish by running

        ```bash
        pnpm build
        pnpm typecheck
        ```
