# Verify: Phase 16A — Project Mapping Overrides

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

## Mapping override behavior

Confirm:

```txt
Mapping Overrides UI is visible/reachable
MIDI note override can be added
GPIF/source override can be added when data exists
source note/articulation can be ignored
override can be reset
sidestick can be mapped to snare
sidestick can be ignored
```

## Persistence

Confirm:

```txt
overrides save to .chdg
reopen restores overrides
old .chdg without overrides loads
malformed override data does not crash
```

## Normalization/generation

Confirm:

```txt
normalization uses MIDI overrides
normalization uses GPIF/source overrides
ignored source keys are skipped
automatic mapping remains when no override exists
generation uses corrected normalized hits
```

## Staleness

Confirm:

```txt
override change marks project dirty
override change marks generated output needs-regenerate if applicable
normalization/preview stale state is clear
```

## Regression checks

Confirm:

```txt
existing generation works without overrides
validation still works
Preview still works
Highway still works
Offset loop still works
project save/load still works
```

## Security

Confirm:

```txt
renderer does not gain direct filesystem access
no generic file write/read bridge is added for mapping overrides
existing Electron security boundaries remain
```

## Scope checks

Confirm this PR does not implement:

```txt
global mapping profiles
Songsterr profile system
automatic ML mapping
individual note editing
manual note add/remove/move
mapping community database
packaging/distribution
full UX polish pass
external editor/Moonscraper integration
```

## PR summary requirements

The PR description should include:

- issue link;
- mapping override model summary;
- persistence summary;
- normalization/generation integration summary;
- staleness behavior summary;
- tests run;
- manual desktop validation result, if available;
- explicit non-goals;
- note that final review is external;
- note that PR must not be merged without Jon approval.
