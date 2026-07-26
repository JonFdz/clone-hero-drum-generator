# Verify: Phase 17F — Project Details + Cover Flow

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
Projects New Project opens Project Details
Edit opens Project Details
Select activates project
Project Details matches 03-new-project.png closely
Cover pick/preview/save/reopen works
Cover clear works
Existing .chdg without cover opens
Remove from recents keeps file
Remove + delete removes only .chdg file
Home/Projects remain usable
```
