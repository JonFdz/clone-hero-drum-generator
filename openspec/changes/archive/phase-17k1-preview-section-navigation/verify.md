# Verify — Phase 17K.1 Preview Section Navigation

## Automated validation

Run and report:

```bash
pnpm --filter @chdg/desktop test
pnpm --filter @chdg/desktop typecheck
pnpm test
pnpm lint
```

Follow `AGENTS.md` for build command restrictions.

## Manual validation

Use a generated chart with section events.

Confirm:

1. Preview loads generated `notes.chart` and generated `song.ogg`.
2. If sections exist, a compact section overlay appears.
3. Current section updates as playback crosses section boundaries.
4. Previous button seeks to previous section.
5. Next button seeks to next section.
6. Dropdown seeks to selected section.
7. Seeking respects `previewOffsetMs`.
8. Playback state is preserved.
9. If a generated chart has no sections, no section overlay appears.
10. Existing notes/highway rendering is unchanged.
