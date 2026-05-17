# Checklist Phase 04: Manual Validation Setup

## Before implementation

- [x] Read `AGENTS.md`.
- [x] Read `docs/implementation/implementation-plan.md`.
- [x] Read this phase PRD.
- [x] Read this phase ADR.
- [x] Inspect relevant files.

## Implementation

- [x] Create manual validation checklist.
- [x] Define expected lane checks.
- [x] Define tempo/sync checks.
- [x] Define mismatch recording template.
- [x] Define accepted/rejected criteria.
- [x] Record that full validation is deferred until audio packaging and Pro Drums flags exist.

## Initial validation result

- [x] Phase 03 `notes.chart` opens in Moonscraper.
- [x] Moonscraper detects `Drums / Expert`.
- [x] Lane mode appears as 4-lane.
- [x] Game mode appears as Pro Drums.
- [x] No structural chart loading error observed.
- [ ] Audio sync validation complete.
- [ ] Clone Hero detects `ExpertDrums`.
- [ ] Pro Drums cymbal display validation complete.

## Deferred validation

Full validation will be repeated after:

- [ ] audio packaging can create/copy `song.ogg`;
- [ ] the main demo is changed to Eat My Dust;
- [ ] Pro Drums cymbal flags are implemented.

## Mismatch recording template

| Location | Expected | Actual | Severity | Follow-up |
|---|---|---|---|---|
| bar/tick/time | | | low/medium/high | |

## Completion

- [x] Docs updated.
- [x] No copyrighted MIDI/audio committed.
- [ ] Full Moonscraper validation complete.
- [ ] Full Clone Hero validation complete.

## Phase status

```txt
Phase 04 validation process: created
Initial Moonscraper structural check: passed
Full audio/pro-drums validation: deferred
```
