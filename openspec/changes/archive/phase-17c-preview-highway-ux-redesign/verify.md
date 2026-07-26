# Verify: Phase 17C — Preview Highway UX Redesign

## Commands

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
Preview resembles 08a mock
old Timeline Notes no longer competes with chart stage
one waveform background behind all lanes
lane order is correct
cymbals are diamonds
non-cymbals are circles
colors are correct
playhead follows audio
offset controls work
no new rendering dependency was added
```
