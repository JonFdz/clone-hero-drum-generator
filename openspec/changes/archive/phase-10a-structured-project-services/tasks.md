# Tasks: Phase 10A — Structured Project Services + CLI --json

## 1. Read project context

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/desktop/README.md`.
- [ ] Read `docs/desktop/decisions.md`.
- [ ] Read `docs/desktop/mockup-corrections.md`.
- [ ] Read `docs/phases/10a-structured-project-services/PRD.md`.
- [ ] Read `docs/phases/10a-structured-project-services/ADR.md`.
- [ ] Read `docs/phases/10a-structured-project-services/CHECKLIST.md`.
- [ ] Read Phase 10 implementation/docs.
- [ ] Read these OpenSpec artifacts:
  - `proposal.md`
  - `design.md`
  - `specs/structured-project-services/spec.md`
  - `tasks.md`
  - `verify.md`

## 2. Sync context to Engram

- [ ] Save change ID: `phase-10a-structured-project-services`.
- [ ] Save branch name: `feat/phase-10a-structured-project-services`.
- [ ] Save issue number once created.
- [ ] Save scope: `packages/project` and CLI `--json`.
- [ ] Save non-goals:
  - no Desktop Generate MVP
  - no file pickers
  - no project persistence
  - no `.chdg` read/write
  - no multi-track generation
  - no preview player
  - no validation checklist UI
  - no mapping overrides
  - no packaging/distribution
- [ ] Save JSON rule: stdout must be valid JSON only when `--json` is active.
- [ ] Save future blocker note: Electron routing/deep links may need hash routing later.
- [ ] Save future blocker note: desktop hot reload/dev workflow may be needed later.
- [ ] Save review rule: final PR review is external and must be done by Jon/ChatGPT.
- [ ] Save merge rule: never merge without Jon's explicit approval.

## 3. Inspect current CLI and packages

- [ ] Inspect CLI command structure.
- [ ] Inspect command argument parsers.
- [ ] Inspect existing MIDI inspection/normalization.
- [ ] Inspect existing GPIF inspection/normalization.
- [ ] Inspect existing generate flow.
- [ ] Inspect existing tests and fixtures.
- [ ] Identify current human-output formatting.

## 4. Add `packages/project`

- [ ] Add package workspace.
- [ ] Add exported DTO types.
- [ ] Add structured issue type.
- [ ] Add source inspection service.
- [ ] Add normalization preview service.
- [ ] Add generation service/wrapper.
- [ ] Reuse existing package logic.
- [ ] Keep package free of Electron/Angular dependencies.

## 5. Add JSON support to CLI

- [ ] Add `--json` parsing to key commands.
- [ ] Add JSON output helper/envelope.
- [ ] Ensure stdout is JSON only in JSON mode.
- [ ] Keep human output for normal mode.
- [ ] Represent warnings/errors structurally.
- [ ] Ensure meaningful exit codes.

## 6. Tests

- [ ] Test project inspection DTO for MIDI.
- [ ] Test project inspection DTO for GPIF.
- [ ] Test normalization preview DTO for MIDI.
- [ ] Test normalization preview DTO for GPIF.
- [ ] Test generate result DTO.
- [ ] Test `--json` stdout parseability.
- [ ] Test human output still works.
- [ ] Test warnings do not corrupt JSON stdout.
- [ ] Test invalid input behavior in JSON mode where feasible.

## 7. Validate

Run:

```bash
pnpm build
pnpm typecheck
pnpm test
```

Manual JSON smoke tests where possible:

```bash
pnpm chdg inspect-gp /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp --json
pnpm chdg normalize-gp-drums /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp --track 3 --json
pnpm chdg generate /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.gp --track 3 --audio-source /Users/jonfdz/Projects/clone-hero-drum-generator/samples/demo.mp3 --out /Users/jonfdz/Projects/clone-hero-drum-generator/output/demo-json --json
```

If local copyrighted samples are unavailable, rely on synthetic fixtures/tests and say local validation was skipped.

## 8. Docs/checklist

- [ ] Update `docs/phases/10a-structured-project-services/CHECKLIST.md`.
- [ ] Update docs if actual DTOs or command names differ.
- [ ] Do not mark future phase work complete.

## 9. Git and PR

- [ ] Confirm branch is `feat/phase-10a-structured-project-services`.
- [ ] Commit changes.
- [ ] Push branch.
- [ ] Create PR linked to the issue when issue exists.
- [ ] Do not merge.
