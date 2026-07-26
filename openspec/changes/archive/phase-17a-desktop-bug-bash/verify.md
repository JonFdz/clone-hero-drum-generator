# Verify: Phase 17A — Desktop Bug Bash

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

## BUG-01 validation

Confirm:

```txt
GPIF Inspect Source no longer shows false 0 notes.
If count is unknown/unavailable, UI shows n/a/Unknown/Available after normalization.
MIDI known counts still display numerically.
Candidate card and detected tracks table agree.
```

## Regression checks

Confirm:

```txt
Inspect Source works
Track Selection works
Normalize works
Mapping works
Generate works
Validation works
Preview works
Highway works
Offset loop works
Project save/load works
Mapping overrides still affect Generate
Mapping profiles still apply correctly
```

## Scope checks

Confirm this PR does not implement:

```txt
real waveform rendering
timeline redesign
Clone Hero Highway redesign
Home dashboard redesign
Projects library redesign
global UI polish
desktop packaging/distribution
external editor integration
individual note editing
automatic offset detection
```

## PR summary requirements

The PR description should include:

- issue link if present;
- root cause of false `0 notes`;
- chosen count semantics;
- files changed;
- tests run;
- manual desktop validation result;
- explicit deferred UI/preview redesign items;
- note that final review is external;
- note that PR must not be merged without Jon approval.
