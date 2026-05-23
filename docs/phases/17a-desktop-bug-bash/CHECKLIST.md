# Checklist Phase 17A: Desktop Bug Bash

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/desktop/README.md`.
- [x] Read `docs/desktop/decisions.md`.
- [x] Read `docs/desktop/mockup-corrections.md`.
- [x] Read `docs/desktop/feature-inventory.md`.
- [x] Read `docs/desktop/bug-and-ui-backlog.md`.
- [x] Read `docs/phases/17a-desktop-bug-bash/PRD.md`.
- [x] Read `docs/phases/17a-desktop-bug-bash/ADR.md`.
- [x] Read this checklist.
- [x] Review Inspect Source UI code.
- [x] Review GPIF inspection code.
- [x] Review MIDI inspection code.
- [x] Review desktop bridge DTOs related to inspection.
- [x] Review tests around inspection/track candidates.

## BUG-01 Inspect Source false zero counts

- [ ] Reproduce with GPIF source.
- [ ] Confirm Mapping/Normalize detects source candidates.
- [x] Identify where `0 notes` is assigned/rendered.
- [x] Determine whether GPIF count is actually available at inspection time.
- [ ] If count is available, pass/render real count.
- [x] If count is unavailable, represent it as unknown/unavailable, not `0`.
- [x] Update detected tracks table.
- [x] Update drum candidates card.
- [x] Ensure both use same count semantics.
- [x] Preserve MIDI note counts.
- [ ] Preserve selected track state.
- [ ] Preserve source warnings/issues.

## Tests

- [x] Add/update GPIF inspect count test.
- [x] Add/update MIDI inspect count regression test.
- [x] Add UI/model formatting test for unknown/unavailable count if practical.
- [x] Add regression test proving unknown count is not rendered as `0 notes`.
- [x] Preserve existing tests.

## Validation

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

## Manual desktop validation

- [ ] Open GPIF project/source.
- [ ] Inspect Source.
- [ ] Confirm no false `0 notes`.
- [ ] Continue to Track Selection.
- [ ] Normalize.
- [ ] Mapping still shows candidates.
- [ ] Generate still works.
- [ ] Preview still works.
- [ ] Mapping overrides still affect Generate.
- [ ] Mapping profiles still apply correctly.

## Out of scope confirmation

Do not implement in this phase:

- [ ] real waveform rendering;
- [ ] timeline redesign;
- [ ] Clone Hero Highway redesign;
- [ ] Home dashboard redesign;
- [ ] Projects library redesign;
- [ ] packaging/distribution;
- [ ] external editor integration;
- [ ] individual note editing;
- [ ] automatic offset detection.
