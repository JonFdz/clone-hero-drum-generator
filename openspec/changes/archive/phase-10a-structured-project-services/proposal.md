# Proposal: Phase 10A — Structured Project Services + CLI --json

## Change ID

`phase-10a-structured-project-services`

## Summary

Create `packages/project` as the shared orchestration layer for CHDG and add clean machine-readable JSON output to key CLI commands.

This phase prepares the backend/service layer that both CLI and Desktop will use.

Expected direction:

```txt
CLI
  -> packages/project
Desktop
  -> Electron preload bridge
  -> packages/project
```

The desktop shell exists after Phase 10, but it should not grow business logic directly in Electron main. Phase 10A prevents that by introducing a structured service boundary before the real desktop generation workflow.

## Why this phase exists

Phase 10 created the Electron + Angular shell.

Before implementing the Desktop Generate MVP, CHDG needs structured services and stable DTOs. Without this, desktop screens would either parse human CLI text or duplicate orchestration logic.

This phase makes inspection, normalization preview and generation results consumable by:

```txt
CLI human output
CLI --json output
Desktop UI
tests
future validation/preview/mapping phases
```

## Goals

1. Add `packages/project`.
2. Define stable structured DTOs for:
   - source inspection;
   - track candidates;
   - normalization preview;
   - piece summary;
   - first-hit preview;
   - warnings/errors;
   - generation input/result;
   - generation progress events;
   - validation report shape, if useful as a future-facing stub.
3. Add high-level service functions:
   - `inspectSource`;
   - `normalizeSelection` or equivalent;
   - `generatePackage` or equivalent wrapper over existing generation flow;
   - optional future-facing `validatePackage` stub/type only if helpful.
4. Add `--json` to key CLI commands.
5. Ensure JSON mode emits clean JSON.
6. Keep existing human CLI output working.
7. Preserve current MIDI and GPIF behavior.
8. Do not implement Desktop Generate MVP yet.

## Key commands for JSON mode

Add clean JSON output for at least:

```bash
pnpm chdg inspect /path/source.mid --json
pnpm chdg inspect-gp /path/source.gp --json
pnpm chdg normalize-drums /path/source.mid --track 53 --json
pnpm chdg normalize-gp-drums /path/source.gp --track 3 --json
pnpm chdg generate /path/source.gp --track 3 --audio-source /path/audio.mp3 --out /path/output --json
```

If command names differ in the current repo, adapt to existing names.

JSON output requirements:

```txt
stdout = valid JSON only
human logs must not be mixed into stdout
warnings/errors should be represented in JSON or sent to stderr
exit codes should remain meaningful
```

## Non-goals

- No Desktop Generate MVP.
- No new desktop routes beyond Phase 10 placeholders.
- No real file picker flow.
- No project persistence.
- No `.chdg` read/write.
- No multi-track generation yet.
- No validation checklist implementation.
- No preview player.
- No mapping overrides.
- No packaging/distribution.
- No Electron routing/deep-link changes unless required by build stability.
- No desktop hot reload/dev-server workflow unless trivial and isolated.

## Future blockers recorded from Phase 10 review

These are known future concerns but are not part of Phase 10A unless they block implementation:

### Electron routing / deep links

Phase 10 uses regular Angular routing under Electron `file://`.

Future phases involving project opening, file associations, deep links, or reload-safe nested routes may need:

```txt
HashLocationStrategy
or an Electron-safe route loading strategy
```

Do not solve this in Phase 10A unless it becomes necessary.

### Desktop dev workflow

Phase 10 desktop `dev` currently builds then launches Electron. Future desktop-heavy work may benefit from:

```txt
Angular dev server
Electron loading localhost
watch mode / hot reload
concurrently / wait-on
```

Do not make this a Phase 10A requirement unless it is a low-risk helper.

## Branch

```txt
feat/phase-10a-structured-project-services
```

## Product constraints

Continue to respect:

```txt
local-first
100% offline
no uploads
no YouTube/URL imports
no scraping
no Moonscraper dependency
.chdg is a project file, not Clone Hero output
Clone Hero output = notes.chart + song.ini + song.ogg
```

## Required docs to read

```txt
docs/desktop/README.md
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
docs/phases/10a-structured-project-services/PRD.md
docs/phases/10a-structured-project-services/ADR.md
docs/phases/10a-structured-project-services/CHECKLIST.md
docs/phases/10-desktop-app-shell/PRD.md
```

## Validation

Required:

```bash
pnpm build
pnpm typecheck
pnpm test
```

Also validate JSON mode manually with synthetic or existing safe fixtures where possible.

Example expectations:

```txt
command --json prints parseable JSON
command without --json keeps human-readable output
warnings do not corrupt JSON stdout
existing CLI behavior still works
```

## Review policy

The implementation agent should do focused self-checks only.

Final PR review is external and will be performed by Jon/ChatGPT.

The agent must not merge.
