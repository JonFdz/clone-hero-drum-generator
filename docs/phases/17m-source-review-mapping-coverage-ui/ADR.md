# ADR — Source Review Mapping Coverage UI

## Context

Phase 17L added a correct backend model for mapping coverage, but the UI still exposes it minimally.

The system can now distinguish:

- auto-mapped notes;
- candidates;
- ignored known percussion;
- true unknowns;
- overrides.

A good Source Review UI must make these distinctions visible and actionable.

## Decision

Implement a compact list/card Mapping Review UI inside Source Review.

Use a hybrid layout instead of a pure table.

Add category filters:

- Needs review
- Candidates
- Unknown
- Ignored known
- Auto-mapped
- Overrides
- All

Use `Needs review` as the default filter when unresolved candidates or unknowns exist.

Do not include ignored known percussion in `Needs review`.

Add quick actions for the common user decisions:

- Apply suggestion
- Map to...
- Ignore
- Reset override

Keep educational copy short.

Keep profile controls low prominence.

## Why not a pure table?

A table is efficient, but the mapping review must explain reasons, confidence, suggestions, and override state. Compact cards make this easier without requiring a large UI redesign.

## Why not hide ignored known percussion?

Ignored known percussion is intentionally skipped, but users still need to know that CHDG saw it. Hiding it would make users think notes disappeared.

## Why not automap candidates?

Phase 17L decided that candidates do not generate by default. Phase 17M must preserve that rule.

## Why not implement profiles/aggressive mode now?

Profiles and aggressive candidate automapping are useful but would add product decisions and risk. This phase focuses on making current decisions understandable and overrideable.

## Consequences

### Positive

- Users can quickly see what needs attention.
- Candidates are actionable.
- Unknowns stand out.
- Ignored known percussion is visible but not alarming.
- The UI becomes ready for future GPIF articulation and mapping-profile improvements.

### Negative / tradeoffs

- The Mapping Review section becomes more complex.
- Some code may need refactoring into reusable classification helpers.
- Full profile management still remains for a later phase.
