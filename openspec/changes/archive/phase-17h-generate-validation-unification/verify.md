# Verify: Phase 17H Generate + Validation Unification

## Required commands

Run and report:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

## Manual validation checklist

### Ready state

- Open `/generate` with valid source/audio/output/tracks.
- Validation runs automatically.
- Status shows `Ready to generate` or `Ready with warnings`.
- Validation Report shows correct counters.
- Generation Configuration shows source/audio/tracks/output/metadata/offset.
- QA Checklist shows warnings/info and no blocking errors.
- Generation Steps are pending.
- Generation Log is compact and empty.
- Output Files Preview shows empty state.
- `Start Generate` is enabled if there are no errors.

### Blocked state

- Remove a required item such as audio or output folder.
- Open `/generate`.
- Status shows `Cannot generate yet`.
- `Start Generate` is disabled.
- QA Checklist shows blocking error with fix action.

### Warning state

- Use a non-blocking warning such as non-zero offset.
- Confirm warnings are visible.
- Confirm `Start Generate` remains enabled.

### Generated state

- Run generation successfully.
- Status shows `Generated`.
- Generation Steps show completed.
- Generation Log shows generation actions.
- Output Files Preview lists `notes.chart`, `song.ini`, and `song.ogg` when produced.
- `Open Output Folder` works.
- `Open Preview` is enabled and routes to Preview.
- Generation action label is `Regenerate`.

### Routing/nav

- Sidebar contains `Generate`.
- Sidebar does not contain `Validation`.
- Opening `/validation` redirects to `/generate`.
- No standalone Validation UI is reachable.

### Autosave

- If project has a `.chdg` path, successful generation autosaves output/generation state.
- Autosave does not trigger generation again.
- Autosave does not mark output as needing regenerate by itself.
- Autosave failure is non-blocking.

## Review boundary

The implementing agent must not perform final review or merge. Final review is external by Jon/ChatGPT.
