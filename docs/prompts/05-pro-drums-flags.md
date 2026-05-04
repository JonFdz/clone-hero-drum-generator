# Prompt Phase 05: Pro Drums Flags

        Read:

        - `AGENTS.md`
        - `docs/implementation/implementation-plan.md`
        - `docs/phases/05-pro-drums-flags/PRD.md`
        - `docs/phases/05-pro-drums-flags/ADR.md`
        - `docs/phases/05-pro-drums-flags/CHECKLIST.md`

        Implement Phase 05: Pro Drums Flags.

        ## Goal

        Generated charts encode cymbal/tom distinction and velocity-based ghost/accent behavior.

        ## Scope

        - Encode cymbal flags for yellow/blue/green
- Encode ghost notes
- Encode accent notes
- Make velocity thresholds configurable
- Prevent ghost and accent conflicts
- Document exact chart encoding

        ## Non-goals

        - Elite mode export
- Lower difficulties
- UI

        ## Architecture constraints

        - Keep CLI orchestration thin.
        - Put domain logic in the appropriate `packages/*` package.
        - Do not hardcode mappings in `apps/cli`.
        - Do not add frontend code unless this is the web planning phase.
        - Do not commit copyrighted MIDI/audio.
        - Update docs when behavior changes.

        ## Validation

        - Moonscraper displays cymbals as cymbals
- Ghost/accent notes display correctly
- Generated chart remains loadable
- Threshold behavior can be adjusted

        ## Finish by running

        ```bash
        pnpm build
        pnpm typecheck
        ```

## Confirmed cymbal flag encoding

Use the confirmed cymbal flag encoding:

```txt
yellow cymbal = base N 2 0 + flag N 66 0
blue cymbal   = base N 3 0 + flag N 67 0
green cymbal  = base N 4 0 + flag N 68 0
```

## Confirmed ghost flag encoding

Only red ghost is confirmed so far:

```txt
red ghost = base N 1 0 + flag N 40 0
```

Do not invent unconfirmed ghost flags for other lanes.

## Accent notes

Accent note encoding is not confirmed yet.

If implementing accent notes, first confirm the encoding with a Moonscraper-generated example, a Clone Hero-compatible reference chart, or source-code review.

If exact encoding is still unknown, document accent support as pending and do not implement it.
