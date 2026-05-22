# Checklist Phase 17A: Desktop Bug Bash

## Before implementation

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/desktop/feature-inventory.md`.
- [ ] Read `docs/desktop/bug-and-ui-backlog.md`.
- [ ] Read `docs/phases/17a-desktop-bug-bash/PRD.md`.
- [ ] Read `docs/phases/17a-desktop-bug-bash/ADR.md`.
- [ ] Read this checklist.
- [ ] Review Inspect Source UI code.
- [ ] Review GPIF inspection code.
- [ ] Review MIDI inspection code.
- [ ] Review desktop bridge DTOs related to inspection.
- [ ] Review tests around inspection/track candidates.

## BUG-01 Inspect Source false zero counts

- [ ] Reproduce with GPIF source.
- [ ] Confirm Mapping/Normalize detects source candidates.
- [ ] Identify where `0 notes` is assigned/rendered.
- [ ] Determine whether GPIF count is actually available at inspection time.
- [ ] If count is available, pass/render real count.
- [ ] If count is unavailable, represent it as unknown/unavailable, not `0`.
- [ ] Update detected tracks table.
- [ ] Update drum candidates card.
- [ ] Ensure both use same count semantics.
- [ ] Preserve MIDI note counts.
- [ ] Preserve selected track state.
- [ ] Preserve source warnings/issues.

## Tests

- [ ] Add/update GPIF inspect count test.
- [ ] Add/update MIDI inspect count regression test.
- [ ] Add UI/model formatting test for unknown/unavailable count if practical.
- [ ] Add regression test proving unknown count is not rendered as `0 notes`.
- [ ] Preserve existing tests.

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
