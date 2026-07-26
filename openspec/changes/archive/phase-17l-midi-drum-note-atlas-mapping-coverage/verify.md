# Verify — Phase 17L

## Automated checks

Run according to `AGENTS.md`. If a command is disallowed, report it honestly.

Suggested commands:

```bash
pnpm test
pnpm --filter @chdg/mappings test
pnpm --filter @chdg/midi test
pnpm --filter @chdg/project test
pnpm --filter @chdg/desktop test
pnpm lint
```

Typecheck commands if allowed:

```bash
pnpm --filter @chdg/mappings typecheck
pnpm --filter @chdg/midi typecheck
pnpm --filter @chdg/project typecheck
pnpm --filter @chdg/desktop typecheck
```

## Required test evidence

- Atlas resolver maps safe GM notes.
- Atlas resolver returns candidate for 39, 44, 56, bongos/congas/timbales/surdo, woodblocks/claves/sticks/slap.
- Atlas resolver returns ignore for tambourine, vibraslap, agogo, cabasa, maracas, whistles, guiro, cuica, triangle, metronome, scratch/FX.
- Unknown note outside atlas returns unknown.
- Invalid note outside 0–127 is handled safely.
- Candidate does not generate hit by default.
- Ignore does not generate hit by default.
- Override maps candidate/ignored/unknown to piece.
- Override ignores auto-mapped note.
- Coverage summary counts mapped/candidate/ignored/unknown events and sources.
- Source Review cache/fingerprint changes with atlas version.
- `.chdg` persistence includes mapping coverage summary.

## Manual validation

Use at least one MIDI source or fixture containing:

- safe notes: 36, 38, 42, 46, 49, 51;
- candidate notes: 39, 44, 56, 65, 66;
- ignored known notes: 54, 58, 69, 70, 80;
- unknown note outside atlas.

Expected Source Review:

- Safe notes appear mapped.
- Candidate notes appear for review and do not affect hit count unless overridden.
- Ignored known notes appear in low-noise summary/detail.
- Unknown note appears as non-blocking warning/status.

Expected Generate:

- Generate succeeds.
- Candidate/unknown/ignored behavior matches Source Review.
- No unrelated Preview/section behavior changes.
