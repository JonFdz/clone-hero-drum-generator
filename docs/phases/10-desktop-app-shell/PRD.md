# PRD Phase 10: Desktop App Shell

## Final result

A first desktop shell exists for CHDG using Electron + Angular.

The desktop app should run locally on the user's PC and call the same CHDG packages used by the CLI.

## Why this phase exists

CHDG handles user-provided symbolic files and audio. Local desktop execution avoids upload, privacy, copyright and backend CPU concerns.

## Target stack

```txt
Electron
Angular
TypeScript
pnpm monorepo
CHDG packages
local ffmpeg
```

## Scope

- Create Electron + Angular app scaffold.
- Add local file selection for source file and audio file.
- Call existing generation pipeline from Electron main process.
- Show selected source/audio/output paths.
- Show generation logs and warnings.
- Open output folder after generation.

## Non-goals

- No full chart preview.
- No internal Moonscraper replacement.
- No GPIF implementation unless already available.
- No cloud backend.
- No audio transcription.

## Architecture direction

```txt
apps/desktop
  src/main      # Electron main process, local backend
  src/preload   # safe IPC bridge
  src/renderer  # Angular app
```

Renderer should not directly perform domain logic. It should call the local backend through IPC.

Generation logic stays in packages:

```txt
packages/core
packages/midi
packages/chart
packages/audio
packages/validation
packages/guitarpro later
```

## Validation checklist

- Desktop app starts.
- User can select MIDI input.
- User can select audio input.
- User can select output folder.
- App can call generation pipeline.
- App shows success/failure.
- Generated output matches CLI behavior.
