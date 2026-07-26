# Verify: Phase 12 — Project Persistence + Settings

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

## Project file validation

Confirm:

```txt
.chdg file is JSON
schemaVersion is present
save project writes expected state
open project restores expected state
invalid project file fails clearly
unsupported schema version fails clearly
absolute source/audio/output paths are restored
missing paths produce warnings
```

## Recent projects validation

Confirm:

```txt
saved/opened projects appear in recents
duplicates are deduped
recent list has a sensible limit
missing recent project can be removed
```

## Settings validation

Confirm:

```txt
settings persist after restart
project location persists
default output folder persists
default charter persists
default offset persists
ffmpeg path persists
FFmpeg diagnostic returns useful success/failure
```

## Generation preservation

Confirm:

```txt
Phase 11 generate flow still works
loaded project can inspect/normalize/generate
known output overwrite behavior remains safe
source/audio/output picker allowlists remain enforced
Open Output Folder remains scoped
```

## Dirty/outdated validation

Confirm:

```txt
metadata changes mark dirty
source/audio/track/offset/output changes mark needs-regenerate after prior generation
successful generation marks generated
failed generation marks failed
```

## Security validation

Confirm:

```txt
renderer does not directly use fs
renderer does not directly use child_process
renderer does not expose arbitrary filesystem APIs
contextIsolation remains true
nodeIntegration remains false
sandbox remains true
preload bridge exposes explicit methods only
```

## Scope checks

Confirm this PR does not implement:

```txt
.chdg bundle format
file association
cloud sync
validation checklist
audio/waveform preview
Clone Hero highway preview
offset adjustment preview
mapping overrides
packaging/distribution
external editor integration
full desktop UX polish pass
```

## PR summary requirements

The PR description should include:

- issue link, if available;
- OpenSpec change ID;
- `.chdg` schema summary;
- settings storage summary;
- recent projects summary;
- dirty/output status behavior;
- FFmpeg diagnostic behavior;
- UX polish deferral note;
- tests run;
- manual desktop validation result, if available;
- explicit non-goals;
- note that final review is external;
- note that the PR must not be merged without Jon's approval.
