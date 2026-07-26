# OpenSpec Verify — Phase 17N — GPIF Articulation Resolver

## Required automated tests

### Output MIDI priority

```text
InputMidiNumbers [92], Name "Hi-Hat (half)", OutputMidiNumber 46
=> map hihat_open
```

### Pedal Hi-Hat candidate

```text
Name "Pedal Hi-Hat", OutputMidiNumber 44
=> candidate hihat_closed
```

### Snare articulations

```text
Rimshot / Side Stick / Cross Stick
=> snare
```

### Cymbals

```text
Ride Bell + 53 => ride
China + 52 => crash
Splash + 55 => crash
```

### Auxiliary percussion

```text
Tambourine + 54 => ignore
High Bongo + 60 => candidate tom_high
```

### Unknown

```text
Custom articulation + InputMidiNumbers [92] + no output/name clue
=> unknown
```

### Conflicts

```text
Hi-Hat (half) + OutputMidiNumber 42
=> candidate/review conflict, not silent map
```

```text
Ride Bell + OutputMidiNumber 49
=> candidate/review conflict, not silent map
```

### Overrides

```text
Project override for GPIF articulation to piece
=> creates mapped hit
```

```text
Project override for GPIF articulation to ignore
=> skips hit and resolves attention
```

## Required validation commands

Follow `AGENTS.md`.

Suggested:

```bash
pnpm --filter @chdg/guitarpro test
pnpm --filter @chdg/project test
pnpm exec vitest run apps/desktop/src/app/services/source-review-model.test.ts
pnpm test
pnpm exec tsc -p packages/guitarpro/tsconfig.json --noEmit
pnpm exec tsc -p packages/project/tsconfig.json --noEmit
pnpm exec tsc -p apps/desktop/tsconfig.json --noEmit
```

If any command is disallowed or unavailable, record why in `EVIDENCE.md`.

## Manual validation

Use a GPIF/Guitar Pro file with half-open hi-hat using internal input number, pedal hi-hat, ride bell, china/splash, auxiliary percussion, and unknown custom articulation if possible.

Verify Source Review rows, overrides, generation behavior, and that Preview behavior is unchanged.
