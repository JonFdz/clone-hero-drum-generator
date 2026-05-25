# Phase 17G: Source Review Unification

## Goal

Unify the current desktop **Inspect Source**, **Track Selection**, and **Mapping** steps into one user-facing screen: **Source Review**.

The user should experience this as a single review step before Generate, even though the implementation still uses separate internal operations:

1. inspect source;
2. choose the default strongest track when needed;
3. normalize selected track(s);
4. review mapping only when attention is needed.

## Mockups

Reference mockups for this phase:

- `docs/desktop/mockups/11-source-review.png` — default/collapsed state.
- `docs/desktop/mockups/11a-source-review-expanded.png` — mapping and issues expanded state.

These mockups are the visual target for the phase. Use them together with `COMPONENTS.md` and `PRD.md`; they are not allowed to override canonical product constraints from `docs/desktop/mockup-corrections.md`.

## Scope summary

In scope:

- Add `/source-review` route.
- Replace sidebar entries `Inspect Source`, `Track Selection`, and `Mapping` with one `Source Review` entry.
- Automatically run source review on entry when needed.
- Persist complete analysis cache in `.chdg` when possible.
- Keep mapping compact by default, expanded only when useful.
- Keep Source Review independent from audio/output folder requirements.

Out of scope:

- Generate + Validation unification.
- Note editing.
- Section editing/creation.
- Manual merge strategy editing.
- `.chdg` bundle/archive conversion.
- Network/URL/scraping workflows.
