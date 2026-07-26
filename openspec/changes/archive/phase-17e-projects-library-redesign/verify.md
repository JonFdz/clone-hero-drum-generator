# Verify: Phase 17E — Projects Library Redesign

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
Projects matches 02-projects-library.png closely
Search/filter/sort work
Project cards show cover placeholders
No fake recent activity
Library stats are truthful
Remove requires confirmation
Cancel does not remove
Confirm removes only from recents
Open project works
Open recent works
New project works
Home remains unchanged
```
