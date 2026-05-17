# Checklist Phase 08: Generate from GPIF

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/implementation/implementation-plan.md`.
- [ ] Read Phase 06 docs.
- [ ] Read Phase 07 docs.
- [ ] Read OpenSpec artifacts for `phase-08-generate-from-gpif`.
- [ ] Inspect current `generate` command.
- [ ] Inspect GPIF normalization API.
- [ ] Inspect chart/audio/song writers.

## Implementation

- [ ] Allow `generate` to accept `.gp` input.
- [ ] Detect source type deterministically.
- [ ] Route `.mid` / `.midi` to existing MIDI path.
- [ ] Route `.gp` to GPIF normalization path.
- [ ] Require/validate `--track` for `.gp`.
- [ ] Reuse existing `DrumHit[]` mapping flow.
- [ ] Reuse existing chart writer.
- [ ] Reuse existing `song.ini` writer.
- [ ] Reuse existing audio packaging.
- [ ] Surface GPIF unknown articulations/warnings.
- [ ] Preserve existing MIDI generation behavior.
- [ ] Do not implement `generate-gp` unless explicitly justified.

## Tests

- [ ] Existing MIDI generate tests still pass.
- [ ] Synthetic GPIF input can generate chart model/output.
- [ ] `.gp` generation writes `notes.chart`.
- [ ] `.gp` generation writes `song.ini`.
- [ ] `.gp` generation writes/copies/converts `song.ogg` when audio source is provided.
- [ ] Unknown GPIF articulations are surfaced.
- [ ] Unsupported extension fails clearly.
- [ ] `.gp` with invalid track fails clearly.
- [ ] No copyrighted `.gp`, MIDI or audio fixtures committed.

## Validation

- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] Optional local `.gp` generation validation recorded if sample exists.
- [ ] Optional Moonscraper validation recorded if performed.

## Deferred

- [ ] Desktop UI.
- [ ] Automatic GPIF track selection.
- [ ] GPIF multi-track merge.
- [ ] Lower difficulties.
- [ ] Star power/fills.
- [ ] Offset support.
- [ ] Old binary GP3/GP4/GP5 support.
- [ ] Songsterr scraping/downloading.
