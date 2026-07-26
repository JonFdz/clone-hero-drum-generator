# Verify — Phase 17K

## Commands

Run and report:

```bash
pnpm test
pnpm --filter @chdg/guitarpro build
pnpm --filter @chdg/project build
pnpm chdg --help
```

If feasible:

```bash
pnpm -r build
pnpm typecheck
```

## Expected generated chart evidence

For a Decode-like fixture, generated `[Events]` should contain non-zero section ticks such as:

```chart
0 = E "section Intro"
30720 = E "section Verse 1"
184320 = E "section Break"
353280 = E "section Solo"
414720 = E "section Bridge"
```

## Regression checks

- Tempo map still exports expected events.
- Note ticks still use original master bar index.
- MIDI generation remains unchanged.
