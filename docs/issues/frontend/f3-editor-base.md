# frontend: build the project-backed Editor and Preview shell

**Planning ID:** F3  
**Wave:** 4  
**Depends on:** D2, F1, B5 contract  
**Suggested branch/worktree:** `frontend/<ISSUE>-editor-base`

## Owned paths

Editor root, Preview composition/adapters, fixtures; excludes correction/mapping/export internals.

## Scope

- Contextual project header and Preview/Mappings tabs.
- Reuse waveform and approved Highway.
- Consume project-backed Preview.
- Playback, sections, offset, warnings, note-selection shell.
- Stable extension points for later features.

## Non-goals

- Note mutations.
- Mapping editor.
- Export flow.
- Electron integration.

## Acceptance criteria

- [ ] Works in harness before export.
- [ ] Highway primary.
- [ ] 1024 controls preserved.
- [ ] Diagnostics secondary.
- [ ] Selection exposes stable note ID.

## Validation

- Add focused tests for the owned layer.
- Run package tests during development.
- Before PR run `pnpm build`, `pnpm typecheck`, `pnpm lint`, and `pnpm test`.
- Report shared-contract needs before implementing divergent types.
- Verify no unrelated product behavior was added.

## Delivery

- one issue/branch/worktree/PR;
- focused commits;
- PR body with summary, architecture/files, tests, limitations, and `Closes #<issue>`;
- no self-merge or self-approval.
