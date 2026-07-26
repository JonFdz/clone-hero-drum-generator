# Change: Phase 17G — Source Review Unification

## Why

CHDG Desktop currently exposes three separate user-facing steps for one conceptual task:

- Inspect Source
- Track Selection
- Mapping

That split reflects the implementation pipeline, but it forces the user to think in internal stages and manually trigger inspection/normalization. The desired product behavior is a single **Source Review** screen where CHDG automatically analyzes the selected source, selects a sensible default drum track, builds the normalized preview, and lets the user review tracks, mapping, and issues before generation.

## What Changes

- Add a new user-facing route: `/source-review`.
- Replace the sidebar entries `Inspect Source`, `Track Selection`, and `Mapping` with one `Source Review` item.
- Keep old routes as redirects to `/source-review` if needed for compatibility.
- Add a unified Source Review screen matching the provided mockups:
  - `docs/desktop/mockups/11-source-review.png`
  - `docs/desktop/mockups/11a-source-review-expanded.png`
- Automatically run source review when a valid source exists and no valid cached analysis is available.
- Select exactly one strongest track by default for a new source.
- Preserve manual track selection until the source changes.
- Re-normalize automatically when selected tracks or mapping overrides change.
- Keep Mapping Review compact by default and expand/show attention when unknowns, overrides, or review-worthy issues exist.
- Keep Issues & Warnings compact when clean and expanded/useful when attention is required.
- Persist a complete analysis cache in `.chdg` when possible.
- Update Generate/Validation navigation and fix routes to use `/source-review` instead of old track/mapping routes.

## Impact

### Affected areas

- Desktop routing and sidebar navigation.
- Source inspection, track selection, normalization, and mapping UI.
- Desktop generate state and validation routes.
- Electron project file read/write payloads.
- `.chdg` project file schema and validation.
- Mapping profile UI reuse.
- Tests for project file compatibility, orchestration, routing, and UI/model behavior.

### First implementation task

Before editing code, the implementation agent MUST:

1. Read this OpenSpec change.
2. Read `AGENTS.md`.
3. Transfer accepted decisions, constraints, tasks, and validation rules from this OpenSpec into Engram.
4. Treat Engram as the project source of truth for implementation.
5. Implement from Engram plus the committed phase docs.

OpenSpec is a review/transfer artifact. It is not the project source of truth.
