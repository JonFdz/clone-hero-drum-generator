# Proposal: Phase 16B — Mapping Override Profiles

## Change ID

`phase-16b-mapping-override-profiles`

## Summary

Add local reusable mapping override profiles.

Profiles let users save a set of project mapping overrides and apply them to future projects without recreating the same mappings.

## Roadmap boundary

```txt
Phase 16A — Project Mapping Overrides
Phase 16B — Mapping Override Profiles
Phase 17  — Desktop Packaging/Distribution
```

Do not implement Phase 17 in this change.

## Branch

```txt
feat/phase-16b-mapping-override-profiles
```

## Docs path

```txt
docs/phases/16b-mapping-override-profiles/
```

No existing Phase 16B docs folder was found when this pack was generated.

## Goals

1. Add mapping override profile model.
2. Store profiles locally.
3. List profiles in the desktop UI.
4. Create profile from current project overrides.
5. Edit profile metadata.
6. Update profile from current project overrides.
7. Delete profile.
8. Apply profile to current project.
9. Support replace mode.
10. Support merge mode, with profile values winning conflicts.
11. Show conflict/overwrite summary.
12. Applying profile updates project mapping overrides.
13. Applying profile marks project dirty and output/preview stale.
14. Preserve Phase 16A project override behavior.
15. Preserve generation/validation/preview/highway/offset behavior.
16. Preserve Electron security boundaries.

## Non-goals

- No built-in Songsterr profiles.
- No cloud profile sync.
- No community profile database.
- No automatic source-profile detection.
- No ML mapping.
- No individual note editing.
- No manual note add/remove/move.
- No packaging/distribution.
- No full desktop UX polish pass.
- No external editor/Moonscraper dependency.

## Required docs to read

```txt
AGENTS.md
docs/desktop/README.md
docs/desktop/decisions.md
docs/desktop/mockup-corrections.md
docs/desktop/feature-inventory.md
docs/phases/16a-project-mapping-overrides/PRD.md
docs/phases/16a-project-mapping-overrides/ADR.md
docs/phases/16b-mapping-override-profiles/PRD.md
docs/phases/16b-mapping-override-profiles/ADR.md
docs/phases/16b-mapping-override-profiles/CHECKLIST.md
```

## Profile semantics

Profiles are local reusable templates.

Applying a profile copies overrides into the current project.

Profiles are not live-linked to projects.

## Apply modes

```txt
replace: project overrides become profile overrides
merge: profile overrides are added to project overrides; profile values win on conflicts
```

## Validation

Required:

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter @chdg/desktop build
pnpm --filter @chdg/desktop typecheck
pnpm chdg --help
```

Manual desktop validation:

```txt
create overrides
create profile from current overrides
restart app
profile persists
apply profile replace
apply profile merge
conflicts shown
project overrides update
preview/output stale state appears
generate/validation/preview/highway/offset still work
```

## Review policy

Final PR review is external and will be performed by Jon/ChatGPT.

The agent must not merge.
