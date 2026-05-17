# CHDG Agent Instructions

## Product goal

Clone Hero Drum Generator (CHDG) converts deterministic drum transcription data into Clone Hero-compatible drum charts.

Current direction:

1. MIDI input first.
2. GPIF-based `.gp` input next.
3. Expert Pro Drums output first.
4. `notes.chart` output first.
5. Desktop-first local processing.
6. Moonscraper is used for review/validation, not as a runtime dependency.
7. The internal drum model should stay rich enough to support future Pro/Elite-like exports.

## Current priority

Build a reliable local generation pipeline before building the full desktop UI.

The CLI remains the implementation and validation surface used by agents.

Example command style:

```bash
pnpm chdg inspect-midi --drums-only /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mid
pnpm chdg normalize-drums /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mid --track 53
pnpm chdg generate /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mid --track 53 --out /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo
```

Do not add a pnpm `--` separator before the CHDG command unless a local script genuinely requires it.

## SDD / Gentle-AI workflow

CHDG uses Gentle-AI / Pi SDD with OpenSpec and Engram.

### Source of truth

- Engram is the persistent project memory and source of truth.
- OpenSpec artifacts are reviewable transfer artifacts used by Jon/ChatGPT and the local agent.
- When OpenSpec artifacts are provided, read them first, then transfer accepted decisions, constraints, tasks and validation rules into Engram before implementation.
- Do not rely only on chat context for project decisions.

### Phase ownership

- Jon/ChatGPT owns proposal, spec, design, verify and PR review.
- Pi/gentle-ai agent owns implementation/apply, focused self-checks, commits, push and PR creation.
- Final review is external and done by Jon/ChatGPT.
- Never merge without Jon's explicit approval.

### Git rules

- Work on the requested branch only.
- Commit and push after implementation.
- Create or update a PR linked to the issue.
- Do not merge.
- Do not squash/rebase/merge into `main` unless Jon explicitly requests it.

## Architecture rules

- Keep executable apps in `apps/*`.
- Keep reusable libraries in `packages/*`.
- `apps/cli` should orchestrate packages, not contain domain logic.
- Future desktop app should live under `apps/desktop`.
- Desktop renderer should not contain generation logic.
- Electron main/local backend should call reusable packages.
- `packages/core` owns shared domain types, timing, and pipeline orchestration.
- `packages/midi` owns MIDI parsing, inspection and normalization.
- `packages/guitarpro` will own future GPIF parsing, inspection and normalization.
- `packages/mappings` owns configurable mappings and JSON mapping files.
- `packages/chart` owns Clone Hero chart/song writers.
- `packages/audio` will own future audio packaging / ffmpeg integration.
- `packages/validation` owns consistency and quality checks.
- Do not hardcode drum mappings inside CLI commands.
- Do not bypass `DrumHit[]` when adding future inputs.

## Package manager

Use pnpm only. Do not create `package-lock.json` or use `npm install`.

## Commands

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm dev
pnpm chdg --help
```

## Safety and copyright

- Do not commit copyrighted songs, commercial MIDI files, Guitar Pro files, or audio.
- `samples/` is gitignored except for documentation/placeholders.
- Generated output belongs in `output/`, which is gitignored except for `.gitkeep`.
- Use synthetic fixtures for tests.
- Local demo files may exist on Jon's machine but should not be committed unless licensing is explicitly safe.

## Current local demo context

Preferred local demo candidate:

```txt
Song: Eat My Dust
Artist: Dead Pony
MIDI path: /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mid
Output path: /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo
MIDI drum track: 53
Tempo: 147 BPM
Time signature: 4/4
Drum hits: 1039
Unknown notes: none
```

Expected normalized summary for track 53:

```txt
kick: 347
snare: 215
hihat_open: 123
hihat_closed: 99
crash: 232
tom_mid: 14
tom_floor: 9
```

The previous Stairway to Heaven demo is not the preferred main validation sample because drums enter very late.
