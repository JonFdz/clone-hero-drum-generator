# ADR Phase 14B: Clone Hero Highway Preview

## Status

Proposed.

## Decision

Add a read-only Clone Hero-style highway preview to the existing Preview page.

The highway will build on Phase 14A audio/timeline preview and reuse the same local/offline project data sources.

## Roadmap boundary

```txt
Phase 14A — Audio + Waveform + Timeline Preview
Phase 14B — Clone Hero Highway Preview
Phase 15  — Offset Adjustment Loop
```

Phase 14B must not implement Phase 15 persisted offset adjustment.

## Rationale

The app generates Clone Hero drum charts. Timeline preview helps verify timing, but a highway gives a better sense of playability, lane density, cymbals, accents, ghosts, and how the chart will feel in-game.

This moves CHDG toward being self-sufficient without depending on Moonscraper for every inspection step.

## Data decision

Prefer generated `notes.chart` when available because it represents actual output.

Fallbacks are allowed:

```txt
structured generated/normalized data
normalization preview data
```

Fallbacks must show limitations clearly when they cannot represent all Clone Hero modifiers.

## Rendering decision

Implement a simplified highway, not an exact Clone Hero clone.

Use:

```txt
5 drum lanes
hit line
notes positioned relative to current audio time
lookahead window / note speed if useful
modifier styling for cymbals/accent/ghost/open hi-hat where available
```

## Security decision

Do not add renderer filesystem access.

Any generated chart/audio access must use the existing secure bridge pattern and path validation.

## Constraints

- Keep everything local/offline.
- Preserve backend/CLI behavior.
- Preserve existing project persistence and validation behavior.
- Keep the PR scoped to Phase 14B.
- Do not add gameplay/scoring.
- Do not add note editing.
- Do not add persisted offset adjustment.
- Final PR review is external.
- PRs must not be merged without explicit approval.
