# Verify — Phase 17M Source Review Mapping Coverage UI

## Automated validation

Run allowed commands according to `AGENTS.md`.

Suggested:

```bash
pnpm test
pnpm exec vitest run apps/desktop/src/app/services/source-review-model.test.ts
pnpm exec tsc -p apps/desktop/tsconfig.json --noEmit
pnpm lint
```

If package-specific commands exist and are allowed:

```bash
pnpm --filter @chdg/desktop test
pnpm --filter @chdg/project test
```

Do not run build commands if `AGENTS.md` forbids them.

## Manual validation scenarios

### Scenario 1 — Candidate with suggestion

Input/source includes MIDI 44 Pedal Hi-Hat.

Expected:

- appears as Candidate;
- suggested Closed Hi-Hat visible;
- not shown as Unknown;
- Apply suggestion creates override;
- row becomes resolved/override;
- reset override works.

### Scenario 2 — Candidate without suggestion

Input/source includes MIDI 56 Cowbell.

Expected:

- appears as Candidate;
- no default lane or low confidence visible;
- Map to... and Ignore available;
- no chart hit by default.

### Scenario 3 — Ignored known

Input/source includes MIDI 54 Tambourine.

Expected:

- appears as Ignored known;
- not included in Needs review;
- not a strong warning;
- Map to... available.

### Scenario 4 — Unknown

Input/source includes unknown note such as MIDI 92 in pure MIDI.

Expected:

- appears as Unknown;
- included in Needs review;
- map/ignore actions available;
- ignoring removes unresolved unknown state.

### Scenario 5 — Auto-mapped

Input/source includes MIDI 36, 38, 42, 49.

Expected:

- appears as Auto-mapped;
- default mapping visible;
- can override or ignore.

### Scenario 6 — Filters

Expected:

- Needs review shows unresolved candidates/unknowns only.
- Candidates shows candidate rows.
- Unknown shows unknown rows.
- Ignored known shows ignored known rows.
- Auto-mapped shows auto-mapped rows.
- Overrides shows overridden rows.
- All shows all rows.

### Scenario 7 — No pending rows

Expected:

- default filter is All;
- status is Automatic mapping ready or Known percussion ignored if only ignored known exists.

### Scenario 8 — Existing behaviors

Expected:

- Source Review still loads.
- Mapping profile save/apply still works.
- Generate behavior unchanged.
- Preview behavior unchanged.
