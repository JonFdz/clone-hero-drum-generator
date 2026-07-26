# Verify: Phase 15 — Offset Adjustment Loop

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

## Offset UI behavior

Confirm:

```txt
Chart Offset controls are visible
saved offset is visible
preview offset is visible
delta is visible
quick nudge buttons work
manual ms input works
invalid input is rejected
reset/revert works
apply/save works
```

## Preview behavior

Confirm:

```txt
timeline alignment changes live with preview offset
highway alignment changes live with preview offset
audio is not shifted
notes are not edited
note/event ticks are not shifted
```

## Chart/project persistence

Confirm:

```txt
.chdg offset updates after apply/save
notes.chart [Song] Offset updates after apply/save
900 ms writes 0.9
-120 ms writes -0.12
existing note/event ticks remain unchanged
generated chart missing is handled gracefully
save/reopen preserves offset
```

## Security

Confirm:

```txt
renderer does not directly use fs
renderer does not directly use child_process
renderer does not perform arbitrary file writes
Electron bridge method only updates allowed notes.chart
arbitrary path is rejected
contextIsolation remains true
nodeIntegration remains false
sandbox remains true
```

## Scope checks

Confirm this PR does not implement:

```txt
automatic offset detection
note editing
manual note add/remove/move
audio stretching/time manipulation
mapping overrides
packaging/distribution
full UX polish pass
external editor/Moonscraper integration
```

## Manual desktop validation

Use a local `.chdg` project with generated output where possible.

Record:

```txt
preview offset loop result
notes.chart update result
save/reopen result
generate/validation regression result
```

## PR summary requirements

The PR description should include:

- issue link;
- OpenSpec change ID;
- offset model summary;
- preview/live alignment summary;
- chart update/security summary;
- persistence behavior;
- tests run;
- manual desktop validation result, if available;
- explicit non-goals;
- note that final review is external;
- note that PR must not be merged without Jon approval.
