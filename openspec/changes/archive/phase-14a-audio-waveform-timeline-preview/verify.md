# Verify: Phase 14A — Audio + Waveform + Timeline Preview

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

## Preview behavior

Confirm:

```txt
Preview page is no longer placeholder
generated song.ogg is preferred when available
selected project audio fallback works when safe
play works
pause works
seek/progress works where implemented
current time updates
duration appears
waveform or waveform-like overview renders
timeline notes render when data exists
playhead syncs with audio
notes near current time highlight
missing generated output has clear state
```

## Security

Confirm:

```txt
renderer does not directly use fs
renderer does not directly use child_process
renderer does not build arbitrary file URLs without bridge validation
preview source is validated by Electron main
arbitrary preview path is rejected
contextIsolation remains true
nodeIntegration remains false
sandbox remains true
```

## Scope checks

Confirm this PR does not implement:

```txt
Clone Hero highway preview
persisted offset adjustment loop
automatic offset detection
note editor
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
waveform/timeline result
missing output fallback result
generate/validation regression result
```

## PR summary requirements

The PR description should include:

- issue link;
- OpenSpec change ID;
- preview source/security summary;
- waveform/timeline summary;
- note highlight summary;
- generated output/fallback behavior;
- validation/generation preservation;
- tests run;
- manual desktop validation result, if available;
- explicit non-goals;
- note that final review is external;
- note that PR must not be merged without Jon approval.
