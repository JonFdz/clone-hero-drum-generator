# Verify: Phase 17B — Real Waveform Preview

## Required commands

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

## Manual validation

Confirm:

```txt
Preview uses real audio-derived waveform
placeholder copy is removed/replaced
waveform duration matches audio duration
playhead aligns with current audio time
playback still works
offset adjustment still works
timeline still renders
highway still renders
decode errors are non-fatal
```

## Scope validation

Confirm this PR does not implement:

```txt
timeline redesign
Clone Hero Highway redesign
Home/Projects redesign
packaging
note editing
automatic offset detection
```
