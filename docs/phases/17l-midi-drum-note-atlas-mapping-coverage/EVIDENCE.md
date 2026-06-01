# Evidence — Phase 17L

## Commands

| Command | Result | Notes |
|---|---:|---|
| `pnpm test` | Pass | 57 files, 469 tests |
| `pnpm --filter @chdg/mappings test` | Pass | 3 files, 19 tests |
| `pnpm --filter @chdg/midi test` | Pass | 4 files, 50 tests |
| `pnpm --filter @chdg/project test` | Pass | 9 files, 74 tests |
| `pnpm exec vitest run apps/desktop/src/app/services/source-review-model.test.ts` | Pass | 1 file, 16 tests |
| `pnpm --filter @chdg/mappings typecheck` | Pass | `tsc -p tsconfig.json --noEmit` |
| `pnpm --filter @chdg/midi typecheck` | Pass | `tsc -p tsconfig.json --noEmit` |
| `pnpm --filter @chdg/project typecheck` | Pass | `tsc -p tsconfig.json --noEmit` |
| `pnpm exec tsc -p apps/desktop/tsconfig.json --noEmit` | Pass | Avoided `pnpm --filter @chdg/desktop typecheck` because it invokes Angular build and AGENTS says never build after changes. |
| `pnpm lint` | Pass | Workspace lint scripts currently echo `lint not configured yet`. |

## Manual validation

Not fully executed in this agent environment. Covered with focused automated fixtures for atlas resolution, MIDI normalization behavior, project coverage persistence/model, Source Review cache/UI model, and follow-up mapping attention semantics.

### MIDI with safe GM notes

- Source: automated fixtures using notes 36, 38, 42, 46, 49, 51.
- Expected: kick/snare/toms/hihat/crash/ride map automatically.
- Result: Pass.

### MIDI with candidates

- Source: automated fixtures using notes 39, 44, 56, 65/66, surdo/woodblock/claves/sticks coverage.
- Expected: candidates visible, not generated without override.
- Result: Pass.

### MIDI with ignored known percussion

- Source: automated fixtures using notes 54, 58, 69, 70, 80 and related ignored atlas entries.
- Expected: ignored summary, no noisy warning.
- Result: Pass.

### MIDI with unknown note

- Source: automated fixture using note 99/92 outside atlas.
- Expected: unknown warning/status, non-blocking Generate.
- Result: Pass.

### Override behavior

- Source: automated fixtures.
- Expected: override maps candidate/ignored/unknown to piece; override ignores auto-mapped note.
- Result: Pass.

### Cache invalidation

- Expected: atlas version participates in Source Review normalization cache/fingerprint.
- Result: Pass via `source-review-model.test.ts`.


## Follow-up semantic validation

- Candidate and ignored-known mapping rows are no longer counted as unknowns.
- Source Review attention distinguishes unresolved unknowns, unresolved candidates, ignored known percussion, and ready states.
- Piece/ignore overrides resolve candidate and unknown pending attention.
- Candidate and ignored percussion remain excluded from strong drum-track selection evidence in Phase 17L.
