# Verify: Phase 14B — Clone Hero Highway Preview

## Required validation

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

All must pass.

## Highway behavior

Confirm:

```txt
Preview page includes highway section
kick/red/yellow/blue/green lanes visible
hit line visible
notes render when chart/hit data exists
notes move/update with audio current time
cymbal state appears when available
open hi-hat state appears when available
accent/ghost state appears when available
limited state appears when data unavailable
preview remains read-only
```

## Regression checks

Confirm:

```txt
audio preview still works
waveform-like overview still works
timeline preview still works
Validation page still works
Generate page still works
Project save/load still works
```

## Security

Confirm:

```txt
renderer does not directly use fs
renderer does not directly use child_process
renderer does not build arbitrary file URLs
existing preview bridge/path validation is not weakened
contextIsolation remains true
nodeIntegration remains false
sandbox remains true
```

## Scope checks

Confirm this PR does not implement:

```txt
persisted offset adjustment loop
automatic offset detection
note editor
manual note add/remove/move
gameplay/scoring
mapping overrides
packaging/distribution
full UX polish pass
external editor/Moonscraper integration
```

## Manual desktop validation

Use a local `.chdg` project with generated output where possible.

Record:

```txt
audio preview result
highway render result
modifier render result
generate/validation regression result
```

## PR summary requirements

The PR description should include:

- issue link;
- OpenSpec change ID;
- highway model summary;
- lane/modifier summary;
- data source summary;
- read-only behavior;
- validation/generation preservation;
- tests run;
- manual desktop validation result, if available;
- explicit non-goals;
- note that final review is external;
- note that PR must not be merged without Jon approval.
