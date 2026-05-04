# Checklist Phase 01: MIDI Inspection

    ## Before implementation

    - [ ] Read `AGENTS.md`.
    - [ ] Read `docs/implementation/implementation-plan.md`.
    - [ ] Read this phase PRD.
    - [ ] Read this phase ADR.
    - [ ] Inspect relevant files.

    ## Implementation

    - [ ] Add MIDI parser dependency
- [ ] Read MIDI PPQ/resolution
- [ ] Read tracks and names
- [ ] Read channels
- [ ] Read tempo events
- [ ] Read time signatures
- [ ] Aggregate note numbers and velocities
- [ ] Guess drum pieces using mapping JSON

    ## Validation

    - [ ] pnpm chdg -- inspect-midi samples/demo.mid
- [ ] Output shows note counts and velocity stats
- [ ] Unknown notes are visible
- [ ] No chart files are generated

    ## Completion

    - [ ] `pnpm build` passes.
    - [ ] `pnpm typecheck` passes.
    - [ ] Docs updated if behavior changed.
    - [ ] No copyrighted MIDI/audio committed.
