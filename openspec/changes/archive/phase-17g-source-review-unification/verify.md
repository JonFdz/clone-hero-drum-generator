# Verify: Phase 17G — Source Review Unification

## Automated commands

Run from repo root:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

## Manual validation

### Source Review first analysis

- [ ] Open a project with a valid source and no analysis cache.
- [ ] Navigate to Source Review.
- [ ] Confirm analysis starts automatically.
- [ ] Confirm the UI presents a single Source Review flow, not separate Inspect/Normalize steps.
- [ ] Confirm exactly one strongest track is selected by default.
- [ ] Confirm Combined Summary populates automatically.
- [ ] Confirm Piece Summary Preview populates automatically.
- [ ] Confirm Source Review does not require audio or output folder.

### Cache behavior

- [ ] Save/reopen the project.
- [ ] Navigate to Source Review.
- [ ] Confirm valid cached analysis loads.
- [ ] Confirm inspect/normalize do not rerun unnecessarily.
- [ ] Confirm `Source review up to date` is shown.

### Source changes

- [ ] Change source in Project Details.
- [ ] Navigate to Source Review.
- [ ] Confirm old analysis is invalidated.
- [ ] Confirm manual selectedTracks are reset.
- [ ] Confirm exactly one strongest track is selected for the new source.
- [ ] Confirm normalized preview updates.

### Track selection changes

- [ ] Select an additional track.
- [ ] Confirm manual multi-track selection is preserved.
- [ ] Confirm normalization preview updates automatically.
- [ ] Confirm autosave occurs when possible.
- [ ] Confirm the default auto-selection is not reapplied until source changes.

### Mapping clean state

- [ ] Open Source Review for a clean mapping state.
- [ ] Confirm Mapping Review is collapsed/compact.
- [ ] Confirm summary shows mapped sources, unknowns, overrides, and profile status.

### Mapping expanded/attention state

- [ ] Use a source or override state with unknowns/overrides.
- [ ] Confirm Mapping Review expands or clearly prompts review.
- [ ] Expand Mapping Review.
- [ ] Confirm mapping table columns are Source Kind, Source Value, Detected Meaning, Current Mapping, Override, Status.
- [ ] Change an override.
- [ ] Confirm normalization preview updates automatically.
- [ ] Confirm autosave occurs when possible.
- [ ] Confirm profile actions still work.

### Issues & Warnings

- [ ] Confirm clean state is compact.
- [ ] Confirm warning/unknown state expands or clearly prompts review.
- [ ] Confirm warnings and unknowns provide Review in Mapping Review actions where useful.

### Navigation

- [ ] Confirm sidebar has Source Review.
- [ ] Confirm sidebar no longer has Inspect Source, Track Selection, or Mapping.
- [ ] Confirm Project Details routes to Source Review.
- [ ] Confirm Generate Back returns to Source Review.
- [ ] Confirm Validation fix routes for tracks/chart go to Source Review.
- [ ] Confirm old direct routes redirect to Source Review if compatibility redirects are implemented.

## Review checklist

- [ ] No fake project state is introduced.
- [ ] No audio/output requirement is added to Source Review.
- [ ] No role column appears in Track Candidates.
- [ ] No Merge Rules card appears.
- [ ] No section creation/editing appears.
- [ ] No network/URL/scraping/upload behavior is added.
- [ ] No source/audio/cover embedding is added to `.chdg`.
- [ ] No `.chdg` bundle/archive conversion is added.
