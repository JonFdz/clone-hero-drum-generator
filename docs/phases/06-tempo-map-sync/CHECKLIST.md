# Checklist Phase 06: Tempo Map and Sync

    ## Before implementation

    - [ ] Read `AGENTS.md`.
    - [ ] Read `docs/implementation/implementation-plan.md`.
    - [ ] Read this phase PRD.
    - [ ] Read this phase ADR.
    - [ ] Inspect relevant files.

    ## Implementation

    - [ ] Read all tempo events
- [ ] Read time signatures
- [ ] Write multiple BPM events
- [ ] Preserve tick positions
- [ ] Warn if no tempo exists

    ## Validation

    - [ ] MIDI with tempo changes generates multiple B events
- [ ] Moonscraper shows tempo changes
- [ ] Notes remain aligned to MIDI ticks

    ## Completion

    - [ ] `pnpm build` passes.
    - [ ] `pnpm typecheck` passes.
    - [ ] Docs updated if behavior changed.
    - [ ] No copyrighted MIDI/audio committed.
