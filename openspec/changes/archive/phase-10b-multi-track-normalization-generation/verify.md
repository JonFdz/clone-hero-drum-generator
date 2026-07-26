# Verify: Phase 10B — Multi-track Normalization / Generation

## Required validation

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
```

All must pass.

## CLI flag validation

Verify:

```txt
--track 3 still works
--tracks 3,10 works
--track 3 --tracks 3,10 fails clearly
--tracks "" fails clearly
--tracks 3,abc fails clearly
--tracks 3,3 fails clearly
```

## JSON validation

For multi-track commands with `--json`, verify:

```txt
stdout is parseable JSON
no human headings/tables/logs appear in stdout
selectedTracks appears in the JSON result
mergeSummary appears in the JSON result
warnings are represented in issues[] or stderr
```

Use `pnpm --silent` when validating machine-readable output through pnpm:

```bash
pnpm --silent chdg generate /path/source.gp --tracks 3,10 --audio-source /path/audio.mp3 --out /path/output --json
```

## Merge behavior validation

Confirm:

```txt
duplicate same tick + same piece hits are deduplicated
timing is not averaged
velocity is not averaged
open hi-hat wins over closed hi-hat at same tick
impossible hand chords produce warnings
impossible hand chords are not aggressively deleted
single-track output remains compatible
```

## Project service validation

Confirm:

```txt
packages/project supports selected track arrays
normalizeSelection supports multi-track
generatePackage supports multi-track
structured merge summary exists
structured issues are returned
```

## Scope checks

Confirm this PR does not implement:

```txt
Desktop Generate MVP
file picker flow
project persistence
.chdg read/write
mapping override UI
preview player
validation checklist UI
packaging/distribution
auto simplification strategy
individual note editor
```

## PR summary requirements

The PR description should include:

- issue link, if available;
- OpenSpec change ID;
- `--tracks` behavior;
- single-track compatibility note;
- merge rules implemented;
- impossible chord warning behavior;
- JSON output summary;
- tests run;
- local validation result, if available;
- note if local multi-track validation was limited;
- explicit non-goals;
- note that final review is external;
- note that the PR must not be merged without Jon's approval.
