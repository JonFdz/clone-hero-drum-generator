# Proposal: Phase 10B — Multi-track Normalization / Generation

## Change ID

`phase-10b-multi-track-normalization-generation`

## Summary

Add multi-track selection, normalization and generation support for complementary drum tracks.

Expected CLI direction:

```bash
pnpm chdg generate /path/source.gp --tracks 3,10 --audio-source /path/audio.mp3 --out /path/output
```

while preserving existing single-track usage:

```bash
pnpm chdg generate /path/source.gp --track 3 --audio-source /path/audio.mp3 --out /path/output
```

The main goal is to support sources where drums are split across complementary tracks, for example:

```txt
track 3 = acoustic drums
track 10 = electronic/synthetic percussion
```

and combine them into one Clone Hero drum chart.

## Why this phase exists

Phase 10A added `packages/project` and structured CLI JSON output.

Before the Desktop Generate MVP, the backend should support the real selection model the desktop UI will need:

```txt
single selected track
or multiple selected tracks
combined summary
merge warnings
structured JSON result
```

This avoids building a desktop workflow around a single-track limitation that we already know is too restrictive.

## Goals

1. Add CLI `--tracks <csv>` while preserving `--track <index>`.
2. Support multi-track selection in `packages/project`.
3. Support multi-track normalization for MIDI and GPIF where feasible.
4. Merge selected tracks into a combined `DrumHit[]` stream.
5. Deduplicate identical hits.
6. Preserve source trace for hits where feasible.
7. Warn on impossible hand chords.
8. Keep open hi-hat priority over closed hi-hat when conflicting.
9. Prefer accent over normal, and normal over ghost, when conflicts are equivalent.
10. Do not average timing or velocity.
11. Add structured combined summary for CLI JSON and future desktop UI.
12. Keep existing single-track behavior compatible.
13. Keep existing human CLI output working.
14. Keep JSON mode clean and parseable.

## Flag behavior

Support:

```txt
--track 3
--tracks 3,10
```

Rules:

```txt
--track remains the single-track option
--tracks is the multi-track option
--track and --tracks together should fail clearly
--tracks accepts comma-separated track indexes
--tracks should reject empty values, non-integers, and duplicate indexes
single-track behavior should remain unchanged
```

Recommended internal model:

```ts
selectedTracks: number[]
```

`--track 3` can normalize to:

```ts
selectedTracks: [3]
```

## Merge behavior

Initial merge rules:

```txt
merge selected tracks into one DrumHit[] stream
sort by tick
deduplicate identical hits: same tick + same piece
do not average timing
do not average velocity
when deduplicating, keep the strongest/highest-velocity hit
preserve source trace where feasible
open hi-hat wins over closed hi-hat at the same tick
accent wins over normal when equivalent
normal hit wins over ghost when equivalent
warn on impossible hand chords instead of aggressively deleting notes
```

## Impossible hand chord warnings

The generated chart should not silently hide likely impossible hand combinations.

For this phase:

```txt
detect likely impossible hand chords
add structured warning issues
do not aggressively delete notes
do not build a full gameplay simplifier
```

A later phase can introduce configurable simplification.

## Structured summary

Add structured output for combined track selection.

Suggested fields:

```ts
type MultiTrackMergeSummary = {
  selectedTracks: number[];
  sourceTrackCount: number;
  inputHitCount: number;
  mergedHitCount: number;
  deduplicatedHitCount: number;
  duplicateHitCount: number;
  impossibleChordCount: number;
  issues: ProjectIssue[];
};
```

Exact naming can follow implementation conventions.

## CLI JSON behavior

`--json` output should include selected track information and merge summary.

Examples:

```json
{
  "ok": true,
  "data": {
    "selectedTracks": [3, 10],
    "mergeSummary": {
      "inputHitCount": 1200,
      "mergedHitCount": 1180,
      "duplicateHitCount": 20,
      "impossibleChordCount": 2
    }
  },
  "issues": []
}
```

JSON mode must remain clean:

```txt
stdout = valid JSON only
human logs must not be mixed into stdout
warnings/errors should be represented in JSON or sent to stderr
```

Reminder from Phase 10A:

```txt
When using pnpm wrappers for machine-readable output, use pnpm --silent chdg ... --json
```

## Non-goals

- No visual multi-track editor.
- No Desktop Generate MVP.
- No file picker UI.
- No project persistence.
- No `.chdg` read/write.
- No mapping override UI.
- No mapping profiles.
- No individual note editing.
- No preview player.
- No validation checklist UI.
- No aggressive automatic deletion of impossible chords.
- No configurable simplification strategy yet.
- No velocity/timing averaging.
- No Electron routing/deep-link changes.
- No desktop hot reload/dev-server workflow.

## Carry-forward follow-ups from Phase 10A

These are useful to address in this phase if touching nearby code, but they should not distract from multi-track work:

```txt
docs: document pnpm --silent for clean --json stdout
test: add direct GPIF generatePackage unit coverage if generation tests are being updated
```

## Product constraints

Continue to respect:

```txt
local-first
100% offline
no uploads
no YouTube/URL imports
no scraping
no Moonscraper dependency
.chdg is a project file, not Clone Hero output
Clone Hero output = notes.chart + song.ini + song.ogg
```

## Required docs to read

```txt
docs/desktop/README.md
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
docs/phases/10b-multi-track-normalization-generation/PRD.md
docs/phases/10b-multi-track-normalization-generation/ADR.md
docs/phases/10b-multi-track-normalization-generation/CHECKLIST.md
docs/phases/10a-structured-project-services/PRD.md
```

Visual reference:

```txt
docs/desktop/mockups/05-track-selection.png
```

## Validation

Required:

```bash
pnpm build
pnpm typecheck
pnpm test
```

Manual JSON validation with local samples where possible:

```bash
pnpm --silent chdg generate /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp \
  --tracks 3,10 \
  --audio-source /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mp3 \
  --out /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo-multitrack \
  --json
```

If local multi-track sample data is not meaningful, use synthetic tests and clearly state that local multi-track validation was limited.

## Review policy

The implementation agent should do focused self-checks only.

Final PR review is external and will be performed by Jon/ChatGPT.

The agent must not merge.
