# Verify: Phase 13 — Validation Checklist / Pre-Generate Review

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

## Validation behavior

Confirm:

```txt
missing source => blocking error
unsupported source => blocking error
missing audio => blocking error
missing output folder => blocking error
missing selected tracks => blocking error
invalid offset => blocking error
FFmpeg unavailable => blocking error when audio conversion required
needs-regenerate => warning, not error
metadata recommendations => warning, not error
merge/impossible chord issues => warning, not error
valid project => canGenerate true
```

## Desktop UI

Confirm:

```txt
Validation page is no longer placeholder
Validation page shows summary counts
Validation page shows errors/warnings/info
Validation page has useful fix actions/routes
Generate page shows validation preflight
Generate action is blocked by errors
Generate action is allowed with warnings
```

## Security

Confirm:

```txt
renderer does not directly use fs
renderer does not directly use child_process
Electron bridge exposes only explicit methods
contextIsolation remains true
nodeIntegration remains false
sandbox remains true
source/audio/output/project allowlists are not regressed
```

## Scope checks

Confirm this PR does not implement:

```txt
audio/waveform preview
Clone Hero highway preview
offset adjustment preview
mapping overrides
note editing
packaging/distribution
full UX polish pass
external editor/Moonscraper integration
```

## Manual validation

Use a local `.chdg` project and sample files where possible.

Record:

```txt
valid project validation
missing source validation
missing audio validation
missing track validation
generate with warnings
generate blocked by errors
```

## PR summary requirements

The PR description should include:

- issue link, if available;
- OpenSpec change ID;
- validation model summary;
- blocking vs warning behavior;
- Validation page summary;
- Generate page preflight summary;
- FFmpeg/path validation behavior;
- tests run;
- manual desktop validation result, if available;
- explicit non-goals;
- note that final review is external;
- note that PR must not be merged without Jon approval.
