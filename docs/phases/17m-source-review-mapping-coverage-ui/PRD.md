# PRD — Phase 17M Source Review Mapping Coverage UI

## Problem

Phase 17L introduced a rich mapping coverage model, but Source Review still exposes that model with minimal UI.

The current user experience is not clear enough for real chart review:

- users may see counts but not understand which notes require action;
- candidates, ignored known percussion, unknowns, and overrides need clearer visual separation;
- the override workflow is too generic;
- there is not enough copy explaining why candidates are skipped by default;
- the UI does not yet help the user focus on only items that need review.

## Goals

1. Make Mapping Review understandable at a glance.
2. Help the user focus on unresolved candidates and unknown notes.
3. Keep ignored known percussion visible but low-priority.
4. Make applying suggested mappings fast for candidates.
5. Make ignoring or mapping unknown notes straightforward.
6. Preserve existing override behavior.
7. Avoid changing backend mapping semantics.
8. Avoid a large redesign of the whole Source Review page.

## User stories

### As a user reviewing a MIDI source

I want to see whether CHDG mapped the main drum notes automatically so I can trust the generated chart.

### As a user reviewing candidates

I want to see notes such as `44 Pedal Hi-Hat` as candidates with a suggested piece, so I can decide whether to map them.

### As a user reviewing ignored known percussion

I want to know that CHDG saw auxiliary percussion such as Tambourine, Shaker, or Triangle and intentionally ignored it, so I do not mistake it for missing data.

### As a user reviewing unknown notes

I want unknown notes to stand out, so I can map or ignore them before generation if they are important.

### As a user using overrides

I want to see which rows have overrides and reset them easily.

## Required UX decisions

### Layout

Use a hybrid compact list/card layout, not a plain dense table.

Each row should behave like a compact card with readable sections:

- source identity;
- note name;
- status badge;
- count;
- suggested/default mapping;
- reason/confidence where useful;
- quick actions.

The list should fit many rows without becoming too tall.

### Filters

Required filters:

- `Needs review`
- `Candidates`
- `Unknown`
- `Ignored known`
- `Auto-mapped`
- `Overrides`
- `All`

Default:

- `Needs review` when there are unresolved candidates or unresolved unknowns.
- `All` when there is nothing pending.

### Needs review definition

`Needs review` includes:

- unresolved candidates;
- unresolved unknowns.

It must not include:

- ignored known percussion;
- auto-mapped rows;
- rows already resolved by override.

### Status badges

Required row status categories:

- `Auto-mapped`
- `Candidate`
- `Ignored known`
- `Unknown`
- `Override`
- `Ignored override` if useful
- `Mapped override` if useful

Recommended visual severity:

- Auto-mapped: success/neutral.
- Candidate: amber/review.
- Ignored known: muted/info.
- Unknown: danger/warning.
- Override: accent/purple.

Do not make ignored known percussion look like an error.

### Quick actions

Rows must expose actions without requiring the user to understand internals.

#### Candidate with suggested piece

Example: `MIDI 44 · Pedal Hi-Hat · Suggested: Closed Hi-Hat`

Actions:

- `Apply suggestion`
- `Ignore`
- `More...` or compact piece selector

#### Candidate without suggested piece

Example: `MIDI 56 · Cowbell`

Actions:

- `Map to...`
- `Ignore`

#### Unknown

Actions:

- `Map to...`
- `Ignore`

#### Ignored known

Actions:

- `Keep ignored`
- `Map to...`

`Keep ignored` can be visual/text only if the row already has no override; it does not need to write an explicit override.

#### Auto-mapped

Actions:

- `Keep default`
- `Override`
- `Ignore`

`Keep default` can be visual/text only if no override exists.

#### Override row

If a row has an override, show:

- current override target;
- `Reset override`.

Reset must remove the project override and recompute Source Review using existing behavior.

### Copy

Add short educational copy:

