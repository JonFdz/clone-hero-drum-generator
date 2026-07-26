# Verify: Phase 10A — Structured Project Services + CLI --json

## Required validation

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
```

All must pass, or the PR must clearly explain any pre-existing unrelated failure.

## JSON validation

For each command updated with `--json`, verify:

```txt
stdout is parseable JSON
no human headings/tables/logs appear in stdout
warnings are represented in JSON or stderr
exit codes remain meaningful
normal human output still works without --json
```

Suggested manual checks:

```bash
pnpm chdg inspect-gp /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp --json
pnpm chdg normalize-gp-drums /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp --track 3 --json
pnpm chdg generate /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp --track 3 --audio-source /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mp3 --out /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo-json --json
```

If local files are absent, use test fixtures and mention skipped local validation.

## Project service validation

Confirm:

```txt
packages/project exists
package exports structured DTOs
MIDI inspect service works
GPIF inspect service works
MIDI normalization preview works
GPIF normalization preview works
generate service/wrapper returns structured result
issues/warnings are structured
```

## Scope checks

Confirm this PR does not implement:

```txt
Desktop Generate MVP
file picker flow
project persistence
.chdg read/write
multi-track generation
validation checklist UI
preview player
offset adjustment UI
mapping overrides
packaging/distribution
```

## Future blockers note

PR should mention whether it touched or deferred:

```txt
Electron route/deep-link strategy
Desktop hot reload/dev workflow
```

These should usually remain deferred.

## PR summary requirements

The PR description should include:

- issue link, if available;
- OpenSpec change ID;
- `packages/project` summary;
- DTOs added;
- CLI commands with `--json`;
- JSON stdout guarantee;
- tests run;
- local JSON validation result, if available;
- note if local validation was skipped;
- explicit non-goals;
- note that final review is external;
- note that the PR must not be merged without Jon's approval.
