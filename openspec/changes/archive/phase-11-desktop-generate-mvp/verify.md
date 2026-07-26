# Verify: Phase 11 — Desktop Generate MVP

## Required validation

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
```

All must pass.

## Desktop validation

Run desktop scripts:

```bash
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
```

or equivalent if package names differ.

## Security validation

Confirm:

```txt
renderer does not import/use fs
renderer does not import/use child_process
renderer does not use direct Node APIs
capabilities go through typed preload bridge
contextIsolation remains true
nodeIntegration remains false
bridge exposes only explicit methods
```

## Functional validation

Confirm:

```txt
source file picker works
audio file picker works
output folder picker works
audio required validation works
source type detection works for .mid/.midi/.gp
source inspection works
track candidates render
single-track selection works
multi-track selection works if available
normalization summary renders
generation works
notes.chart generated
song.ini generated
song.ogg generated
output files listed
Open Output Folder works
errors render without crashing
```

## JSON/project service relation

Confirm Desktop uses:

```txt
@chdg/project
```

through Electron main/preload.

It must not parse CLI human text.

## Scope checks

Confirm this PR does not implement:

```txt
.chdg persistence
recent projects/drafts
validation checklist implementation
audio/waveform preview
Clone Hero highway preview
offset adjustment preview
mapping overrides
mapping profiles
individual note editing
packaging/distribution
external editor integration
Moonscraper integration
```

## Manual sample validation

Use local samples if available:

```txt
samples/demo.gp
samples/demo.mid
samples/demo.mp3
```

Record exact commands/actions/results in PR.

## PR summary requirements

The PR description should include:

- issue link, if available;
- OpenSpec change ID;
- bridge methods added;
- screens implemented;
- generation workflow summary;
- security constraints preserved;
- overwrite behavior;
- tests run;
- manual desktop smoke result, if available;
- note if desktop launch was not possible;
- explicit non-goals;
- note that final review is external;
- note that the PR must not be merged without Jon's approval.
