# ADR Phase 04A: Audio Packaging

## Status

Proposed

## Context

CHDG is moving toward a local desktop app. The user will provide symbolic input (`.mid` now, `.gp` later) and an audio file. CHDG should generate a complete local folder that Moonscraper and Clone Hero can load.

A pure web/backend conversion flow is no longer the primary target.

## Decision

Implement local audio packaging as the next practical step.

Use `ffmpeg` locally to convert user-provided audio to:

```txt
song.ogg
```

For the CLI phase, use `ffmpeg` from `PATH`.

Later, the desktop app can bundle ffmpeg or allow configuration.

## Rationale

- Moonscraper validation needs audio.
- Clone Hero song folders usually expect an audio file referenced by `song.ini`.
- Local processing avoids upload/privacy/copyright concerns.
- The same package logic can later be called from Electron main process.

## Consequences

Positive:

- Generated output becomes a complete validation folder.
- Manual Moonscraper sync checks become possible.
- Desktop architecture is easier to implement later.

Negative:

- Requires ffmpeg installed for CLI MVP.
- Adds process execution and file handling.
- Cross-platform packaging must be solved later.
