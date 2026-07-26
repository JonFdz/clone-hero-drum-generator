# Verify: Phase 17D Home Pixel-Perfect Correction

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
Home matches 01-home-dashboard.png closely
Hero/current project is dominant
No large duplicate Next Recommended Action card
No duplicated Quick Actions card
No full row of generic status metrics
Recent Projects compact
Workflow compact
Actions work
Projects page unchanged
```
