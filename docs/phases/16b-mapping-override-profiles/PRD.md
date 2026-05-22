# PRD Phase 16B: Mapping Override Profiles

## Goal

Add local reusable mapping override profiles.

A user should be able to save a useful set of project mapping overrides as a named local profile, apply that profile to another project, and manage profiles without uploading source/audio/chart files anywhere.

## Roadmap context

```txt
Phase 16A — Project Mapping Overrides
Phase 16B — Mapping Override Profiles
Phase 17  — Desktop Packaging/Distribution
```

This phase is **16B only**.

## Existing docs path

Use:

```txt
docs/phases/16b-mapping-override-profiles/
```

No existing Phase 16B folder was found in the repo when this pack was generated, so this is the new docs path for Phase 16B.

## Why this exists

Phase 16A lets users fix mapping ambiguity per project.

After repeating the same fixes across multiple real files, users need a way to reuse those mappings without recreating them every time.

Profiles should reduce repetitive work while keeping project overrides explicit and inspectable.

## Source of truth

`docs/desktop/decisions.md` says:

```txt
Mapping profiles are Phase 16B, after observing real cases.
Songsterr profiles should be based on real repeated patterns, not invented too early.
```

Therefore Phase 16B should support user-created local profiles, but it should **not** ship invented Songsterr defaults yet.

## Profile model

Profiles are local reusable collections of mapping overrides.

A profile should include:

```txt
id
name
description
sourceKind scope: midi | gpif | any
overrides
createdAt
updatedAt
```

Recommended shape:

```ts
type MappingOverrideProfile = {
  id: string;
  name: string;
  description?: string;
  sourceKind?: "midi" | "gpif";
  overrides: ProjectMappingOverrides;
  createdAt: string;
  updatedAt: string;
};
```

Exact names can follow repo style.

## Relationship to project overrides

Project overrides remain the source of truth for generation.

Applying a profile should copy/merge profile overrides into the current project. Do **not** create a hidden live link where changing a profile silently changes existing projects.

Required behavior:

```txt
profile apply -> project mappingOverrides updated
generation uses project mappingOverrides
profile edit after apply does not silently mutate old projects
```

A project may optionally remember which profile was applied as metadata, but generation must not depend on resolving that profile later.

## Scope

- Add local mapping profile persistence.
- Store profiles locally in app settings/data, not inside every project by default.
- Add profile management UI:
  - list profiles;
  - create profile from current project overrides;
  - edit profile metadata;
  - delete profile;
  - apply profile to current project;
  - update/replace profile from current project overrides.
- Allow profile apply strategy:
  - replace current project overrides;
  - merge into current project overrides.
- Show conflict/overwrite summary before applying.
- Preserve Phase 16A project mapping overrides.
- Preserve `.chdg` compatibility.
- Preserve generation/normalization behavior by using project overrides after profile apply.
- Keep everything local/offline.
- Preserve Electron security boundaries.

## Non-goals

- No built-in Songsterr profiles yet.
- No cloud profile sync.
- No community profile database.
- No automatic source-profile detection.
- No ML mapping.
- No individual note editing.
- No manual note add/remove/move.
- No packaging/distribution.
- No full UX polish pass.
- No external editor/Moonscraper dependency.

## Profile storage

Use existing local settings/storage patterns where possible.

Recommended storage:

```txt
Electron app userData
mapping-profiles.json
```

or integrate into existing settings persistence if that is already the repo convention.

Do not store profiles in the Angular renderer filesystem.

Do not expose generic file write/read operations.

## Profile import/export

Optional for Phase 16B only if small and safe.

If included:

```txt
export selected profile as JSON
import profile JSON after validation
```

Import/export must be explicit user-selected file picker based, not automatic scanning.

If import/export would make the phase too large, defer it.

## UI requirements

Add a Profiles area reachable from Mapping.

Required UI:

```txt
profile list
profile name
source kind
override count
create from current project overrides
apply to project
merge or replace selection
update profile from current project overrides
delete profile
empty state
validation/status messages
```

When applying a profile, show:

```txt
profile override count
current project override count
number of conflicts/replacements
apply mode: merge or replace
```

Use clear copy:

```txt
Profiles are reusable local templates. Applying a profile copies its overrides into this project.
```

## Conflict behavior

Profile application should be deterministic.

Required modes:

```txt
replace: project overrides become profile overrides
merge: profile overrides are added to project overrides; profile values win on key conflicts
```

If another merge strategy is used, document it clearly and test it.

## Staleness behavior

Applying or updating project overrides from a profile should use the same staleness behavior as Phase 16A override edits:

```txt
mark project dirty
mark generated output needs-regenerate if output exists
mark normalization preview stale
show stale warning
```

## Validation

Validate profiles:

```txt
profile name is non-empty
profile id is stable/non-empty
sourceKind is midi/gpif/undefined
overrides are valid ProjectMappingOverrides
createdAt/updatedAt are strings
```

Malformed profiles should be ignored or surfaced as non-fatal warnings. They must not crash the app.

## Acceptance criteria

- Profile docs exist under `docs/phases/16b-mapping-override-profiles/`.
- User can create profile from current project overrides.
- User can list saved profiles.
- User can apply a profile to the current project.
- User can choose replace or merge mode.
- Conflicts are deterministic and visible.
- Applying a profile updates project overrides.
- Applying a profile marks project/output stale like normal override edits.
- User can delete a profile.
- Profiles persist locally across app restart.
- Existing project overrides still save/load in `.chdg`.
- Existing normalization/generation uses project overrides after profile apply.
- No built-in Songsterr profiles are added.
- No global cloud/community profile system is added.