- “Candidates are skipped by default. Apply a suggestion only if the sound is important for the playable drum chart.”
- “Known ignored percussion is recognized but not charted by default.”
- “Unknown notes were skipped because CHDG does not know what drum lane they represent.”

Keep copy short and contextual.

### Count and timing

Show:

- hit/event count for each row;
- first tick if available.

Do not implement tick-to-time conversion unless a direct helper already exists and can be used without expanding scope.

### Confidence and reason

Show confidence/reason:

- visible and discreet for candidates and unknowns;
- optional/collapsed or less prominent for auto-mapped rows;
- visible for ignored known percussion when helpful.

### Profiles

Keep profile controls low prominence.

Do not redesign mapping profiles in this phase.

### Old `/mapping` page

Review whether `/mapping` is still routed/used.

- If clearly dead, remove it or remove dead duplicate UI code.
- If it is still live, do not risk route removal in this phase.
- Prefer shared model/helper code over divergent mapping UI models.
- Do not maintain a second divergent mapping user experience.

## Functional requirements

### FR1 — Coverage summary

Mapping Review must show a compact summary using Phase 17L coverage data.

It should include:

- mapped events;
- candidate events;
- ignored known events;
- unknown events;
- unresolved candidate count;
- unresolved unknown count;
- override count.

### FR2 — Filterable row list

Mapping Review must allow filtering by:

- Needs review
- Candidates
- Unknown
- Ignored known
- Auto-mapped
- Overrides
- All

### FR3 — Row status classification

Rows must be classified based on:

- row action;
- override presence;
- unresolved state.

An override must take precedence for display.

### FR4 — Candidate suggested action

Candidate rows with `suggestedPiece` must expose `Apply suggestion`.

Applying suggestion must create/update the existing project mapping override to that piece.

### FR5 — Unknown actions

Unknown rows must expose map and ignore actions.

Mapping an unknown row must create a piece override.

Ignoring an unknown row must create an ignore override.

### FR6 — Ignored known actions

Ignored known rows must make it clear they are intentionally skipped.

They must allow mapping to a piece if the user wants that percussion in the playable chart.

### FR7 — Auto-mapped actions

Auto-mapped rows must show the default mapping and allow override or ignore.

### FR8 — Reset override

Rows with overrides must show reset/remove override.

Reset must remove the override and trigger existing mapping-changed recalculation.

### FR9 — Preserve behavior

All existing mapping override behavior must continue to work.

### FR10 — Do not change atlas semantics

Do not change `MAPPING_ATLAS_DECISIONS.md` behavior or Phase 17L backend mapping semantics.

## Acceptance criteria

1. Mapping Review has a compact summary distinguishing mapped, candidates, ignored known, unknown, and overrides.
2. Filters exist and work as specified.
3. Default filter is `Needs review` when unresolved candidates/unknowns exist.
4. Default filter is `All` when no unresolved candidates/unknowns exist.
5. Candidate rows do not appear as unknown.
6. Ignored known rows do not appear as unknown or warning.
7. Unknown rows stand out as requiring manual mapping/ignore.
8. Candidate rows with suggestions show `Apply suggestion`.
9. Applying suggestion creates the correct piece override.
10. Unknown rows can be mapped or ignored.
11. Ignored known rows can be mapped if desired.
12. Auto-mapped rows can be overridden or ignored.
13. Rows with override show reset.
14. Reset override removes the project override and refreshes state.
15. Existing mapping profile behavior is not broken.
16. No Preview, Generate, tempo, or GPIF articulation behavior changes.
17. Full profile/aggressive automapping is not implemented.
18. Tests cover filter/classification/action behavior.

## Out of scope

- No atlas decision changes.
- No GPIF articulation resolver.
- No aggressive candidate profile.
- No mapping profile redesign.
- No global mapping editor.
- No chart generation behavior change.
- No Preview changes.
- No tempo map review.
- No tick-to-time conversion unless trivial and already available.
