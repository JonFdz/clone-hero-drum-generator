# Checklist Phase 02: Drum Normalization

    ## Before implementation

    - [ ] Read `AGENTS.md`.
    - [ ] Read `docs/implementation/implementation-plan.md`.
    - [ ] Read this phase PRD.
    - [ ] Read this phase ADR.
    - [ ] Inspect relevant files.

    ## Implementation

    - [ ] Define or extend DrumHit types
- [ ] Map MIDI note numbers to DrumPiece
- [ ] Preserve tick, velocity, note number, channel and track
- [ ] Report unknown notes
- [ ] Keep pure functions testable

    ## Validation

    - [ ] A debug command or inspection mode prints normalized hits
- [ ] Unknown notes are not silently dropped
- [ ] Mapping changes require only data/config updates

    ## Completion

    - [ ] `pnpm build` passes.
    - [ ] `pnpm typecheck` passes.
    - [ ] Docs updated if behavior changed.
    - [ ] No copyrighted MIDI/audio committed.
