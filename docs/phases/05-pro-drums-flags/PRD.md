# PRD Phase 05: Pro Drums Flags

## Final result

Generated charts encode cymbal/tom distinction for supported Clone Hero Pro Drums cymbal modifiers. Velocity-based ghost/accent flags remain internal until chart constants are verified.

Implemented cymbal encoding:

```txt
yellow cymbal -> N 66
blue cymbal   -> N 67
green cymbal  -> N 68
```

Deferred if not verified:

```txt
ghost/accent chart encoding
```

## Why this phase exists

This phase creates a concrete, reviewable step toward the full MIDI-to-Clone-Hero drum chart pipeline. It must remain small enough to validate before the next phase begins.

## Scope

- Encode cymbal flags for yellow/blue/green.
- Preserve base lane notes for cymbals.
- Preserve toms as base notes only.
- Keep ghost/accent flags internal.
- Make velocity thresholds configurable in code.
- Prevent ghost and accent conflicts.
- Document exact chart encoding and deferred ghost/accent chart encoding.

## Non-goals

- Elite mode export
- Lower difficulties
- UI
- Invented or guessed ghost/accent chart constants

## Where to apply changes

- CLI orchestration: `apps/cli`
- Shared model/timing: `packages/core`
- MIDI behavior: `packages/midi`
- Mapping behavior/data: `packages/mappings`
- Chart writing: `packages/chart`
- Validation: `packages/validation`
- Documentation: `docs/`

Only modify the folders relevant to this phase.

## Validation checklist

- Chart writer emits `N 66`, `N 67`, and `N 68` for supported cymbals.
- Toms do not emit cymbal modifiers.
- Ghost/accent notes cannot both be true internally.
- Ghost/accent chart encoding is documented as deferred when constants are not verified.
- Generated chart remains loadable.
- Threshold behavior can be adjusted in code.

## Definition of done

- Final result is achieved.
- Docs are updated.
- `pnpm build` passes.
- `pnpm typecheck` passes.
- `pnpm test` passes.
- Manual validation is completed when applicable.
