# Checklist Phase 04A: Audio Packaging

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/implementation/implementation-plan.md`.
- [ ] Read this phase PRD.
- [ ] Read this phase ADR.
- [ ] Inspect current `generate` command.
- [ ] Inspect current `song.ini` writer.

## Implementation

- [ ] Add `--audio-source <path>` to generate command.
- [ ] Preserve or clarify existing `--audio <filename>` behavior.
- [ ] Create audio preparation logic.
- [ ] Copy `.ogg` inputs to final audio file when possible.
- [ ] Convert non-`.ogg` inputs to `song.ogg` with ffmpeg.
- [ ] Write `song.ini` with final audio filename.
- [ ] Create output directory if needed.
- [ ] Emit clear errors for missing source audio.
- [ ] Emit clear errors for missing ffmpeg.

## Suggested package boundaries

Preferred:

```txt
packages/audio
  src/prepareAudio.ts
  src/ffmpegRunner.ts
```

CLI should orchestrate only.

## Tests

- [ ] Unit test option parsing.
- [ ] Unit test audio target filename behavior.
- [ ] Unit test copy path for `.ogg`.
- [ ] Unit test ffmpeg command construction without invoking real ffmpeg.
- [ ] Avoid committing copyrighted audio.

## Validation

- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] Generate output from demo MIDI + local audio.
- [ ] `output/demo/song.ogg` exists.
- [ ] `output/demo/song.ini` contains `song = song.ogg`.
- [ ] Moonscraper opens generated chart without `No audio`.

## Completion

- [ ] Docs updated if behavior changed.
- [ ] No copyrighted MIDI/audio committed.
