# CHDG Agent Instructions

## Product goal

Clone Hero Drum Generator converts deterministic symbolic drum transcriptions into reviewable, correctable Expert Pro Drums song packages for Clone Hero.

## Current V1 direction

1. Desktop-first and local-only.
2. GP/GPIF and MIDI are deterministic import sources.
3. Original audio is an import source.
4. Creation produces a self-contained CHDG project folder.
5. After import, the CHDG project is the source of truth.
6. Clone Hero output is derived and repeatable without external originals.
7. Visible flow:

   ```text
   Home → Create Project → Editor → Export
   ```

8. Inspection, normalization, validation, and generation are backend responsibilities, not permanent user destinations.
9. The V1 editor changes or deletes existing imported notes only.
10. Structural musical changes belong in Guitar Pro or another symbolic-source editor.

## Portable project

```text
Artist - Song Name - Project Name/
├── project.chdg
├── assets/
│   ├── source.<original-extension>
│   ├── song.ogg
│   └── album.jpg              # optional
└── recovery/
    └── previous.chdg
```

The full folder is portable. `project.chdg` by itself is not.

Do not reintroduce permanent external source/audio path dependencies.

## Mandatory identity

- Artist
- Song Name
- Project Name

Derived display/folder name:

```text
Artist - Song Name - Project Name
```

The internal project file is always `project.chdg`. Identity changes rename project/output folders transactionally after preflight.

## Mapping

Keep these distinct:

```text
source event → musical piece → Clone Hero target
```

Example: a Ride may remain a Ride while targeting Green Cymbal.

Priority:

```text
individual note correction
> source-specific project target override
> default target for the effective musical piece
```

Unknown recognition may use a separate source-interpretation override.

## V1 note-editing boundary

Allowed:

- change musical piece;
- change Clone Hero target/lane;
- change tom/cymbal;
- change open/closed hi-hat semantics;
- change accent;
- change ghost;
- delete and restore;
- session Undo/Redo.

Not allowed:

- add;
- move or retime;
- edit tick;
- edit duration/length;
- copy/paste or batch edits;
- tempo/time-signature editing;
- special Expert+ / 2x-kick authoring.

Every V1 exported drum note uses chart length `0`.

## Export safety

Export identity, target, fingerprints, and managed-file hashes live in `project.chdg`. Do not add an output marker file.

The exporter must:

- update only CHDG-managed files;
- preserve backgrounds, videos, and unknown files;
- detect externally modified managed files;
- stage all required outputs;
- commit atomically;
- never leave a partial managed update;
- request confirmation for ambiguous existing destinations.

## SDD and ownership

CHDG uses OpenSpec and Engram.

- Engram is persistent implementation memory.
- OpenSpec is the reviewable transfer artifact.
- Transfer accepted decisions and requirements to Engram before implementation.
- Jon/ChatGPT owns product/spec/design checkpoints, issue planning, verification, and external PR review.
- Local agents own apply/implementation, focused tests, commits, push, and PR creation.
- Never merge without Jon's explicit approval.

## Git and worktrees

- One issue, branch, worktree, and PR per planned unit.
- Use the real issue number in branch names.
- Never commit directly to `main`.
- Read `docs/roadmaps/simplified-v1-worktree-plan.md`.
- Respect exclusive hotspot ownership.
- Stop and request a shared prerequisite change rather than creating a divergent private contract.

## Architecture

- Apps live under `apps/*`; reusable logic under `packages/*`.
- Angular renderer contains no parsing, mapping, generation, persistence, or export domain logic.
- Electron adapts OS/IPC; packages own reusable behavior.
- `packages/core`: domain and timing primitives.
- `packages/midi`: MIDI inspection/normalization.
- `packages/guitarpro`: GP/GPIF inspection/normalization.
- `packages/mappings`: mapping defaults/primitives.
- `packages/chart`: Clone Hero serialization.
- `packages/audio`: audio preparation.
- `packages/project`: self-contained project, import orchestration, effective chart, persistence contracts, export orchestration.
- `packages/validation`: consistency and quality validation.
- Preserve rich `DrumHit[]` as the imported base.

## UI constraints

- Angular + Electron remain.
- No React, Next.js, Tailwind, shadcn, or parallel UI.
- No permanent sidebar.
- Permanent project tabs: Preview and Mappings.
- Project Details is contextual.
- Export is an Editor action/state, not a Generate page.
- Settings is application-level.

## Quality gates

Use pnpm only:

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

Do not use npm or create `package-lock.json`.

## Safety

- Do not commit copyrighted songs, commercial MIDI/GP files, or audio.
- Use synthetic fixtures.
- No cloud upload or audio inference.
