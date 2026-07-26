# Verify: Phase 16B — Mapping Override Profiles

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

## Profile behavior

Confirm:

```txt
profile can be created from current project overrides
profile appears in list
profile persists after app restart
profile metadata can be edited
profile can be updated from current project overrides
profile can be deleted
```

## Apply behavior

Confirm:

```txt
replace mode replaces project overrides
merge mode merges profile overrides into project overrides
profile wins conflicts in merge mode
conflict/overwrite summary is visible
applying profile marks project dirty
applying profile marks generated output needs-regenerate if applicable
```

## Regression checks

Confirm:

```txt
Phase 16A manual project overrides still work
old projects without profiles still work
project save/load still works
generation uses project overrides after profile apply
validation still works
Preview still works
Highway still works
Offset loop still works
```

## Security

Confirm:

```txt
renderer does not gain direct filesystem access
no generic file read/write bridge is added
profile persistence uses narrow bridge/settings storage
existing Electron security boundaries remain
```

## Scope checks

Confirm this PR does not implement:

```txt
built-in Songsterr profiles
cloud sync
community profile database
automatic profile detection
ML mapping
individual note editing
manual note add/remove/move
packaging/distribution
full UX polish pass
external editor/Moonscraper integration
```

## PR summary requirements

The PR description should include:

- issue link;
- profile model summary;
- local persistence summary;
- apply mode summary;
- conflict behavior;
- staleness behavior;
- tests run;
- manual desktop validation result, if available;
- explicit non-goals;
- note that final review is external;
- note that PR must not be merged without Jon approval.
