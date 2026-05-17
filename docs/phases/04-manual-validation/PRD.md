# PRD Phase 04: Manual Validation Setup

## Final result

A repeatable manual validation process exists for checking generated CHDG charts in Moonscraper and Clone Hero.

This phase is considered created/setup-ready, not fully complete.

Full manual validation should be repeated after:

- audio packaging exists;
- generated song folders include `song.ogg`;
- Pro Drums cymbal flags are implemented;
- the main demo source has been changed to the new Eat My Dust demo.

## Why this phase exists

CHDG has several possible failure points:

- source parsing;
- drum track selection;
- timing;
- mapping;
- chart encoding;
- audio packaging;
- editor/game compatibility.

Manual validation isolates what a human must confirm in Moonscraper/Clone Hero and records mismatches as follow-up work.

## Scope

- Create a manual validation checklist.
- Define expected lane checks.
- Define tempo/sync checks.
- Define mismatch recording template.
- Define accepted/rejected criteria.
- Record that initial Moonscraper validation passed for Phase 03 structure, but full validation is deferred.

## Non-goals

- Automated validation implementation.
- Chart generation changes.
- Pro Drums flags.
- Audio conversion.
- Moonscraper automation.
- Clone Hero automation.

## Validation expectations

For Phase 03 output, manual validation checks:

- `notes.chart` opens in Moonscraper;
- `ExpertDrums` exists;
- game mode/lane mode are reasonable;
- only base lanes `N 0` to `N 4` are present;
- no unexpected `N 5`;
- no cymbal/ghost/accent/double-kick/star-power/drum-fill events are generated.

Full validation should be repeated later when Pro Drums and audio packaging exist.

## Definition of done

- Manual checklist exists and can be followed by a human.
- Mismatches can be recorded and turned into mapping/code tasks.
- Docs are updated.
- `pnpm build` passes if code changes are made.
- `pnpm typecheck` passes if code changes are made.
- Full Moonscraper/Clone Hero validation can remain pending if explicitly deferred.
