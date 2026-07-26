# Tasks: Phase 10B — Multi-track Normalization / Generation

## 1. Read project context

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/phases/10b-multi-track-normalization-generation/PRD.md`.
- [ ] Read `docs/phases/10b-multi-track-normalization-generation/ADR.md`.
- [ ] Read `docs/phases/10b-multi-track-normalization-generation/CHECKLIST.md`.
- [ ] Read `docs/phases/10a-structured-project-services/PRD.md`.
- [ ] Review `docs/desktop/mockups/05-track-selection.png`.
- [ ] Read these OpenSpec artifacts:
  - `proposal.md`
  - `design.md`
  - `specs/multi-track-normalization-generation/spec.md`
  - `tasks.md`
  - `verify.md`

## 2. Sync context to Engram

- [ ] Save change ID: `phase-10b-multi-track-normalization-generation`.
- [ ] Save branch name: `feat/phase-10b-multi-track-normalization-generation`.
- [ ] Save issue number once created.
- [ ] Save scope: multi-track normalization/generation only.
- [ ] Save CLI flag decision:
  - preserve `--track <index>`
  - add `--tracks <csv>`
  - reject `--track` and `--tracks` together.
- [ ] Save merge rules:
  - merge selected tracks into one hit stream
  - deduplicate same tick + same piece
  - do not average timing
  - do not average velocity
  - keep strongest duplicate hit
  - open hi-hat wins over closed hi-hat
  - warn on impossible hand chords
  - do not aggressively delete impossible chords
- [ ] Save JSON rule: stdout must be valid JSON only when `--json` is active.
- [ ] Save non-goals:
  - no desktop UI
  - no project persistence
  - no `.chdg` read/write
  - no mapping override UI
  - no preview
  - no validation checklist UI
  - no packaging
- [ ] Save review rule: final PR review is external and must be done by Jon/ChatGPT.
- [ ] Save merge rule: never merge without Jon's explicit approval.

## 3. Inspect current implementation

- [ ] Inspect `packages/project`.
- [ ] Inspect `GeneratePackageInput` / `GeneratePackageResult`.
- [ ] Inspect `normalizeSelection`.
- [ ] Inspect `generatePackage`.
- [ ] Inspect CLI arg parsers.
- [ ] Inspect JSON output tests.
- [ ] Inspect current chart mapping/deduplication behavior.

## 4. Add track selection parsing

- [ ] Add `--tracks`.
- [ ] Preserve `--track`.
- [ ] Reject `--track` + `--tracks`.
- [ ] Reject empty `--tracks`.
- [ ] Reject non-integer values.
- [ ] Reject duplicate values.
- [ ] Add parser tests.
- [ ] Update help output.

## 5. Update project DTOs

- [ ] Add selected track array support.
- [ ] Preserve single-track compatibility.
- [ ] Add merge summary type.
- [ ] Add structured merge issue codes.
- [ ] Export needed types from `@chdg/project`.

## 6. Implement multi-track normalization

- [ ] Normalize single-track path unchanged.
- [ ] Normalize multiple MIDI tracks.
- [ ] Normalize multiple GPIF tracks.
- [ ] Merge hits.
- [ ] Deduplicate duplicates.
- [ ] Apply open hi-hat priority.
- [ ] Detect impossible hand chord warnings.
- [ ] Preserve source trace where feasible.
- [ ] Return structured merge summary.

## 7. Implement multi-track generation

- [ ] Generate from merged hits.
- [ ] Keep existing single-track generated output unchanged.
- [ ] Include selected tracks in result.
- [ ] Include merge summary in result.
- [ ] Include structured issues.
- [ ] Keep metadata/offset/audio behavior unchanged.

## 8. CLI output

- [ ] Human output mentions selected tracks.
- [ ] Human output mentions merge summary when multi-track.
- [ ] JSON output includes selected tracks and merge summary.
- [ ] JSON stdout remains clean.
- [ ] Document `pnpm --silent` for machine JSON if updating docs nearby.

## 9. Tests

- [ ] Test `--tracks` parsing.
- [ ] Test invalid `--tracks`.
- [ ] Test `--track` + `--tracks` conflict.
- [ ] Test MIDI multi-track normalize.
- [ ] Test GPIF multi-track normalize.
- [ ] Test generatePackage GPIF multi-track.
- [ ] Test single-track backwards compatibility.
- [ ] Test duplicate hit dedupe.
- [ ] Test open hi-hat wins over closed.
- [ ] Test impossible hand chord warning.
- [ ] Test JSON parseability with `--tracks`.
- [ ] Test human output with `--tracks`.

## 10. Validate

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
```

Optional local validation:

```bash
pnpm --silent chdg generate /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp --tracks 3,10 --audio-source /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mp3 --out /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo-multitrack --json
```

If local samples do not meaningfully contain complementary tracks, state that local multi-track validation was limited and rely on synthetic tests.

## 11. Docs/checklist

- [ ] Update `docs/phases/10b-multi-track-normalization-generation/CHECKLIST.md`.
- [ ] Update docs if actual DTO/flag names differ.
- [ ] Do not mark future phase work complete.

## 12. Git and PR

- [ ] Confirm branch is `feat/phase-10b-multi-track-normalization-generation`.
- [ ] Commit changes.
- [ ] Push branch.
- [ ] Create PR linked to issue when issue exists.
- [ ] Do not merge.
