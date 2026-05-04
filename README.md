# Clone Hero Drum Generator (CHDG)

CHDG is an experimental tool for generating Clone Hero drum charts from MIDI and, later, other transcription sources.

First milestone:

- read a drum MIDI file;
- inspect tempo, ticks, notes and velocities;
- map General MIDI drum notes to an internal drum model;
- export `ExpertDrums` as a Clone Hero-compatible `notes.chart`;
- generate a minimal `song.ini`;
- validate the output in Moonscraper and Clone Hero.

## Requirements

- Node.js 20+
- pnpm 9+

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
```

## Commands

```bash
pnpm build
pnpm typecheck
pnpm dev
pnpm chdg -- --help
```
