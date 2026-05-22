# ADR Phase 16B: Mapping Override Profiles

## Status

Proposed.

## Decision

Implement local reusable mapping override profiles.

Profiles are stored locally by the desktop app and can be applied to a project by copying their overrides into the project's `mappingOverrides`.

Profiles are not live-linked to projects.

## Roadmap boundary

```txt
Phase 16A — Project Mapping Overrides
Phase 16B — Mapping Override Profiles
```

Phase 16B builds on Phase 16A. It must not become a cloud/community profile system.

## Existing docs path

Use:

```txt
docs/phases/16b-mapping-override-profiles/
```

## Rationale

Project-level overrides solve individual projects. Profiles solve repeated mapping patterns across projects while keeping everything local and explicit.

Copy-on-apply is safer than live-linked profiles because:

```txt
projects remain self-contained
generation remains based on .chdg project overrides
profile edits cannot silently change old projects
debugging remains easier
```

## Decision details

A profile contains:

```txt
id
name
description
sourceKind
overrides
createdAt
updatedAt
```

Applying a profile supports:

```txt
replace
merge with profile values winning conflicts
```

## Storage decision

Profiles should be stored in local desktop app data or existing settings storage.

They should not be embedded into every project by default.

Projects can still be shared without requiring a global profile registry because applying a profile copies overrides into `.chdg`.

## Built-in profile decision

Do not ship built-in Songsterr profiles in Phase 16B.

Real repeated patterns should be observed before adding named presets.

## Import/export decision

Import/export is optional for this phase. If implemented, it must be explicit, local, validated JSON. It must not require cloud services.

## Security decision

Do not add renderer filesystem access.

Use the existing Electron bridge/settings storage pattern and explicit file picker bridge if import/export is included.

## Non-goals

- No cloud sync.
- No community profile database.
- No built-in Songsterr presets.
- No automatic profile detection.
- No ML mapping.
- No individual note editing.
- No packaging/distribution.
- No broad UX polish pass.

## Constraints

- Keep everything local/offline.
- Preserve Phase 16A project override behavior.
- Preserve generation/validation/preview/highway/offset behavior.
- Keep PR scoped to Phase 16B.
- Final PR review is external.
- PRs must not be merged without explicit approval.
