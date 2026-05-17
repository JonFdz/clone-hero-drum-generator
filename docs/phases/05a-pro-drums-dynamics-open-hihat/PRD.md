# PRD Phase 05A: Pro Drums Dynamics and Open Hi-Hat Encoding

## Final result

Generated charts encode supported Pro Drums dynamics flags and use a documented convention to distinguish open hi-hat from closed hi-hat.

Expected `.chart` encoding:

```txt
Cymbals:
yellow cymbal -> N 66
blue cymbal   -> N 67
green cymbal  -> N 68

Accents:
red accent    -> N 34
yellow accent -> N 35
blue accent   -> N 36
green accent  -> N 37

Ghosts:
red ghost     -> N 40
yellow ghost  -> N 41
blue ghost    -> N 42
green ghost   -> N 43
```

Open hi-hat convention:

```txt
hihat_closed -> yellow cymbal
hihat_open   -> yellow cymbal + yellow accent
```

## Why this phase exists

Phase 05 implemented cymbal/tom distinction but intentionally deferred ghost/accent chart encoding.

Further research and a reference chart confirmed that Moonscraper supports Pro Drums accent and ghost flags. Real charts also appear to use yellow cymbal + yellow accent as a practical open hi-hat convention.

This phase closes that gap before GPIF import work begins.

## Scope

- Emit supported accent flags for red/yellow/blue/green.
- Emit supported ghost flags for red/yellow/blue/green.
- Do not emit kick ghost/accent flags.
- Preserve existing cymbal modifier behavior.
- Encode `hihat_open` as yellow cymbal + yellow accent by default.
- Keep `hihat_closed` as yellow cymbal without accent.
- Preserve accent-over-ghost conflict prevention.
- Document exact encoding and the open hi-hat convention.
- Add tests for dynamics and open hi-hat behavior.

## Non-goals

- No GPIF import.
- No desktop UI.
- No lower difficulties.
- No Elite mode export.
- No star power.
- No drum fills.
- No audio packaging changes.
- No audio/chart offset support.
- No automatic Moonscraper automation.
- No separate/unverified open hi-hat `.chart` flag.

## Where to apply changes

- Shared model/types: `packages/core`
- Mapping behavior/data: `packages/mappings`
- Chart writing: `packages/chart`
- Documentation: `docs/`

Only modify folders relevant to this phase.

## Validation checklist

- Accent flags are emitted correctly.
- Ghost flags are emitted correctly.
- Kick ghost/accent flags are not emitted.
- Notes never emit both ghost and accent.
- Open hi-hat emits yellow cymbal + yellow accent.
- Closed hi-hat emits yellow cymbal only.
- Existing cymbal modifiers still work.
- Existing Pro Drums chart remains loadable.

## Definition of done

- Final result is achieved.
- Docs are updated.
- `pnpm build` passes.
- `pnpm typecheck` passes.
- `pnpm test` passes.
- Manual validation is recorded when applicable.
