# CHDG Agent Instructions

## Product goal

Clone Hero Drum Generator (CHDG) converts drum MIDI/transcription data into Clone Hero-compatible drum charts.

Current direction:

1. MIDI input first.
2. Expert Pro Drums output first.
3. `notes.chart` output first.
4. Moonscraper is used for review/validation, not as a runtime dependency.
5. The internal drum model should stay rich enough to support future Elite-like exports.

## Current priority

Build a reliable CLI pipeline before building a frontend.

```bash
pnpm chdg -- inspect-midi samples/demo.mid
pnpm chdg -- generate samples/demo.mid --out output/demo
```

## Architecture rules

- Keep executable apps in `apps/*`.
- Keep reusable libraries in `packages/*`.
- `apps/cli` should orchestrate packages, not contain domain logic.
- `packages/core` owns shared domain types, timing, and pipeline orchestration.
- `packages/midi` owns MIDI parsing and inspection.
- `packages/mappings` owns configurable mappings and JSON mapping files.
- `packages/chart` owns Clone Hero chart/song writers.
- `packages/validation` owns consistency and quality checks.
- Do not hardcode drum mappings inside CLI commands.
- Do not add frontend code until the CLI pipeline is validated.

## Package manager

Use pnpm only. Do not create `package-lock.json` or use `npm install`.

## Commands

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm dev
pnpm chdg -- --help
```

## Safety and copyright

- Do not commit copyrighted songs, commercial MIDI files, or audio.
- `samples/` is gitignored except for documentation/placeholders.
- Generated output belongs in `output/`, which is gitignored except for `.gitkeep`.
