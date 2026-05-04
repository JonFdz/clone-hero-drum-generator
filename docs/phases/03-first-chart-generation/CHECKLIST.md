# Checklist Phase 03: First Chart Generation

    ## Before implementation

    - [ ] Read `AGENTS.md`.
    - [ ] Read `docs/implementation/implementation-plan.md`.
    - [ ] Read this phase PRD.
    - [ ] Read this phase ADR.
    - [ ] Inspect relevant files.

    ## Implementation

    - [ ] Implement generate command
- [ ] Read MIDI
- [ ] Normalize DrumHit objects
- [ ] Map hits to Clone Hero lanes
- [ ] Write notes.chart
- [ ] Write song.ini
- [ ] Create output directory

    ## Validation

    - [ ] pnpm chdg -- generate samples/demo.mid --out output/demo
- [ ] output/demo/notes.chart exists
- [ ] output/demo/song.ini exists
- [ ] Moonscraper opens chart
- [ ] Clone Hero detects ExpertDrums

    ## Completion

    - [ ] `pnpm build` passes.
    - [ ] `pnpm typecheck` passes.
    - [ ] Docs updated if behavior changed.
    - [ ] No copyrighted MIDI/audio committed.
