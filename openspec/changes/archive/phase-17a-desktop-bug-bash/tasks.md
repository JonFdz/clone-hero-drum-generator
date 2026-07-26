# Tasks: Phase 17A — Desktop Bug Bash

## 1. Read context

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/desktop/bug-and-ui-backlog.md`.
- [ ] Read `docs/phases/17a-desktop-bug-bash/PRD.md`.
- [ ] Read `docs/phases/17a-desktop-bug-bash/ADR.md`.
- [ ] Read `docs/phases/17a-desktop-bug-bash/CHECKLIST.md`.

## 2. Sync context to Engram

- [ ] Save change ID: `phase-17a-desktop-bug-bash`.
- [ ] Save branch name: `fix/phase-17a-desktop-bug-bash`.
- [ ] Save scope: functional bug bash only.
- [ ] Save primary bug: Inspect Source false `0 notes` for GPIF tracks.
- [ ] Save rule: numeric `0` means known zero only.
- [ ] Save rule: unknown/unavailable count must render as non-zero fallback text.
- [ ] Save out-of-scope items: waveform, timeline, highway, Home, Projects, packaging, note editing.
- [ ] Save validation commands.
- [ ] Save review policy: final PR review external; do not merge without Jon approval.

## 3. Inspect current implementation

- [ ] Locate Inspect Source UI.
- [ ] Locate track candidate UI/model.
- [ ] Locate GPIF inspection service.
- [ ] Locate MIDI inspection service.
- [ ] Locate project inspection DTOs.
- [ ] Locate Electron bridge inspection payload validation.
- [ ] Locate tests for inspection/candidates.
- [ ] Search for `?? 0`, `|| 0`, `noteCount`, `notes`, and count formatting in Inspect/Track Selection code.

## 4. Reproduce BUG-01

- [ ] Use a GPIF source that shows `0 notes` in Inspect.
- [ ] Confirm Mapping/Normalize later shows source candidates.
- [ ] Record the source kind, selected track, and displayed values.
- [ ] Identify whether the zero comes from backend DTO or Angular rendering.

## 5. Fix count semantics

- [ ] Choose a minimal explicit representation for known/unknown/not-applicable count.
- [ ] Update GPIF inspection behavior.
- [ ] Preserve MIDI inspection behavior.
- [ ] Update project DTOs/types if needed.
- [ ] Update Electron bridge validation if needed.
- [ ] Update Angular models/rendering.
- [ ] Ensure candidate card and detected tracks table use consistent formatting.
- [ ] Avoid hiding counts globally.

## 6. Tests

- [ ] Add GPIF unavailable/unknown count test.
- [ ] Add MIDI known count regression test.
- [ ] Add count formatter/model test.
- [ ] Add regression test proving unknown is not displayed as `0 notes`.
- [ ] Preserve existing tests.

## 7. Validate

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

## 8. Manual desktop validation

- [ ] Open GPIF source.
- [ ] Inspect Source.
- [ ] Confirm no false `0 notes`.
- [ ] Continue to Track Selection.
- [ ] Normalize.
- [ ] Mapping still shows candidates.
- [ ] Generate still works.
- [ ] Preview still works.
- [ ] Mapping overrides still affect Generate.
- [ ] Mapping profiles still apply correctly.

## 9. Docs/checklist

- [ ] Update `docs/phases/17a-desktop-bug-bash/CHECKLIST.md`.
- [ ] Update `docs/desktop/bug-and-ui-backlog.md` if bug status changes.
- [ ] Do not mark deferred UI redesign items complete.

## 10. Git and PR

- [ ] Confirm branch is `fix/phase-17a-desktop-bug-bash`.
- [ ] Commit changes.
- [ ] Push branch.
- [ ] Create PR.
- [ ] Do not merge.
