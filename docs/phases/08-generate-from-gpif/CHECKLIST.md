# Checklist Phase 08: Generate from GPIF

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/implementation/implementation-plan.md`.
- [ ] Read Phase 06 docs.
- [x] Read Phase 07 docs.
- [x] Read OpenSpec artifacts for `phase-08-generate-from-gpif`.
- [x] Inspect current `generate` command.
- [x] Inspect GPIF normalization API.
- [x] Inspect chart/audio/song writers.

## Implementation

- [x] Allow `generate` to accept `.gp` input.
- [x] Detect source type deterministically.
- [x] Route `.mid` / `.midi` to existing MIDI path.
- [x] Route `.gp` to GPIF normalization path.
- [x] Require/validate `--track` for `.gp`.
- [x] Reuse existing `DrumHit[]` mapping flow.
- [x] Reuse existing chart writer.
- [x] Reuse existing `song.ini` writer.
- [x] Reuse existing audio packaging.
- [x] Surface GPIF unknown articulations/warnings.
- [x] Preserve existing MIDI generation behavior.
- [x] Do not implement `generate-gp` unless explicitly justified.

## Tests

- [x] Existing MIDI generate tests still pass.
- [x] Synthetic GPIF input can generate chart model/output.
- [x] `.gp` generation writes `notes.chart`.
- [x] `.gp` generation writes `song.ini`.
- [x] `.gp` generation writes/copies/converts `song.ogg` when audio source is provided.
- [x] Unknown GPIF articulations are surfaced.
- [x] Unsupported extension fails clearly.
- [x] `.gp` with invalid track fails clearly.
- [x] No copyrighted `.gp`, MIDI or audio fixtures committed.

## Validation

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] Optional local `.gp` generation validation recorded if sample exists.
    - `pnpm chdg inspect-gp /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp`
    - `pnpm chdg normalize-gp-drums /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp --track 3`
    - `pnpm chdg generate /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp --track 3 --audio-source /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mp3 --out /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo-gp`
    - Generated `notes.chart`, `song.ini`, and `song.ogg`; chart contains `ExpertDrums`, `B 147000`, yellow/green cymbal modifiers and yellow accent open hi-hat modifiers.
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
