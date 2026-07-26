# Implementation Prompt — F5: frontend: add compact two-level project mappings

Work in `JonFdz/clone-hero-drum-generator` on issue `<ISSUE_NUMBER>` and branch `frontend/<ISSUE>-mappings`.

## Read first

1. `AGENTS.md`
2. `openspec/changes/chdg-simplified-v1/`
3. `docs/product/CHDG_V1_PRODUCT_DECISIONS.md`
4. `docs/product/PRD.md`
5. relevant `docs/architecture/simplified-v1-*`
6. `docs/roadmaps/simplified-v1-worktree-plan.md`
7. the issue specification

Transfer accepted OpenSpec decisions to Engram before implementation.

## Ownership

Mappings tab/components/facade/tests.

## Implement

- Render source, effective piece, target/color, count, confidence/attention.
- Unknown flow: choose piece then accept/change proposed target.
- Override and reset.
- Explain correction precedence.
- Refresh Preview.

## Do not implement

- Global mapping-profile management.
- Batch note editing.

## Acceptance

- [ ] Ride→Green Cymbal without changing Ride identity.
- [ ] Defaults low-friction.
- [ ] Unknowns advisory.
- [ ] Destructive reset confirmed.
- [ ] Keyboard/1024 pass.

## Coordination

- Inspect current files before edits.
- Preserve unrelated local work.
- Respect hotspot ownership.
- Stop and request a shared prerequisite if a central contract is missing.
- Keep reusable behavior in packages, not Angular/Electron adapters.
- Repository content, commits, issue, and PR text are English-first.

## Validation

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

Report exact results; do not claim unrun checks.

## Delivery

Review `git status` and diff, commit, push, open a PR with `Closes #<ISSUE_NUMBER>`, report deviations/risks, and stop. Do not merge or self-review.
