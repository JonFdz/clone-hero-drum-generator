# Phase 17M — Source Review Mapping Coverage UI

## Status

Accepted for implementation after Phase 17L.

## Summary

Phase 17M turns the MIDI Drum Note Atlas and mapping coverage model introduced in Phase 17L into a clear, actionable Source Review user experience.

Phase 17L introduced the backend/model foundation:

- `map`
- `candidate`
- `ignore`
- `unknown`
- mapping coverage summary
- mapping atlas version `0.1.0`
- minimal Source Review coverage text

Phase 17M must improve the Mapping Review section so users can understand what CHDG detected, what was automatically mapped, what was skipped, what needs review, and how to apply or reset overrides.

This phase is UI/UX-focused. It must not change the atlas decisions or default mapping behavior.

## Core product rule

Candidates remain skipped by default.

Ignored known percussion remains skipped by default.

Unknown notes remain skipped unless the user maps or ignores them.

The UI must make those decisions understandable and easy to override.

## Outcome

After this phase, Source Review should show a useful Mapping Review area with:

- clear coverage summary;
- filters;
- compact row/card list;
- readable decisions and reasons;
- quick actions;
- override status;
- reset actions;
- educational copy.

## Primary user question answered by this phase

> “What did CHDG do with each MIDI drum/percussion note, and what should I review?”

## Non-goals

This phase must not implement:

- new atlas entries or mapping decisions;
- candidate automapping;
- aggressive mapping profiles;
- GPIF articulation resolver;
- tempo map review;
- Preview changes;
- Generate screen redesign;
- manual global mapping editor;
- section editor.

## Relationship to adjacent phases

- Phase 17L: backend/model foundation for mapping coverage.
- Phase 17M: Source Review UI for that mapping coverage.
- Phase 17N: future GPIF articulation mapping, for cases such as GPIF `InputMidiNumbers 92 / Hi-Hat (half) / OutputMidiNumber 46`.
