# Checklist Phase 04A: Audio Packaging

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/implementation/implementation-plan.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Inspect current `generate` command.
- [x] Inspect current `song.ini` writer.

## Implementation

- [x] Add `--audio-source <path>` to generate command.
- [x] Preserve or clarify existing `--audio <filename>` behavior.
- [x] Create audio preparation logic.
- [x] Copy `.ogg` inputs to final audio file when possible.
- [x] Convert non-`.ogg` inputs to `song.ogg` with ffmpeg.
- [x] Write `song.ini` with final audio filename.
- [x] Create output directory if needed.
- [x] Emit clear errors for missing source audio.
- [x] Emit clear errors for missing ffmpeg.

## Suggested package boundaries

Preferred:

```txt
packages/audio
  src/prepareAudio.ts
  src/ffmpegRunner.ts
```

CLI should orchestrate only.

## Tests

- [x] Unit test option parsing.
- [x] Unit test audio target filename behavior.
- [x] Unit test copy path for `.ogg`.
- [x] Unit test ffmpeg command construction without invoking real ffmpeg.
- [x] Avoid committing copyrighted audio.

## Validation

- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] Generate output from demo MIDI + local audio.
- [x] `output/demo/song.ogg` exists.
- [x] `output/demo/song.ini` contains `song = song.ogg`.
- [ ] Moonscraper opens generated chart without `No audio`.

## Completion

- [x] Docs updated if behavior changed.
- [x] No copyrighted MIDI/audio committed.
